
import React from 'react';
import { useVoiceControl } from '../context/VoiceControlContext';

const VoiceCommandIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-8 h-8 text-white" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 10v4" />
        <path d="M7 7v10" />
        <path d="M11 4v16" />
        <path d="M15 7v10" />
        <path d="M19 10v4" />
    </svg>
);

const ProcessingIcon: React.FC = () => (
    <svg 
        className="w-8 h-8 text-white animate-spin" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


interface VoiceControlButtonProps {
    toggleListening: () => void;
}

export const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({ toggleListening }) => {
    const { isListening, processingCommand } = useVoiceControl();

    const getButtonClass = () => {
        if (processingCommand) {
            return 'bg-blue-500 cursor-not-allowed';
        }
        if (isListening) {
            return 'bg-red-600 animate-pulse scale-110';
        }
        return 'bg-cyan-600 hover:bg-cyan-700';
    };

    return (
        <button
            id="voice-trigger-btn"
            onClick={toggleListening}
            disabled={!!processingCommand}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-50 ${getButtonClass()}`}
            aria-label={processingCommand ? 'Processing command' : isListening ? 'Deactivate voice control' : 'Activate voice control'}
        >
            {processingCommand ? <ProcessingIcon /> : <VoiceCommandIcon />}
            {isListening && (
                 <span className="absolute -top-12 bg-gray-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap animate-bounce">
                    Listening...
                 </span>
            )}
        </button>
    );
};
