
import { useEffect, useRef, useCallback } from 'react';
import type { View } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
    parseVoiceCommand, 
    analyzeSymptoms
} from '../services/geminiService';
import { speak } from '../utils/tts';
import { useVoiceControl } from '../context/VoiceControlContext';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useGlobalVoiceCommands = ({
    activeView,
    setActiveView,
    setToastMessage,
    isListening,
    setIsListening,
    setProcessingCommand,
}: any) => {
    const recognitionRef = useRef<any>(null);
    const { speechCode, langCode } = useLanguage();
    const { 
        activeTask, setActiveTask, 
        updateTaskData, 
        awaitingResponse, setAwaitingResponse,
        pendingNavigation, setPendingNavigation,
        isDictating
    } = useVoiceControl();

    const aiRespond = useCallback((message: string, shouldListenAfter: boolean = false) => {
        if (isDictating) return;
        setToastMessage(message);
        
        // Ensure we stop current recognition before speaking to prevent the AI from hearing itself
        if (recognitionRef.current) recognitionRef.current.stop();
        
        speak(message, speechCode, () => {
            if (shouldListenAfter && recognitionRef.current && !isDictating) {
                try { 
                    recognitionRef.current.start(); 
                    setIsListening(true); 
                } catch (e) {}
            } else { 
                setIsListening(false); 
            }
        });
    }, [speechCode, setToastMessage, setIsListening, isDictating]);

    const handleAutonomousLogic = useCallback(async (command: any) => {
        // 1. Navigation
        if (command.intent === 'NAVIGATE' && command.entities.view) {
            setActiveView(command.entities.view);
            aiRespond(`Opening ${command.entities.view.replace(/-/g, ' ')} for you.`);
            return;
        }

        // 2. Pill Identification
        if (command.intent === 'IDENTIFY_MEDICINE') {
            setActiveView('medicine-identifier');
            aiRespond("I'm opening the pill scanner. Please hold your medicine in front of the camera and I will identify it automatically.");
            return;
        }

        // 3. Symptom Checking
        if (command.intent === 'CHECK_SYMPTOMS' && command.entities.symptom) {
            setActiveView('ai-assistant');
            // Immediate feedback while AI thinks
            speak("I'm analyzing those symptoms for you. One moment.", speechCode);
            
            try {
                const analysis = await analyzeSymptoms(command.entities.symptom, langCode);
                const response = `Based on what you told me, it could be ${analysis.potentialConditions[0].name}. ${command.autonomousAction}`;
                setActiveTask('booking_flow');
                updateTaskData({ specialty: analysis.suggestedSpecialty });
                setAwaitingResponse('yes_no');
                aiRespond(response, true);
            } catch (err) {
                aiRespond("I'm sorry, I couldn't process that symptom analysis. Please try describing them again.");
            }
            return;
        }

        // 4. Confirmation logic
        if (command.intent === 'CONFIRM' && awaitingResponse === 'yes_no') {
             if (pendingNavigation) {
                setActiveView(pendingNavigation);
                setPendingNavigation(null);
                setAwaitingResponse('none');
                aiRespond("Certainly, opening it now.");
                return;
            }
        }

        // Fallback: AI's proactive suggestion
        aiRespond(command.autonomousAction || "I heard you, but I'm not sure how to help with that. Can you try saying 'go to dashboard'?");
    }, [langCode, speechCode, setActiveView, aiRespond, setActiveTask, updateTaskData, setAwaitingResponse, awaitingResponse, pendingNavigation, setPendingNavigation]);

    useEffect(() => {
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = speechCode;
        recognition.interimResults = false;
        recognitionRef.current = recognition;

        recognition.onresult = async (event: any) => {
            if (isDictating) return;
            const transcript = event.results[0][0].transcript.trim();
            setProcessingCommand(transcript);
            
            try {
                setToastMessage("Processing...");
                const command = await parseVoiceCommand(transcript, langCode);
                await handleAutonomousLogic(command);
            } catch (error) {
                aiRespond("I'm having trouble connecting to my brain. Please try again in a second.");
            } finally {
                setProcessingCommand(null);
            }
        };

        recognition.onend = () => {
            // Only set listening to false if we aren't waiting for a speaker/command cycle
            if (!window.speechSynthesis.speaking) {
                setIsListening(false);
            }
        };
        
        return () => recognition.stop();
    }, [speechCode, langCode, handleAutonomousLogic, aiRespond, isDictating, setIsListening, setProcessingCommand, setToastMessage]);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current || isDictating) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            window.speechSynthesis.cancel();
            try { 
                recognitionRef.current.start(); 
                setIsListening(true); 
            } catch(e) {
                console.error("Recognition start failed", e);
            }
        }
    }, [isListening, setIsListening, isDictating]);

    return { toggleListening };
};
