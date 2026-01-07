import React, { useState, useEffect, useCallback } from 'react';
import { getHealthTips } from '../services/geminiService';
import type { HealthTipsResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';

const LightbulbIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const RefreshIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120 12M20 20l-1.5-1.5A9 9 0 004 12" />
    </svg>
);


const HealthTips: React.FC = () => {
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const fetchTips = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setIsLoading(true);
    setError(null);
    try {
      const response: HealthTipsResponse = await getHealthTips(language);
      setTips(response.tips);
    } catch (err) {
      setError(t('healthTips.error'));
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex justify-between items-center pr-12">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t('healthTips.title')}</h1>
                <p className="mt-1 text-base sm:text-lg text-slate-600">{t('healthTips.tagline')}</p>
            </div>
            <button
                onClick={() => fetchTips(true)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white text-cyan-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                aria-label={t('healthTips.refreshAriaLabel')}
            >
                <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('healthTips.refresh')}</span>
            </button>
        </div>

        <div className="mt-8">
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tips.map((tip, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <LightbulbIcon className="w-6 h-6 text-yellow-500" />
                            </div>
                            <p className="text-slate-700">{tip}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default HealthTips;