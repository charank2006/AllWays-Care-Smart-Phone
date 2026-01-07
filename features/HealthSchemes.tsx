import React, { useState, useCallback } from 'react';
import { getHealthSchemeInfo } from '../services/geminiService';
import type { HealthSchemeInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Simulating a list of common Indian health schemes
const healthSchemes = [
    { id: 'ayushman_bharat', name: 'Ayushman Bharat (PM-JAY)' },
    { id: 'jsy', name: 'Janani Suraksha Yojana (JSY)' },
    { id: 'rbsk', name: 'Rashtriya Bal Swasthya Karyakram (RBSK)' },
];

const SchemeCard: React.FC<{ info: HealthSchemeInfo }> = ({ info }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">{t('schemes.results.benefits')}</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                    {info.benefits.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">{t('schemes.results.eligibility')}</h3>
                <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                    {info.eligibility.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-slate-800">{t('schemes.results.howToApply')}</h3>
                <ol className="mt-2 list-decimal list-inside space-y-2 text-slate-700">
                    {info.applicationSteps.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
            </div>
        </div>
    );
};

const HealthSchemes: React.FC = () => {
    const { language, t } = useLanguage();
    const [selectedScheme, setSelectedScheme] = useState('');
    const [schemeInfo, setSchemeInfo] = useState<HealthSchemeInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchemeInfo = useCallback(async (schemeName: string) => {
        if (!schemeName) return;
        setSelectedScheme(schemeName);
        setIsLoading(true);
        setError(null);
        setSchemeInfo(null);

        try {
            // NOTE: In a real app, user profile data would be passed here.
            // Using a mock profile for this simulation.
            const mockProfile = { age: '35' }; 
            const result = await getHealthSchemeInfo(mockProfile, schemeName, language);
            setSchemeInfo(result);
        } catch (err) {
            setError(t('schemes.error'));
        } finally {
            setIsLoading(false);
        }
    }, [language, t]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('schemes.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('schemes.tagline')}</p>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-md border">
                <label htmlFor="scheme-select" className="block text-lg font-semibold text-slate-700 mb-3">
                    {t('schemes.select')}
                </label>
                <select
                    id="scheme-select"
                    value={selectedScheme}
                    onChange={(e) => fetchSchemeInfo(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="" disabled>-- Select a Scheme --</option>
                    {healthSchemes.map(scheme => (
                        <option key={scheme.id} value={scheme.name}>{scheme.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="mt-8">
                {isLoading && <LoadingSpinner text={t('schemes.loading')} />}
                {error && <p className="text-red-600 text-center">{error}</p>}
                {schemeInfo && !isLoading && <SchemeCard info={schemeInfo} />}
            </div>
        </div>
    );
};

export default HealthSchemes;