
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { useLanguage } from './LanguageContext';
import { useVoiceControl } from './VoiceControlContext';
import { createPcmBlob, decodeBase64, decodeAudioData } from '../utils/audio-processor';
import type { View } from '../types';

interface LiveAudioContextType {
  isLiveActive: boolean;
  isConnecting: boolean;
  startLiveSession: (instructionOverride?: string, configOverride?: any, existingStream?: MediaStream) => Promise<void>;
  stopLiveSession: () => void;
  sendVideoFrame: (base64: string) => void;
  audioLevel: number;
  inputTranscription: string;
  outputTranscription: string;
}

const LiveAudioContext = createContext<LiveAudioContextType | undefined>(undefined);

export const LiveAudioProvider: React.FC<{ children: React.ReactNode; onNavigate: (view: View) => void }> = ({ children, onNavigate }) => {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [inputTranscription, setInputTranscription] = useState('');
  const [outputTranscription, setOutputTranscription] = useState('');
  
  const { language } = useLanguage();
  const { setSymptomInput, setMedicineInput, setResourceInput } = useVoiceControl();
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
    sourcesRef.current.clear();
    setIsLiveActive(false);
    setIsConnecting(false);
    setAudioLevel(0);
    setInputTranscription('');
    setOutputTranscription('');
  }, []);

  const sendVideoFrame = useCallback((base64: string) => {
      if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
              media: { data: base64, mimeType: 'image/jpeg' }
          });
      }
  }, []);

  const startLiveSession = useCallback(async (instructionOverride?: string, configOverride?: any, existingStream?: MediaStream) => {
    if (isLiveActive || isConnecting) return;
    setIsConnecting(true);

    const apiKey = process.env.API_KEY || '';
    const ai = new GoogleGenAI({ apiKey });

    if (!audioContextRef.current) {
        audioContextRef.current = {
            input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
            output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
        };
    }

    const { input, output } = audioContextRef.current;
    await input.resume();
    await output.resume();

    const systemInstruction = instructionOverride || `
        You are the MedFinder "Health Pilot". You control the app's UI for the user.
        Language: ${language}.

        YOUR PROTOCOLS:
        1. SYMPTOMS: If user says "I have X" or "My Y hurts", use 'check_symptoms'. This navigates to AI assistant AND starts analysis immediately.
        2. NAVIGATION: Use 'navigate_to_page' for general navigation.
        3. SELECTION: If user says "choose the first one" or "select Apollo", use 'select_option' with index or name.
        4. ACTIONS: Use 'perform_action' for: 'BOOK_APPOINTMENT', 'GO_BACK', 'SUBMIT_FORM'.

        VIEWS: 'dashboard', 'ai-assistant', 'price-comparison', 'resource-finder', 'symptom-checker', 'vitals', 'medicine-identifier', 'inclusive-bridge', 'family-hub', 'medication-reminders'.

        Be decisive. Use tools BEFORE or DURING your verbal response to ensure the UI updates instantly.
    `;

    try {
        const stream = existingStream || await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                ...configOverride,
                tools: [{ 
                    functionDeclarations: [
                        { name: 'navigate_to_page', parameters: { type: Type.OBJECT, properties: { view: { type: Type.STRING } }, required: ['view'] } },
                        { name: 'check_symptoms', parameters: { type: Type.OBJECT, properties: { symptoms: { type: Type.STRING } }, required: ['symptoms'] } },
                        { name: 'select_option', parameters: { type: Type.OBJECT, properties: { index: { type: Type.NUMBER }, name: { type: Type.STRING } } } },
                        { name: 'perform_action', parameters: { type: Type.OBJECT, properties: { action: { type: Type.STRING, enum: ['BOOK_APPOINTMENT', 'GO_BACK', 'SUBMIT_FORM', 'IDENTIFY_MEDICINE'] } }, required: ['action'] } },
                        { name: 'update_field', parameters: { type: Type.OBJECT, properties: { field: { type: Type.STRING }, value: { type: Type.STRING } }, required: ['field', 'value'] } }
                    ] 
                }]
            },
            callbacks: {
                onopen: () => {
                    setIsLiveActive(true);
                    setIsConnecting(false);
                    const source = input.createMediaStreamSource(stream);
                    const scriptProcessor = input.createScriptProcessor(2048, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0;
                        for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                        setAudioLevel(Math.sqrt(sum / inputData.length));
                        const pcmBlob = createPcmBlob(inputData);
                        sessionPromise.then(session => { if (session) session.sendRealtimeInput({ media: pcmBlob }); });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(input.destination);
                },
                onmessage: async (msg: any) => {
                    if (msg.serverContent?.inputTranscription) setInputTranscription(prev => prev + msg.serverContent.inputTranscription.text);
                    if (msg.serverContent?.outputTranscription) setOutputTranscription(prev => prev + msg.serverContent.outputTranscription.text);
                    
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            if (fc.name === 'navigate_to_page') {
                                onNavigate(fc.args.view.toLowerCase().trim() as View);
                            } else if (fc.name === 'check_symptoms') {
                                setSymptomInput(fc.args.symptoms);
                                onNavigate('ai-assistant');
                                setTimeout(() => window.dispatchEvent(new CustomEvent('ai_trigger', { detail: { type: 'SYMPTOMS', value: fc.args.symptoms } })), 200);
                            } else if (fc.name === 'select_option') {
                                window.dispatchEvent(new CustomEvent('ai_trigger', { detail: { type: 'SELECT', index: fc.args.index, name: fc.args.name } }));
                            } else if (fc.name === 'perform_action') {
                                window.dispatchEvent(new CustomEvent('ai_trigger', { detail: { type: 'ACTION', value: fc.args.action } }));
                            } else if (fc.name === 'update_field') {
                                const { field, value } = fc.args;
                                if (field === 'symptoms') setSymptomInput(value);
                                else if (field === 'medicine') setMedicineInput(value);
                                else if (field === 'location') setResourceInput(value);
                                window.dispatchEvent(new CustomEvent('voice_field_update', { detail: { field, value } }));
                            }
                            sessionPromise.then(s => s.sendToolResponse({
                                functionResponses: [{ id: fc.id, name: fc.name, response: { result: 'ui_updated' } }]
                            }));
                        }
                    }

                    const audioPart = msg.serverContent?.modelTurn?.parts?.find((p: any) => p.inlineData);
                    const audioData = audioPart?.inlineData?.data;
                    if (audioData) {
                        const raw = decodeBase64(audioData);
                        const buffer = await decodeAudioData(raw, output, 24000, 1);
                        const source = output.createBufferSource();
                        source.buffer = buffer;
                        source.connect(output.destination);
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e) => { console.error("Live Error:", e); stopLiveSession(); },
                onclose: () => stopLiveSession(),
            }
        });
        sessionRef.current = await sessionPromise;
    } catch (err) {
        setIsConnecting(false);
    }
  }, [language, isLiveActive, isConnecting, onNavigate, stopLiveSession, setSymptomInput, setMedicineInput, setResourceInput]);

  return (
    <LiveAudioContext.Provider value={{ 
        isLiveActive, isConnecting, startLiveSession, stopLiveSession, sendVideoFrame, audioLevel,
        inputTranscription, outputTranscription 
    }}>
      {children}
    </LiveAudioContext.Provider>
  );
};

export const useLiveAudio = () => {
  const context = useContext(LiveAudioContext);
  if (!context) throw new Error('useLiveAudio must be used within LiveAudioProvider');
  return context;
};
