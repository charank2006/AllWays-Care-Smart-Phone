
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { identifyMedicineFromImage } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { speak } from '../utils/tts';
import { useAccessibility } from '../context/AccessibilityContext';

const CameraIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {active ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        )}
    </svg>
);

const ViewfinderBrackets = ({ isLocking }: { isLocking: boolean }) => (
    <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${isLocking ? 'scale-95' : 'scale-100'}`}>
        <div className={`absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 rounded-tl-2xl transition-colors duration-300 ${isLocking ? 'border-yellow-400' : 'border-white/40'}`} />
        <div className={`absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 rounded-tr-2xl transition-colors duration-300 ${isLocking ? 'border-yellow-400' : 'border-white/40'}`} />
        <div className={`absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 rounded-bl-2xl transition-colors duration-300 ${isLocking ? 'border-yellow-400' : 'border-white/40'}`} />
        <div className={`absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 rounded-br-2xl transition-colors duration-300 ${isLocking ? 'border-yellow-400' : 'border-white/40'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full transition-all duration-300 ${isLocking ? 'bg-yellow-400 border-yellow-400 scale-150 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'border-white/20'}`} />
    </div>
);

const MedicineIdentifier: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [streamReady, setStreamReady] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<{name: string, details: string, usage: string, safety: string, timing: string} | null>(null);
    const { language, t, speechCode } = useLanguage();
    const scanIntervalRef = useRef<any>(null);

    const stopCamera = useCallback(() => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setStreamReady(false);
        setIsLocking(false);
    }, []);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        setResult(null);
        
        try {
            // Simplified constraints for better device compatibility on localhost
            const constraints = { 
                video: { 
                    facingMode: 'environment'
                },
                audio: false 
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Using standard event listeners for better reliability
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().then(() => {
                        setStreamReady(true);
                        speak("Camera active. Point at your medicine and hold steady.", speechCode);
                    }).catch(e => {
                        console.error("Video play error:", e);
                        setCameraError("Browser blocked auto-play. Please tap to start.");
                    });
                };
            }
        } catch (err: any) {
            console.error("Camera access failed:", err);
            setCameraError(err.name === 'NotAllowedError' ? "Permission denied." : "Hardware error. Is another app using your camera?");
        }
    }, [speechCode]);

    const performDetection = useCallback(async (isSilentAuto = false) => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing || !streamReady) return;
        
        if (isSilentAuto) setIsLocking(true);
        else setIsAnalyzing(true);

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        context.drawImage(video, 0, 0);

        try {
            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            const parsed = await identifyMedicineFromImage(base64Image, language);
            
            if (parsed && parsed.detected) {
                stopCamera();
                setResult(parsed);
                setIsAnalyzing(false);
                setIsLocking(false);
                speak(`Detection successful. This is ${parsed.name}.`, speechCode);
            } else {
                setIsLocking(false);
                setIsAnalyzing(false);
                if (!isSilentAuto) {
                    speak("No medicine detected. Please make sure the letters are visible.", speechCode);
                }
            }
        } catch (err) {
            setIsLocking(false);
            setIsAnalyzing(false);
        }
    }, [isAnalyzing, streamReady, language, speechCode, stopCamera]);

    useEffect(() => {
        if (streamReady && !result) {
            scanIntervalRef.current = setInterval(() => {
                performDetection(true);
            }, 4000);
        } else {
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        }
        return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
    }, [streamReady, result, performDetection]);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24 text-center font-sans">
            <header className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">AI Vision Link</h1>
                    <p className="text-slate-600 font-medium">Automatic recognition for medicines and labels.</p>
                </div>
                <button 
                    onClick={() => streamReady ? stopCamera() : startCamera()}
                    className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${
                        streamReady ? 'bg-red-600 text-white' : 'bg-black text-white hover:bg-slate-800'
                    }`}
                >
                    <CameraIcon active={streamReady} />
                    {streamReady ? "CLOSE CAMERA" : "OPEN SCANNER"}
                </button>
            </header>

            <div 
                className={`relative aspect-[3/4] sm:aspect-video bg-black rounded-[48px] overflow-hidden shadow-2xl border-[12px] transition-all duration-700 ${
                    streamReady ? 'border-white' : 'border-slate-200'
                }`}
            >
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover transition-opacity duration-700 ${streamReady ? 'opacity-100' : 'opacity-0'}`} 
                />

                {!streamReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-50">
                        {cameraError ? (
                            <div className="max-w-xs">
                                <div className="text-5xl mb-4">⚠️</div>
                                <p className="text-red-600 font-black uppercase mb-6">{cameraError}</p>
                                <button onClick={() => startCamera()} className="px-10 py-4 bg-black text-white rounded-2xl font-black">RETRY</button>
                            </div>
                        ) : (
                            <div className="animate-fade-in flex flex-col items-center">
                                {result ? (
                                    <div className="p-10">
                                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl animate-bounce">✓</div>
                                        <p className="font-black text-slate-900 text-xl uppercase tracking-tighter">Information Retrieved</p>
                                        <button onClick={() => startCamera()} className="mt-8 px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Scan Another</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-3xl">📷</div>
                                        <p className="font-black text-lg text-slate-400 uppercase tracking-widest">Viewfinder Ready</p>
                                        <button onClick={() => startCamera()} className="mt-8 px-12 py-4 bg-cyan-600 text-white rounded-3xl font-black shadow-lg hover:bg-cyan-700 transition-all">START AI SCANNER</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {streamReady && (
                    <div className="absolute inset-0 pointer-events-none">
                        <ViewfinderBrackets isLocking={isLocking} />
                        <div className="absolute top-8 left-0 right-0 flex justify-center">
                            <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLocking ? 'text-yellow-400' : 'text-white'}`}>
                                    {isLocking ? '● LOCKING ON TARGET...' : 'FOCUSING ON LABELS'}
                                </p>
                            </div>
                        </div>
                        <div className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,1)] animate-scan"></div>
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-ping opacity-50"></div>
                            <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-8 text-white font-black text-2xl tracking-tighter uppercase animate-pulse">Running OCR...</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="bg-white p-8 rounded-[48px] shadow-2xl border-4 border-cyan-500 text-left relative overflow-hidden animate-slide-up">
                    <div className="absolute top-0 right-0 bg-cyan-500 text-white px-8 py-3 rounded-bl-[32px] font-black text-xs tracking-widest uppercase">Clinical Identity Match</div>
                    <div className="mb-8">
                        <h2 className="text-4xl font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">{result.name}</h2>
                        <p className="text-cyan-600 font-black text-xs uppercase tracking-widest">{result.details}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                             <span className="text-[10px] font-black text-slate-400 uppercase block mb-3 tracking-widest">Primary Use</span>
                             <p className="text-slate-800 font-bold leading-snug">{result.usage}</p>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                             <span className="text-[10px] font-black text-emerald-700 uppercase block mb-3 tracking-widest">Dosage Timing</span>
                             <p className="text-slate-900 font-black leading-snug text-lg">{result.timing}</p>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100">
                             <span className="text-[10px] font-black text-amber-700 uppercase block mb-3 tracking-widest">Advisory</span>
                             <p className="text-slate-800 font-bold leading-snug">{result.safety}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => speak(`${result.name}. Usage: ${result.usage}. Timing: ${result.timing}`, speechCode)} className="flex-[2] bg-slate-900 text-white font-black py-5 rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                             <span className="text-xl">🔊</span> READ CLINICAL DETAILS
                        </button>
                        <button onClick={() => setResult(null)} className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-3xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                             DONE
                        </button>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default MedicineIdentifier;
