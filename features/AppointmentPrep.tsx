import React, { useState, useCallback } from 'react';
import type { AppointmentPrep } from '../types';
import { getAppointmentPrep } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const AppointmentPrep: React.FC = () => {
    const { language } = useLanguage();
    const [concern, setConcern] = useState('');
    const [prep, setPrep] = useState<AppointmentPrep | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!concern.trim()) {
            setError('Please enter a topic or concern.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPrep(null);
        try {
            const result = await getAppointmentPrep(concern, language);
            setPrep(result);
        } catch (err) {
            setError('Failed to generate preparation guide.');
        } finally {
            setIsLoading(false);
        }
    }, [concern, language]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Appointment Preparation</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">Get AI-powered tips and questions for your next doctor's visit.</p>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="concern" className="block text-lg font-semibold text-slate-700 mb-2">
                    What is the appointment for?
                </label>
                <input
                    id="concern"
                    type="text"
                    value={concern}
                    onChange={(e) => setConcern(e.target.value)}
                    placeholder="e.g., 'Annual check-up' or 'Follow-up for knee pain'"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !concern.trim()}
                    className="mt-4 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400"
                >
                    {isLoading ? 'Generating...' : 'Generate Prep Guide'}
                </button>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            {isLoading && <LoadingSpinner text="Generating your guide..." />}

            {prep && !isLoading && (
                <div className="mt-8 space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-md border">
                        <h3 className="text-xl font-bold text-slate-800">Suggested Specialist: <span className="text-cyan-700">{prep.specialist.type}</span></h3>
                        <p className="mt-1 text-slate-700">{prep.specialist.reason}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border">
                        <h3 className="text-xl font-bold text-slate-800">Questions to Ask Your Doctor</h3>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                            {prep.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border">
                        <h3 className="text-xl font-bold text-slate-800">Tips for Describing Your Symptoms</h3>
                        <ul className="mt-2 list-disc list-inside space-y-1 text-slate-700">
                            {prep.symptomTips.map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentPrep;
