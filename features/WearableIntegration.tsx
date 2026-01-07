import React, { useState, useCallback, useEffect } from 'react';
import { analyzeWearableData } from '../services/geminiService';
import type { WearableData, WearableInsight, FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFamilyStore } from '../App';

const StepsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const SleepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;

const WearableIntegration: React.FC = () => {
    const [data, setData] = useState<WearableData>({ steps: '', sleepHours: '', restingHeartRate: '' });
    const [insight, setInsight] = useState<WearableInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language, t } = useLanguage();
    const { actions } = useFamilyStore();
    const currentUserProfile: FamilyMember = { id: 'currentUser', name: t('familyHub.myProfile'), relationship: 'Me', age: '', avatar: '👤' };
    const selectedMember = useFamilyStore(state => actions.getSelectedMember(currentUserProfile));
    
    const storageKey = `medfinder-wearable-data-${selectedMember.id}`;

    useEffect(() => {
        // Load data for the currently selected member
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            setData(JSON.parse(storedData));
        } else {
            setData({ steps: '', sleepHours: '', restingHeartRate: '' });
        }
        setInsight(null); // Clear previous insights when member changes
        setError(null);
    }, [selectedMember.id, storageKey]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAnalyze = useCallback(async () => {
        if (!data.steps || !data.sleepHours || !data.restingHeartRate) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setInsight(null);
        try {
            // Save the data to localStorage for the current member before analyzing
            localStorage.setItem(storageKey, JSON.stringify(data));
            const result = await analyzeWearableData(data, language);
            setInsight(result);
        } catch (err) {
            setError('Failed to get AI analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [data, language, storageKey]);
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Wearable Data Insights</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">
                Enter daily stats to get a personalized AI analysis. <span className="font-semibold text-cyan-700">For: {selectedMember.name}</span>
            </p>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="steps" className="block text-sm font-medium text-slate-700">Steps Taken</label>
                        <input type="number" name="steps" id="steps" value={data.steps} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 8500" />
                    </div>
                    <div>
                        <label htmlFor="sleepHours" className="block text-sm font-medium text-slate-700">Hours of Sleep</label>
                        <input type="number" name="sleepHours" id="sleepHours" value={data.sleepHours} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 7.5" />
                    </div>
                    <div>
                        <label htmlFor="restingHeartRate" className="block text-sm font-medium text-slate-700">Resting Heart Rate (bpm)</label>
                        <input type="number" name="restingHeartRate" id="restingHeartRate" value={data.restingHeartRate} onChange={handleInputChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 65" />
                    </div>
                </div>
                 <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors"
                >
                    {isLoading ? 'Analyzing...' : `Analyze ${selectedMember.name}'s Data`}
                </button>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            
            {isLoading && (
                 <div className="text-center my-8">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600">AI is analyzing your data...</p>
                </div>
            )}

            {insight && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">Your AI Insight for {selectedMember.name}</h2>
                    <div className="mt-4 p-4 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg">
                        <h3 className="text-xl font-bold text-cyan-800">{insight.headline}</h3>
                        <p className="mt-2 text-slate-700">{insight.detail}</p>
                    </div>
                    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <h4 className="font-bold text-green-800">Suggestion</h4>
                        <p className="text-green-700">{insight.suggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WearableIntegration;