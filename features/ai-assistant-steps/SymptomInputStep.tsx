
import React from 'react';
import { SymptomInput } from '../../components/SymptomInput';

interface SymptomInputStepProps {
    symptoms: string;
    setSymptoms: (s: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    error: string | null;
}

export const SymptomInputStep: React.FC<SymptomInputStepProps> = ({ symptoms, setSymptoms, onSubmit, isLoading, error }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <SymptomInput 
            value={symptoms} 
            onChange={(e) => setSymptoms(e.target.value)} 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
        />
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
    </div>
);
