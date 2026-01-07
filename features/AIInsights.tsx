
import React, { useState, useCallback } from 'react';
import { getHolisticInsights } from '../services/geminiService';
import type { HolisticInsight } from '../types';
import { useLanguage } from '../context/LanguageContext';

const ThemesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 002 2h5a2 2 0 012 2v5a2 2 0 01-2 2h-5a2 2 0 01-2-2v-5a2 2 0 00-2-2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>;
const ConnectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const SuggestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const AIInsights: React.FC = () => {
    const [journal, setJournal] = useState('');
    const [insight, setInsight] = useState<HolisticInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const handleGetInsights = useCallback(async () => {
        if (!journal.trim()) {
            setError('Please write about how you\'ve been feeling.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setInsight(null);
        try {
            const result = await getHolisticInsights(journal, language);
            setInsight(result);
        } catch (err) {
            setError('Failed to get insights from AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [journal, language]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Holistic Health Insights</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">Reflect on your well-being and let AI find connections.</p>
            
            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="journal" className="block text-lg font-semibold text-slate-700 mb-2">
                    How have you been feeling lately, both physically and mentally?
                </label>
                <textarea
                    id="journal"
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., 'I've been feeling tired this week and my sleep hasn't been great. I've also had a nagging headache and felt a bit stressed from work...'"
                    className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 transition duration-200"
                />
                <button
                    onClick={handleGetInsights}
                    disabled={isLoading}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors"
                >
                    {isLoading ? 'Generating Insights...' : 'Generate Insights'}
                </button>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

            {isLoading && (
                <div className="text-center my-8">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600">AI is reflecting on your entry...</p>
                </div>
            )}

            {insight && (
                <div className="mt-8 space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <ThemesIcon />
                            <h3 className="text-xl font-bold text-slate-800">Key Themes</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                           {insight.keyThemes.map((theme, i) => <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{theme}</span>)}
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                           <ConnectIcon />
                           <h3 className="text-xl font-bold text-slate-800">Potential Connections</h3>
                        </div>
                        <ul className="mt-3 space-y-2 text-slate-700">
                            {insight.potentialConnections.map((conn, i) => <li key={i} className="flex items-start"><span className="mr-2">&#8227;</span><span>{conn}</span></li>)}
                        </ul>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                        <div className="flex items-center gap-3">
                            <SuggestionIcon />
                            <h3 className="text-xl font-bold text-slate-800">Gentle Suggestions</h3>
                        </div>
                         <ul className="mt-3 space-y-2 text-slate-700">
                            {insight.gentleSuggestions.map((sug, i) => (
                                <li key={i} className="flex items-center">
                                    <span className="w-4 h-4 mr-3 bg-green-100 border-2 border-green-300 rounded-sm flex-shrink-0"></span>
                                    <span>{sug}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInsights;
