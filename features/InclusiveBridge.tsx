
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLiveAudio } from '../context/LiveAudioContext';
import { speak } from '../utils/tts';
import { rephraseMessage } from '../services/geminiService';
import { SignLanguageInterpreter } from '../components/SignLanguageInterpreter';
import { DictationButton } from '../components/DictationButton';

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VisionHUDOverlay = () => (
    <div className="absolute inset-0 pointer-events-none border-[16px] border-cyan-500/20 rounded-[40px]">
        <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">AI Vision Active</span>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-400/50 blur-sm animate-pulse" />
        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-cyan-400/60 text-right">
            GEMINI_3_MODE: ENABLED<br/>
            COORD_RECAL_ACTIVE: TRUE
        </div>
    </div>
);

const InclusiveBridge: React.FC = () => {
    const { t, language, speechCode } = useLanguage();
    const { startLiveSession, stopLiveSession, isLiveActive, outputTranscription, sendVideoFrame } = useLiveAudio();
    
    const [typedText, setTypedText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcribedText, setTranscribedText] = useState('');
    const [lastHeard, setLastHeard] = useState<string[]>([]);
    
    const [isVisionMode, setIsVisionMode] = useState(false);
    const [visionError, setVisionError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameTimerRef = useRef<any>(null);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const handleVoiceUpdate = (e: any) => {
            if (e.detail.field === 'message' || e.detail.field === 'talk') {
                setTypedText(e.detail.value);
            }
        };
        window.addEventListener('voice_field_update', handleVoiceUpdate);
        return () => window.removeEventListener('voice_field_update', handleVoiceUpdate);
    }, []);

    const handleSpeak = () => {
        if (!typedText.trim()) return;
        speak(typedText, speechCode);
    };

    const handleRephrase = async () => {
        if (!typedText.trim()) return;
        setIsProcessing(true);
        try {
            const rephrased = await rephraseMessage(typedText, language);
            setTypedText(rephrased);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = useCallback(() => {
        if (!SpeechRecognition) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = speechCode;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            let current = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript;
                    setLastHeard(prev => [text, ...prev].slice(0, 5));
                }
                current += event.results[i][0].transcript;
            }
            setTranscribedText(current);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, speechCode]);

    const startVisionLink = async () => {
        setVisionError(null);
        setIsVisionMode(true);
        
        const instruction = `
            You are a Sign Language and Gesture Interpreter powered by Gemini 3 logic. 
            The user is communicating via hand gestures and sign language.
            Watch the video stream carefully. 
            Translate gestures into clear text in ${language}.
        `;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' },
                audio: true
            });
            
            await startLiveSession(instruction, {}, stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            
            frameTimerRef.current = setInterval(() => {
                if (videoRef.current && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                        const base64 = canvasRef.current.toDataURL('image/jpeg', 0.6).split(',')[1];
                        sendVideoFrame(base64);
                    }
                }
            }, 750); 
        } catch (e: any) {
            console.error("Vision failed", e);
            setVisionError("Hardware access error. Please check permissions for Camera and Microphone.");
            setIsVisionMode(false);
        }
    };

    const stopVisionLink = () => {
        if (frameTimerRef.current) clearInterval(frameTimerRef.current);
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        stopLiveSession();
        setIsVisionMode(false);
        setVisionError(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-24 font-sans">
            <header className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-4xl font-black text-black tracking-tight uppercase">Inclusive Bridge</h1>
                    <p className="text-slate-700 font-medium mt-1">Inclusive health communication with AI-powered sign & speech link.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={isVisionMode ? stopVisionLink : startVisionLink}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isVisionMode ? 'bg-red-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                    >
                        <span className="text-xl">{isVisionMode ? '🛑' : '🤟'}</span> 
                        {isVisionMode ? 'Stop Link' : 'Start Vision Link'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className={`relative bg-slate-900 aspect-video rounded-[48px] overflow-hidden shadow-2xl border-8 transition-all ${isVisionMode ? 'border-cyan-400' : 'border-slate-800'}`}>
                        {isVisionMode ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                <VisionHUDOverlay />
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-12 z-20">
                                    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] shadow-2xl text-center min-h-[100px] flex items-center justify-center">
                                        {outputTranscription ? (
                                            <p className="text-white text-3xl font-black italic tracking-tight animate-fade-in">"{outputTranscription}"</p>
                                        ) : (
                                            <p className="text-cyan-400 text-sm font-black uppercase tracking-[0.3em] animate-pulse">Waiting for Gestures...</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-slate-50">
                                {visionError ? (
                                    <div className="max-w-sm animate-fade-in text-center">
                                        <div className="text-6xl mb-6">🚫</div>
                                        <h3 className="text-2xl font-black text-red-600 uppercase mb-2">Access Blocked</h3>
                                        <p className="text-slate-600 font-bold mb-8">{visionError}</p>
                                        <button onClick={startVisionLink} className="bg-cyan-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl">RETRY ACCESS</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-24 h-24 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-6 text-4xl">🤟</div>
                                        <h3 className="text-2xl font-black text-black uppercase mb-2">AI Sign Interpreter</h3>
                                        <p className="text-slate-600 font-medium max-w-sm">Use your camera to translate sign language and hand gestures into spoken text automatically.</p>
                                        <button onClick={startVisionLink} className="mt-8 bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg">Enable Camera Link</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-[40px] shadow-xl border border-slate-100 flex-1 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black text-black uppercase tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-indigo-50 rounded-xl">💬</span> Talk-for-Me
                            </h2>
                            <DictationButton onTranscript={(v) => setTypedText(v)} />
                        </div>
                        <textarea
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            placeholder="Enter what you want to say..."
                            className="flex-1 w-full p-4 text-xl font-bold bg-slate-50 border-2 border-slate-50 rounded-3xl focus:bg-white focus:border-indigo-500 transition-all outline-none resize-none !text-black"
                        />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button onClick={handleRephrase} disabled={isProcessing || !typedText.trim()} className="py-4 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all">
                                {isProcessing ? '...' : 'REPHRASE'}
                            </button>
                            <button onClick={handleSpeak} disabled={!typedText.trim()} className="py-4 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all">
                                SPEAK ALOUD
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} width="320" height="240" className="hidden" />
        </div>
    );
};

export default InclusiveBridge;
