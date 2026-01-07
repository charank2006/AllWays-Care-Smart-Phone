
import React, { useState, useEffect } from 'react';

interface SignLanguageInterpreterProps {
    text: string;
    isActive: boolean;
}

const MEDICAL_SIGNS: Record<string, string> = {
    'pain': '😫', 'doctor': '👨‍⚕️', 'hospital': '🏥', 'medicine': '💊',
    'help': '🆘', 'heart': '❤️', 'fever': '🌡️', 'headache': '🧠',
    'breathing': '🫁', 'blood': '🩸', 'emergency': '🚨', 'pharmacy': '🏪',
    'appointment': '📅', 'checkup': '🩺', 'normal': '✅', 'high': '⚠️',
    'low': '⬇️', 'diet': '🍎', 'sugar': '🍬', 'water': '💧',
    'sleep': '😴', 'stress': '😰', 'exercise': '🏃', 'dna': '🧬',
};

export const SignLanguageInterpreter: React.FC<SignLanguageInterpreterProps> = ({ text, isActive }) => {
    const [currentSigns, setCurrentSigns] = useState<string[]>([]);

    useEffect(() => {
        if (!isActive || !text) return;

        const words = text.toLowerCase().split(/[\s,.]+/);
        const signsFound = words
            .filter(word => MEDICAL_SIGNS[word])
            .map(word => MEDICAL_SIGNS[word]);
        
        setCurrentSigns([...new Set(signsFound)].slice(0, 6));
    }, [text, isActive]);

    if (!isActive || currentSigns.length === 0) return null;

    return (
        <div className="bg-slate-900 border-b-4 border-cyan-400 p-4 rounded-3xl mb-6 animate-fade-in flex items-center gap-4 shadow-2xl overflow-hidden">
            <div className="flex-shrink-0 bg-cyan-500 p-2 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m3 .5V15m0-2.5v-5a1.5 1.5 0 113 0V15m-9-6l-3 3m0 0l3 3m-3-3h12" />
                </svg>
            </div>
            <div className="flex-1 flex gap-6 overflow-x-auto py-2 scrollbar-hide">
                {currentSigns.map((sign, i) => (
                    <div key={i} className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: `${i * 0.15}s` }}>
                        <span className="text-4xl drop-shadow-lg">{sign}</span>
                    </div>
                ))}
            </div>
            <div className="hidden sm:block text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sign Visualizer</p>
            </div>
        </div>
    );
};
