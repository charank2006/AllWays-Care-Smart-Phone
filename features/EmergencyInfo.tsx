
import React, { useState, useCallback } from 'react';
import { getEmergencyAdvice } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const EmergencyInfo: React.FC = () => {
    const { language, t } = useLanguage();
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);

    const emergencyTopics = [
        { id: 'stroke', title: t('emergencyInfo.topics.stroke') },
        { id: 'choking', title: t('emergencyInfo.topics.choking') },
        { id: 'allergic_reaction', title: t('emergencyInfo.topics.allergicReaction') },
        { id: 'severe_bleeding', title: t('emergencyInfo.topics.severeBleeding') },
    ];

    const fetchAdvice = useCallback(async (topic: string, title: string) => {
        setIsLoading(true);
        setError(null);
        setAdvice('');
        setActiveTopic(title);
        try {
            const result = await getEmergencyAdvice(topic, language);
            setAdvice(result);
        } catch (err) {
            setError(t('emergencyInfo.errorFetch'));
        } finally {
            setIsLoading(false);
        }
    }, [language, t]);
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-r-lg shadow-md">
                <div className="flex">
                    <div className="py-1"><AlertTriangleIcon className="h-8 w-8 text-red-600 mr-4" /></div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('emergencyInfo.title')}</h1>
                        <p className="mt-2" dangerouslySetInnerHTML={{ __html: t('emergencyInfo.description') }} />
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">{t('emergencyInfo.guidanceTitle')}</h2>
                <p className="text-slate-600 mt-1">{t('emergencyInfo.guidanceDescription')}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                    {emergencyTopics.map(topic => (
                        <button key={topic.id} onClick={() => fetchAdvice(topic.title, topic.title)} disabled={isLoading} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors">
                            {topic.title}
                        </button>
                    ))}
                </div>
            </div>
            
            {(isLoading || error || advice) && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    {isLoading && (
                        <div className="flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="ml-3 text-slate-600">{t('emergencyInfo.loadingText', { topic: activeTopic || '' })}</p>
                        </div>
                    )}
                    {error && <p className="text-red-600 text-center">{error}</p>}
                    {advice && !isLoading && (
                        <div className="prose max-w-none text-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('emergencyInfo.guidanceFor', { topic: activeTopic || '' })}</h3>
                            {advice.split('\n').map((line, index) => <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencyInfo;
