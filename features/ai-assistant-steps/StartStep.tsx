
import React from 'react';
import type { JourneyStep } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const SymptomsIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RecordIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PrepIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;

interface StartStepProps {
    setStep: (step: JourneyStep) => void;
}

export const StartStep: React.FC<StartStepProps> = ({ setStep }) => {
    const { t } = useLanguage();
    
    const journeyOptions = [
        {
            icon: <SymptomsIcon />,
            title: t('aiAssistant.start.symptoms.title'),
            description: t('aiAssistant.start.symptoms.desc'),
            step: 'symptom_input' as JourneyStep,
        },
        {
            icon: <RecordIcon />,
            title: t('aiAssistant.start.record.title'),
            description: t('aiAssistant.start.record.desc'),
            step: 'record_upload' as JourneyStep,
        },
        {
            icon: <PrepIcon />,
            title: t('aiAssistant.start.prep.title'),
            description: t('aiAssistant.start.prep.desc'),
            step: 'prep_input' as JourneyStep,
        },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 text-center">{t('aiAssistant.start.title')}</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {journeyOptions.map(option => (
                    <button
                        key={option.step}
                        onClick={() => setStep(option.step)}
                        className="p-6 bg-slate-50 rounded-lg text-left hover:bg-cyan-50 hover:shadow-md transition-all border border-slate-200"
                    >
                        {option.icon}
                        <h3 className="mt-3 text-lg font-bold text-slate-800">{option.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
