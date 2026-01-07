
import React, { useState, useCallback } from 'react';
import type { VitalReading } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useLanguage } from '../../context/LanguageContext';
import { speak } from '../../utils/tts';
import { SignLanguageInterpreter } from '../../components/SignLanguageInterpreter';

const VitalsView: React.FC = () => {
    const { settings } = useAccessibility();
    const { speechCode, t } = useLanguage();
    const [vitals] = useState<VitalReading[]>([
        { type: 'BP', value: '120/80', timestamp: Date.now() - 3600000, status: 'Normal' },
        { type: 'Sugar', value: '95', timestamp: Date.now() - 7200000, status: 'Normal' },
        { type: 'HeartRate', value: '72', timestamp: Date.now() - 10800000, status: 'Normal' }
    ]);

    const handleSpeakVitals = useCallback(() => {
        const text = vitals.map(v => `${v.type} is ${v.value}, which is ${t(`vitals.status.${v.status}`)}`).join('. ');
        speak(`Current vitals summary. ${text}`, speechCode);
    }, [vitals, speechCode, t]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">{t('vitals.title')}</h1>
                    <p className="text-slate-600">{t('vitals.tagline')}</p>
                </div>
                {settings.persona === 'blind' && (
                    <button onClick={handleSpeakVitals} className="bg-cyan-600 text-white px-6 py-2 rounded-full font-black shadow-lg">Listen</button>
                )}
            </header>

            <SignLanguageInterpreter text={vitals.map(v => t(`vitals.status.${v.status}`)).join(' ')} isActive={settings.persona === 'deaf'} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vitals.map(v => (
                    <button 
                        key={v.type} 
                        onClick={() => settings.persona === 'blind' && speak(`${v.type} is ${v.value}, ${t(`vitals.status.${v.status}`)}`, speechCode)}
                        className="bg-white p-8 rounded-[40px] shadow-md border-2 border-slate-100 flex flex-col items-center hover:border-cyan-500 transition-all active:scale-95"
                    >
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{v.type}</span>
                        <span className="text-6xl font-black text-slate-800 my-4">{v.value}</span>
                        <div className={`px-4 py-1 rounded-full text-xs font-black ${
                            v.status === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {t(`vitals.status.${v.status}`)}
                        </div>
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
                <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                    <span className="bg-cyan-500 p-2 rounded-xl">🤖</span> AI Analytics
                </h3>
                <p className="text-slate-400 leading-relaxed">Based on your trends, your blood pressure is stable. No significant changes detected in the last 24 hours.</p>
            </div>
        </div>
    );
};

export default VitalsView;
