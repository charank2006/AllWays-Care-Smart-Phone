
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speak } from '../utils/tts';

interface QuickAction {
    id: string;
    icon: string;
    label: string;
    message: string;
    category: 'critical' | 'needs' | 'chat';
}

const QuickCommunicate: React.FC = () => {
    const { speechCode } = useLanguage();
    const [customText, setCustomText] = useState('');

    const actions: QuickAction[] = [
        { id: 'emergency', icon: '🚨', label: 'EMERGENCY', message: 'HELP! I am having a medical emergency. Please call for an ambulance.', category: 'critical' },
        { id: 'allergic', icon: '🥜', label: 'Allergy', message: 'I am having an allergic reaction. Please check my bag for my medicine.', category: 'critical' },
        { id: 'water', icon: '💧', label: 'Water', message: 'I need some water, please.', category: 'needs' },
        { id: 'washroom', icon: '🚽', label: 'Toilet', message: 'Can you show me where the washroom is?', category: 'needs' },
        { id: 'medicine', icon: '💊', label: 'Pill Time', message: 'It is time for me to take my scheduled medication.', category: 'needs' },
        { id: 'thanks', icon: '🙏', label: 'Thanks', message: 'Thank you very much for your help.', category: 'chat' },
        { id: 'yes', icon: '✅', label: 'Yes', message: 'Yes, that is correct.', category: 'chat' },
        { id: 'no', icon: '❌', label: 'No', message: 'No, that is not what I meant.', category: 'chat' },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Talk for Me</h1>
                <p className="text-lg text-slate-600 font-medium">Use high-quality AI speech to communicate with others.</p>
            </header>

            <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-200">
                <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Custom Message</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={customText} 
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type anything here..." 
                        className="flex-1 p-4 text-lg border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 transition-all"
                    />
                    <button 
                        onClick={() => speak(customText, speechCode)} 
                        disabled={!customText.trim()}
                        className="px-8 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all disabled:bg-slate-300"
                    >
                        SPEAK
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {actions.map(action => (
                    <button
                        key={action.id}
                        onClick={() => speak(action.message, speechCode)}
                        className={`p-6 rounded-[32px] shadow-md border transition-all duration-300 hover:scale-105 active:scale-95 flex flex-col items-center gap-3 text-center
                            ${action.category === 'critical' ? 'bg-red-600 border-red-700 text-white shadow-red-200' : 'bg-white border-slate-100 text-slate-800'}
                        `}
                    >
                        <span className="text-5xl" role="img">{action.icon}</span>
                        <span className="font-black text-sm uppercase tracking-tight">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickCommunicate;
