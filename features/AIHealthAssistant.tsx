
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { View, SymptomAnalysis, MedicalResource, BookedAppointment, AppointmentPrep, HealthRecordAnalysis, JourneyStep, FamilyMember } from '../types';
import { analyzeSymptoms, findMedicalResources, analyzeHealthRecord, getMedicineInfo, getAppointmentPrep } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useCart } from '../hooks/useCart';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoiceControl } from '../context/VoiceControlContext';
import { speak } from '../utils/tts';
import { JourneyStepper } from '../components/JourneyStepper';
import { StartStep } from './ai-assistant-steps/StartStep';
import { SymptomInputStep } from './ai-assistant-steps/SymptomInputStep';
import { SymptomAnalysisStep } from './ai-assistant-steps/SymptomAnalysisStep';
import { ResourceFinderStep } from './ai-assistant-steps/ResourceFinderStep';
import { AppointmentBookingStep } from './ai-assistant-steps/AppointmentBookingStep';
import { BookingConfirmationStep } from './ai-assistant-steps/BookingConfirmationStep';
import { PrepInputStep } from './ai-assistant-steps/PrepInputStep';
import { AppointmentPrepStep } from './ai-assistant-steps/AppointmentPrepStep';
import { RecordUploadStep } from './ai-assistant-steps/RecordUploadStep';
import { RecordAnalysisStep } from './ai-assistant-steps/RecordAnalysisStep';
import { useFamilyStore } from '../App';

interface AIHealthAssistantProps {
    setActiveView: (view: View) => void;
    isLowConnectivity: boolean;
}

const AIHealthAssistant: React.FC<AIHealthAssistantProps> = ({ setActiveView, isLowConnectivity }) => {
    const { language, t, speechCode } = useLanguage();
    const { settings } = useAccessibility();
    const { addNotification } = useNotifications();
    const { actions } = useFamilyStore();
    
    const currentUserProfile: FamilyMember = { id: 'currentUser', name: t('familyHub.myProfile'), relationship: 'Me', age: '', avatar: '👤' };
    const selectedMember = useFamilyStore(state => actions.getSelectedMember(currentUserProfile));
    
    const [journeyStep, setJourneyStep] = useState<JourneyStep>('start');
    const [isLoading, setIsLoading] = useState(false);
    const [resourcesLoading, setResourcesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [symptoms, setSymptoms] = useState('');
    const [symptomAnalysis, setSymptomAnalysis] = useState<SymptomAnalysis | null>(null);
    const [resources, setResources] = useState<MedicalResource[]>([]);
    const [selectedResource, setSelectedResource] = useState<MedicalResource | null>(null);
    const [bookedAppointment, setBookedAppointment] = useState<BookedAppointment | null>(null);
    const [appointmentPrep, setAppointmentPrep] = useState<AppointmentPrep | null>(null);
    const [healthRecordAnalysis, setHealthRecordAnalysis] = useState<HealthRecordAnalysis | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const handleFindResources = useCallback(async (specialty: string, changeStep: boolean = true) => {
        if (changeStep) {
            if (resources.length > 0 && journeyStep === 'symptom_analysis') {
                setJourneyStep('resource_finder');
                return;
            }
            setJourneyStep('resource_finder');
        }
        
        setResourcesLoading(true);
        setError(null);
        try {
            const results = await findMedicalResources(specialty, language);
            if (isMounted.current) setResources(results);
        } catch (err) {
            if (changeStep && isMounted.current) setError(t('resourceFinder.errorFetch'));
        } finally {
            if (isMounted.current) setResourcesLoading(false);
        }
    }, [language, t, resources.length, journeyStep]);

    const handleSymptomAnalysis = useCallback(async (providedSymptoms?: string) => {
        const inputSymptoms = providedSymptoms || symptoms;
        if (!inputSymptoms.trim()) {
            setError(t('symptomChecker.errorEnterSymptoms'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setSymptomAnalysis(null);
        try {
            const result = await analyzeSymptoms(inputSymptoms, language);
            if (isMounted.current) {
                setSymptomAnalysis(result);
                setJourneyStep('symptom_analysis');
                handleFindResources(result.suggestedSpecialty, false);
                speak(`Analysis complete. I recommend seeing a ${result.suggestedSpecialty}.`, speechCode);
            }
        } catch (err) {
            if (isMounted.current) setError(t('symptomChecker.errorAnalysis'));
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [symptoms, language, t, speechCode, handleFindResources]);

    useEffect(() => {
        const handleAiTrigger = (e: any) => {
            const { type, value, index, name } = e.detail;
            if (type === 'SYMPTOMS') {
                setSymptoms(value);
                handleSymptomAnalysis(value);
            } else if (type === 'SELECT') {
                if (journeyStep === 'resource_finder' && resources.length > 0) {
                    const selected = (index !== undefined && resources[index]) || resources[0];
                    setSelectedResource(selected);
                    setJourneyStep('appointment_booking');
                }
            } else if (type === 'ACTION') {
                if (value === 'BOOK_APPOINTMENT' && journeyStep === 'symptom_analysis' && symptomAnalysis) {
                    handleFindResources(symptomAnalysis.suggestedSpecialty);
                }
                if (value === 'GO_BACK') resetJourney();
            }
        };
        window.addEventListener('ai_trigger', handleAiTrigger);
        return () => window.removeEventListener('ai_trigger', handleAiTrigger);
    }, [journeyStep, resources, symptomAnalysis, handleSymptomAnalysis, handleFindResources]);

    const handleProceedToBooking = (resource: MedicalResource) => {
        setSelectedResource(resource);
        setJourneyStep('appointment_booking');
    };

    const handleAppointmentBooking = (appointment: Omit<BookedAppointment, 'forMemberId' | 'forMemberName'>) => {
        const fullAppointment: BookedAppointment = {
            ...appointment,
            forMemberId: selectedMember.id,
            forMemberName: selectedMember.name,
        };
        setBookedAppointment(fullAppointment);
        addNotification({
            type: 'reminder',
            message: `Confirmed: ${appointment.doctor.name} at ${appointment.resource.name}.`
        });
        setJourneyStep('booking_confirmation');
    };
    
    const handleGetAppointmentPrep = useCallback(async (concern: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getAppointmentPrep(concern, language);
            if (isMounted.current) {
                setAppointmentPrep(result);
                setJourneyStep('appointment_prep');
            }
        } catch (err) {
            if (isMounted.current) setError('Failed to get prep advice.');
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [language]);
    
    const handleRecordAnalysis = useCallback(async (recordText: string, image?: {data: string, mimeType: string}) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyzeHealthRecord(recordText, language, image);
            if (isMounted.current) {
                setHealthRecordAnalysis(result);
                setJourneyStep('record_analysis');
            }
        } catch (err) {
             if (isMounted.current) setError('Failed to analyze the health record.');
        } finally {
            if (isMounted.current) setIsLoading(false);
        }
    }, [language]);

    const resetJourney = () => {
        setJourneyStep('start');
        setSymptoms('');
        setSymptomAnalysis(null);
        setResources([]);
        setSelectedResource(null);
        setBookedAppointment(null);
        setAppointmentPrep(null);
        setHealthRecordAnalysis(null);
        setError(null);
        setResourcesLoading(false);
    };

    const renderCurrentStep = () => {
        switch (journeyStep) {
            case 'start': return <StartStep setStep={setJourneyStep} />;
            case 'symptom_input': return <SymptomInputStep symptoms={symptoms} setSymptoms={setSymptoms} onSubmit={() => handleSymptomAnalysis()} isLoading={isLoading} error={error} />;
            case 'symptom_analysis': return symptomAnalysis && <SymptomAnalysisStep analysis={symptomAnalysis} onNext={handleFindResources} isResourcesLoading={resourcesLoading} />;
            case 'resource_finder': return <ResourceFinderStep resources={resources} onBookResource={handleProceedToBooking} isLowConnectivity={isLowConnectivity} isLoading={resourcesLoading} />;
            case 'appointment_booking': return selectedResource && <AppointmentBookingStep resource={selectedResource} initialSpecialty={symptomAnalysis?.suggestedSpecialty || ''} onBooked={handleAppointmentBooking} onClose={() => setJourneyStep('resource_finder')} />;
            case 'booking_confirmation': return bookedAppointment && <BookingConfirmationStep appointment={bookedAppointment} onDownload={() => {}} onNext={() => handleGetAppointmentPrep(`${symptoms}`)} />;
            case 'prep_input': return <PrepInputStep onNext={handleGetAppointmentPrep} isLoading={isLoading} error={error} />;
            case 'appointment_prep': return appointmentPrep && <AppointmentPrepStep prep={appointmentPrep} onNext={() => setJourneyStep('record_upload')} isLoading={isLoading} />;
            case 'record_upload': return <RecordUploadStep onAnalyze={handleRecordAnalysis} isLoading={isLoading} error={error} fileInputRef={fileInputRef} />;
            case 'record_analysis': return healthRecordAnalysis && <RecordAnalysisStep analysis={healthRecordAnalysis} onNext={() => setActiveView('cart')} onReset={resetJourney} />;
            default: return <p>Something went wrong.</p>;
        }
    };
    
    const showStepper = useMemo(() => !['start', 'prep_input', 'appointment_booking'].includes(journeyStep), [journeyStep]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="flex justify-between items-start mb-4 pr-12">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t('sidebar.aiHealthAssistant')}</h1>
                    <p className="mt-1 text-base sm:text-lg text-slate-600">
                        {t('dashboard.aiAssistant.desc')} <span className="font-semibold text-cyan-700">Patient: {selectedMember.name}</span>
                    </p>
                </div>
                {journeyStep !== 'start' && (
                    <button onClick={resetJourney} className="text-sm font-semibold text-cyan-700 hover:underline flex-shrink-0 ml-2">{t('aiAssistant.startOver')}</button>
                )}
            </div>
            {showStepper && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8 overflow-x-auto">
                    <JourneyStepper currentStep={journeyStep} />
                </div>
            )}
            <div className="animate-fade-in">
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default AIHealthAssistant;
