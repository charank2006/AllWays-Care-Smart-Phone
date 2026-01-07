
import React from 'react';
import type { SymptomAnalysis } from '../../types';
import { ResultDisplay } from '../../components/ResultDisplay';

interface SymptomAnalysisStepProps {
    analysis: SymptomAnalysis;
    onNext: (specialty: string) => void;
    isResourcesLoading?: boolean;
}

export const SymptomAnalysisStep: React.FC<SymptomAnalysisStepProps> = ({ analysis, onNext, isResourcesLoading }) => (
    <div>
        <ResultDisplay analysis={analysis} />
        <div className="mt-4 text-center">
            <button 
                onClick={() => onNext(analysis.suggestedSpecialty)} 
                className="bg-cyan-600 text-white font-black py-4 px-10 rounded-[20px] hover:bg-cyan-700 shadow-xl active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
                {isResourcesLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        FINDING {analysis.suggestedSpecialty.toUpperCase()}...
                    </>
                ) : (
                    <>
                        NEXT: FIND A {analysis.suggestedSpecialty.toUpperCase()} &rarr;
                    </>
                )}
            </button>
            {isResourcesLoading && (
                <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Searching in background...</p>
            )}
        </div>
    </div>
);
