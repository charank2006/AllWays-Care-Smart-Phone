import React, { useMemo } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useLanguage } from '../context/LanguageContext';
import type { View } from '../types';

const AmbulanceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 17H3V6a1 1 0 0 1 1-1h9v12H5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2v-5l-4-3H13v8h2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v4" />
    </svg>
);


interface EmergencyModeProps {
    setActiveView: (view: View) => void;
}

const EmergencyMode: React.FC<EmergencyModeProps> = ({ setActiveView }) => {
    const { status, etaSeconds, cancelEmergency } = useEmergency();
    const { t } = useLanguage();
    
    const initialEtaSeconds = 12 * 60;

    const progressPercentage = useMemo(() => {
        const percentage = Math.max(0, ((initialEtaSeconds - etaSeconds) / initialEtaSeconds) * 100);
        return percentage;
    }, [etaSeconds, initialEtaSeconds]);
    
    const displayMinutes = useMemo(() => {
        return Math.ceil(etaSeconds / 60);
    }, [etaSeconds]);

    const statusInfo = useMemo(() => {
        switch (status) {
            case 'dispatched':
                return { title: t('emergency.status.dispatched.title'), message: t('emergency.status.dispatched.message') };
            case 'on_scene':
                 return { title: t('emergency.status.onScene.title'), message: t('emergency.status.onScene.message') };
            default:
                return { title: t('emergency.status.inactive.title'), message: t('emergency.status.inactive.message') };
        }
    }, [status, t]);
    
    const handleCancel = () => {
        cancelEmergency();
        setActiveView('dashboard');
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-slate-900 text-white p-4 rounded-xl animate-fade-in">
            <div className="w-full max-w-md">
                 <h1 className="text-3xl font-bold text-red-400 animate-pulse">{statusInfo.title}</h1>
                 <p className="mt-2 text-slate-300">{statusInfo.message}</p>
                 
                 <div className="relative w-full h-48 bg-slate-800 rounded-lg mt-8 overflow-hidden">
                     {/* Fake map texture */}
                     <div className="absolute inset-0 bg-grid-slate-700/40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                     {/* Ambulance track */}
                     <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1.5 bg-slate-600 rounded-full"></div>
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1.5 bg-cyan-400 rounded-full transition-all duration-1000 linear" style={{ width: `calc(${progressPercentage}% - 0.5rem)` }}></div>
                     {/* Ambulance Icon */}
                     <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 p-2 bg-cyan-500 rounded-full shadow-lg transition-all duration-1000 linear" style={{ left: `calc(1rem + ${progressPercentage}%)` }}>
                         <AmbulanceIcon />
                     </div>
                 </div>

                 <div className="mt-6">
                    <p className="text-slate-400 text-lg">{t('emergency.etaLabel')}</p>
                    <p className="text-5xl font-bold text-cyan-400">{status === 'on_scene' ? t('emergency.etaArrived') : t('emergency.etaValue', { minutes: displayMinutes.toString() })}</p>
                 </div>
                 
                 <button 
                    onClick={handleCancel}
                    className="mt-8 w-full bg-slate-700 text-white font-bold py-4 px-6 rounded-lg hover:bg-slate-600 transition-colors"
                 >
                    {t('emergency.cancelButton')}
                 </button>
            </div>
        </div>
    );
}

export default EmergencyMode;