
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DictationButton } from '../../components/DictationButton';

interface PrepInputStepProps {
    onNext: (concern: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const PrepInputStep: React.FC<PrepInputStepProps> = ({ onNext, isLoading, error }) => {
    const { t } = useLanguage();
    const [concern, setConcern] = useState('');

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">{t('aiAssistant.prep.title')}</h2>
            <div className="mt-4 relative">
                <input
                    type="text"
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder={t('aiAssistant.prep.placeholder')}
                    className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <DictationButton onTranscript={(text) => setConcern(text)} />
                </div>
            </div>
            <button
                onClick={() => onNext(concern)}
                disabled={isLoading || !concern.trim()}
                className="mt-4 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400"
            >
                {isLoading ? 'Generating...' : t('aiAssistant.prep.button')}
            </button>
            {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>
    );
};
