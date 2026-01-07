
import React, { useState, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useVoiceControl } from '../context/VoiceControlContext';
import { stopSpeaking } from '../utils/tts';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface DictationButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
}

export const DictationButton: React.FC<DictationButtonProps> = ({ onTranscript, className = "" }) => {
    const [localIsListening, setLocalIsListening] = useState(false);
    const { speechCode } = useLanguage();
    const { setIsDictating } = useVoiceControl();
    const recognitionRef = useRef<any>(null);

    const toggleListening = useCallback(() => {
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (localIsListening) {
            recognitionRef.current?.stop();
            setLocalIsListening(false);
            setIsDictating(false);
            return;
        }

        // 1. Stop any ongoing AI speech synthesis
        stopSpeaking();

        // 2. Initialize recognition
        const recognition = new SpeechRecognition();
        recognition.lang = speechCode;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setLocalIsListening(true);
            setIsDictating(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };

        recognition.onend = () => {
            setLocalIsListening(false);
            setIsDictating(false);
        };

        recognition.onerror = () => {
            setLocalIsListening(false);
            setIsDictating(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [localIsListening, speechCode, onTranscript, setIsDictating]);

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 ${localIsListening ? 'bg-red-500 text-white animate-pulse' : 'text-cyan-600 hover:bg-cyan-50'} ${className}`}
            title="Dictate message"
            aria-label="Dictate message"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {localIsListening && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                    Listening...
                </span>
            )}
        </button>
    );
};
