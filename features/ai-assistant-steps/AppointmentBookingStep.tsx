
import React, { useState, useCallback, useEffect } from 'react';
import type { Doctor, MedicalResource, BookedAppointment } from '../../types';
import { getAvailableDoctors } from '../../services/geminiService';
import { useLanguage } from '../../context/LanguageContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { DatePicker } from '../../components/DatePicker';

const specialties = ['Cardiologist', 'Dermatologist', 'General Practitioner', 'Neurologist', 'Orthopedist', 'Pediatrician'];
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface AppointmentBookingStepProps {
    resource: MedicalResource;
    initialSpecialty: string;
    onBooked: (a: BookedAppointment) => void;
    onClose: () => void;
}

export const AppointmentBookingStep: React.FC<AppointmentBookingStepProps> = ({ resource, initialSpecialty, onBooked, onClose }) => {
    const { language } = useLanguage();
    const [specialty, setSpecialty] = useState(initialSpecialty || '');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDoctors = useCallback(async (spec: string, date: Date) => {
        if (!spec) return;
        setIsLoading(true);
        setError(null);
        try {
            const results = await getAvailableDoctors(spec, resource.name, date.toLocaleDateString('en-CA'), language);
            setDoctors(results);
            if (results.length > 0) setSelectedDoctor(results[0]);
        } catch (e) {
            setError('Failed to fetch doctors.');
        } finally {
            setIsLoading(false);
        }
    }, [resource.name, language]);

    useEffect(() => {
        fetchDoctors(specialty, selectedDate);
    }, [specialty, selectedDate, fetchDoctors]);

    const handleConfirm = useCallback(() => {
        if (!selectedDoctor || !selectedTime || !specialty) return;
        onBooked({
            id: new Date().toISOString(), resource, doctor: selectedDoctor, specialty,
            date: selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: selectedTime,
            forMemberId: 'currentUser', forMemberName: 'Me'
        });
    }, [selectedDoctor, selectedTime, specialty, selectedDate, resource, onBooked]);

    // VOICE SELECTION
    useEffect(() => {
        const handleAiTrigger = (e: any) => {
            const { type, index } = e.detail;
            if (type === 'SELECT' && selectedDoctor && selectedDoctor.availableSlots[index]) {
                setSelectedTime(selectedDoctor.availableSlots[index]);
            }
            if (type === 'ACTION' && e.detail.value === 'SUBMIT_FORM') {
                handleConfirm();
            }
        };
        window.addEventListener('ai_trigger', handleAiTrigger);
        return () => window.removeEventListener('ai_trigger', handleAiTrigger);
    }, [selectedDoctor, handleConfirm]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-slate-800">Booking: {resource.name}</h2><button onClick={onClose}><CloseIcon /></button></header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="specialty" className="block text-sm font-bold text-slate-500 uppercase mb-2">1. Specialty</label>
                            <select id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
                                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">2. Date</label>
                            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">3. Select Slot</h3>
                        {isLoading ? <LoadingSpinner text="Finding slots..."/> : (
                            <div className="space-y-4">
                                {doctors.map(doc => (
                                    <div key={doc.id} className={`p-4 border rounded-xl ${selectedDoctor?.id === doc.id ? 'border-cyan-500 bg-cyan-50' : ''}`}>
                                        <p className="font-bold text-slate-900 mb-2">{doc.name}</p>
                                        <div className="flex flex-wrap gap-2">{doc.availableSlots.map((slot, i) => (<button key={slot} onClick={() => setSelectedTime(slot)} className={`px-4 py-2 text-sm rounded-lg font-bold transition-all ${selectedTime === slot ? 'bg-cyan-600 text-white' : 'bg-white border hover:bg-slate-50'}`}>{slot}</button>))}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={handleConfirm} disabled={!selectedTime} className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 disabled:bg-slate-300 shadow-lg active:scale-95 transition-all">
                        {selectedTime ? `CONFIRM BOOKING FOR ${selectedTime}` : 'CHOOSE A TIME SLOT'}
                    </button>
                </main>
            </div>
        </div>
    );
};
