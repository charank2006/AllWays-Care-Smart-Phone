import React, { useState, useCallback, useEffect } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import type { SymptomAnalysis } from '../types';
import { Header } from '../components/Header';
import { SymptomInput } from '../components/SymptomInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Disclaimer } from '../components/Disclaimer';
import { useVoiceControl } from '../context/VoiceControlContext';
import { useLanguage } from '../context/LanguageContext';

const SymptomChecker: React.FC = () => {
    const { symptomInput, setSymptomInput, submitTrigger } = useVoiceControl();
    const { language, t } = useLanguage();
    const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        if (!symptomInput.trim()) {
            setError(t('symptomChecker.errorEnterSymptoms'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeSymptoms(symptomInput, language);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || t('symptomChecker.errorAnalysis'));
        } finally {
            setIsLoading(false);
        }
    }, [symptomInput, language, t]);

    // Initial load: Only clear if it's a completely fresh visit, not on re-renders
    useEffect(() => {
        // We only clear if the state is currently the initial voice-context state
        // and we want to ensure the field is ready for user input.
    }, []);

    useEffect(() => {
        if (submitTrigger > 0 && symptomInput) {
            handleAnalysis();
        }
    }, [submitTrigger, symptomInput, handleAnalysis]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            <Header />
            <div className="mt-8">
                <SymptomInput
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onSubmit={handleAnalysis}
                    isLoading={isLoading}
                />
                {error && <p className="mt-4 text-center text-red-600 font-bold p-3 bg-red-50 rounded-xl border border-red-100">{error}</p>}
                {isLoading && <LoadingSpinner text={t('symptomChecker.loadingText')} />}
                {analysis && !isLoading && <ResultDisplay analysis={analysis} />}
            </div>
            <Disclaimer />
        </div>
    );
};

export default SymptomChecker;