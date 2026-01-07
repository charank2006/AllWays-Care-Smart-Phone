
import React from 'react';
import type { AppointmentPrep } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface AppointmentPrepStepProps {
    prep: AppointmentPrep;
    onNext: () => void;
    isLoading: boolean;
}

export const AppointmentPrepStep: React.FC<AppointmentPrepStepProps> = ({ prep, onNext, isLoading }) => {
    if (isLoading) return <LoadingSpinner text="Generating prep advice..."/>
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">Suggested Specialist: <span className="text-cyan-700">{prep.specialist.type}</span></h3>
                <p className="mt-1 text-slate-700">{prep.specialist.reason}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">Questions to Ask</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                    {prep.questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">How to Describe Symptoms</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                    {prep.symptomTips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
            </div>
            <button onClick={onNext} className="w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700">
                I've had my appointment, what's next? &rarr;
            </button>
        </div>
    );
};
