
import React, { useState, useRef } from 'react';
import type { View } from '../types';
import { useEmergency } from '../context/EmergencyContext';
import { useLanguage } from '../context/LanguageContext';

interface EmergencySOSButtonProps {
    setActiveView: (view: View) => void;
}

export const EmergencySOSButton: React.FC<EmergencySOSButtonProps> = ({ setActiveView }) => {
    const { startEmergency, isEmergencyActive } = useEmergency();
    const { t } = useLanguage();
    const [isHolding, setIsHolding] = useState(false);
    const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePressStart = () => {
        if (isEmergencyActive) {
            setActiveView('emergency-mode');
            return;
        }
        setIsHolding(true);
        holdTimeout.current = setTimeout(() => {
            startEmergency();
            setActiveView('emergency-mode');
            setIsHolding(false);
        }, 2000); // 2-second hold to confirm
    };

    const handlePressEnd = () => {
        setIsHolding(false);
        if (holdTimeout.current) {
            clearTimeout(holdTimeout.current);
            holdTimeout.current = null;
        }
    };
    
    return (
        <div className="relative group">
            {isHolding && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap animate-pulse shadow-xl">
                    Release to Cancel
                </div>
            )}
            <button
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 relative border-4 border-white/20
                    ${isEmergencyActive ? 'bg-red-800 scale-110 border-red-400 animate-pulse' : 'bg-red-600 hover:bg-red-700 active:scale-90'}
                `}
                aria-label={t('emergency.sosButton.ariaLabel')}
            >
                {/* Hold Progress Circle Overlay */}
                <div
                    className={`absolute inset-0 bg-white/40 rounded-full transition-transform ease-linear pointer-events-none ${isHolding ? 'scale-100' : 'scale-0'}`}
                    style={{ transitionDuration: isHolding ? '2000ms' : '0ms' }}
                />
                
                <span className="font-black text-white text-xl z-10 leading-none">SOS</span>
                {!isEmergencyActive && !isHolding && (
                    <span className="text-[7px] text-white/80 font-black uppercase mt-0.5 tracking-tighter">Hold</span>
                )}
                {isEmergencyActive && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-red-600 text-[10px] animate-ping font-black">!</span>
                    </div>
                )}
            </button>
        </div>
    );
};
