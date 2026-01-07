
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DictationButton } from './DictationButton';

interface SymptomInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const SymptomInput: React.FC<SymptomInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
  const { t } = useLanguage();

  const handleVoiceTranscript = (text: string) => {
    // Create a mock event to update the state via the provided onChange handler
    const event = {
        target: { value: text }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="symptoms" className="block text-lg font-semibold text-slate-700">
            {t('symptomChecker.inputLabel')}
        </label>
        <DictationButton onTranscript={handleVoiceTranscript} />
      </div>
      <div className="relative">
        <textarea
            id="symptoms"
            value={value}
            onChange={onChange}
            disabled={isLoading}
            placeholder={t('symptomChecker.inputPlaceholder')}
            className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 disabled:bg-slate-100 resize-none"
        />
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-cyan-400 disabled:cursor-not-allowed transition-colors duration-300"
      >
        {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('symptomChecker.buttonAnalyzing')}
            </>
        ) : (
            <>
                <SearchIcon className="w-5 h-5" />
                {t('symptomChecker.buttonCheck')}
            </>
        )}
      </button>
    </div>
  );
};
