
import React, { useState, useCallback } from 'react';
import { getMentalHealthSupport } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

const MoodButton: React.FC<{ emoji: string, label: string, onClick: () => void }> = ({ emoji, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 w-20">
        <span className="text-3xl">{emoji}</span>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

const MentalHealthSupport: React.FC = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const fetchResponse = useCallback(async (prompt: string, hideInput: boolean = false) => {
        setIsLoading(true);
        setError(null);
        setResponse('');
        if (hideInput) setInput('');
        try {
            const result = await getMentalHealthSupport(prompt, language);
            setResponse(result);
        } catch (err) {
            setError('Failed to get a response from the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    const handleSubmit = () => {
        if (!input.trim()) {
            setError('Please describe how you are feeling.');
            return;
        }
        fetchResponse(`The user is feeling: "${input}"`);
    };

    const handleMoodSelect = (mood: string) => {
        setInput(prev => `I'm feeling ${mood} today. ${prev}`);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Mental Health Support</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">AI-powered tools for your emotional well-being.</p>
            
             <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <h4 className="font-bold text-amber-800">Not a Crisis Service</h4>
                <p className="text-amber-700">This tool is not a substitute for professional medical advice or therapy. If you are in crisis, please contact a local crisis hotline or mental health professional.</p>
            </div>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="mood-input" className="block text-lg font-semibold text-slate-700 mb-2">
                    How are you feeling today?
                </label>
                <div className="flex justify-center gap-2 sm:gap-4 my-3 p-2 bg-slate-100 rounded-lg">
                    <MoodButton emoji="😊" label="Happy" onClick={() => handleMoodSelect('happy')} />
                    <MoodButton emoji="😌" label="Calm" onClick={() => handleMoodSelect('calm')} />
                    <MoodButton emoji="😐" label="Neutral" onClick={() => handleMoodSelect('neutral')} />
                    <MoodButton emoji="😟" label="Worried" onClick={() => handleMoodSelect('worried')} />
                    <MoodButton emoji="😢" label="Sad" onClick={() => handleMoodSelect('sad')} />
                    <MoodButton emoji="😠" label="Angry" onClick={() => handleMoodSelect('angry')} />
                </div>
                <textarea
                    id="mood-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="You can describe your mood, a situation, or just write what's on your mind..."
                    className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="mt-4 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400"
                >
                    {isLoading && !response ? 'Thinking...' : 'Get Supportive Feedback'}
                </button>
            </div>
            
            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                 <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">Quick Tools</h3>
                 <div className="flex flex-col sm:flex-row gap-3">
                     <button onClick={() => fetchResponse("Generate a short, calming meditation script for me.", true)} disabled={isLoading} className="text-sm flex-1 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50">Generate Meditation Script</button>
                    <button onClick={() => fetchResponse("Generate a positive affirmation for dealing with stress.", true)} disabled={isLoading} className="text-sm flex-1 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50">Generate Positive Affirmation</button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

            {isLoading && (
                <div className="text-center my-8">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            )}

            {response && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">A Moment for You</h2>
                    <div className="prose max-w-none mt-4 text-slate-700">
                         {response.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentalHealthSupport;
