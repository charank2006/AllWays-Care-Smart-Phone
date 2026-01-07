
import React from 'react';
import type { HealthRecordAnalysis } from '../../types';

interface RecordAnalysisStepProps {
    analysis: HealthRecordAnalysis;
    onNext: () => void;
    onReset: () => void;
}

export const RecordAnalysisStep: React.FC<RecordAnalysisStepProps> = ({ analysis, onNext, onReset }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold text-slate-800">AI Report Analysis</h2>
        {analysis.prescribedMedications.length > 0 && (
            <div className="my-4 p-4 bg-green-50 border-l-4 border-green-500">
                <h4 className="font-bold text-green-800">Automation Complete</h4>
                <p className="text-green-700">{analysis.prescribedMedications.length} medication(s) added to your cart and reminders have been set.</p>
            </div>
        )}
        <div className="prose max-w-none mt-4 text-slate-700">
            <h3 className="font-bold text-slate-800">Explanation:</h3>
            <div className="text-slate-700">{analysis.explanation.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
        {analysis.prescribedMedications.length > 0 && (
            <div className="mt-4">
                <h3 className="font-bold text-slate-800">Extracted Prescriptions:</h3>
                <ul className="list-disc list-inside mt-2 text-slate-700">
                    {analysis.prescribedMedications.map((m, i) => <li key={i}><strong className="text-slate-900">{m.name}</strong> - {m.dosage}, {m.frequency}</li>)}
                </ul>
            </div>
        )}
         <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={onReset} className="flex-1 w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">Start a New Journey</button>
            <button onClick={onNext} className="flex-1 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700">View My Cart &rarr;</button>
        </div>
    </div>
);
