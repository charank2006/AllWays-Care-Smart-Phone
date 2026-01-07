
import React from 'react';
import { useLiveAudio } from '../context/LiveAudioContext';

const AIPulseOrb: React.FC<{ active: boolean; level: number }> = ({ active, level }) => (
    <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Outer Glows */}
        <div 
            className={`absolute inset-0 rounded-full bg-cyan-500/20 transition-transform duration-150 ${active ? 'animate-pulse' : ''}`}
            style={{ transform: `scale(${1.2 + level * 4})` }}
        />
        <div 
            className={`absolute inset-0 rounded-full border-2 border-cyan-400/40 transition-transform duration-100 ${active ? '' : 'opacity-0'}`}
            style={{ transform: `scale(${1.1 + level * 6})` }}
        />
        
        {/* The Core Orb */}
        <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-lg flex items-center justify-center overflow-hidden transition-transform ${active ? 'scale-110' : 'scale-100'}`}>
            <div className={`absolute inset-0 bg-white/20 blur-sm ${active ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
            <div className={`absolute inset-0 bg-cyan-400 opacity-20 animate-pulse`} />
            <svg className="w-6 h-6 text-white drop-shadow-md z-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        </div>
    </div>
);

export const LiveVoiceInterface: React.FC = () => {
    const { isLiveActive, isConnecting, stopLiveSession, audioLevel, inputTranscription, outputTranscription } = useLiveAudio();

    if (!isLiveActive && !isConnecting) return null;

    // Determine what text to show in the bubble
    const showPlaceholder = !inputTranscription && !outputTranscription && isLiveActive;

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in w-full max-w-lg px-4">
            <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-2 rounded-[40px] shadow-2xl flex flex-col gap-2 overflow-hidden ring-1 ring-white/20">
                <div className="flex items-center gap-4 p-3">
                    <div className="relative flex-shrink-0">
                        {isConnecting ? (
                            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <AIPulseOrb active={isLiveActive} level={audioLevel} />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <span className={`flex h-2 w-2 rounded-full ${isLiveActive ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'}`}></span>
                             <p className="text-white font-black text-xs uppercase tracking-[0.2em] truncate">
                                {isConnecting ? 'Initializing Neural Link' : 'Voice Assistant Active'}
                            </p>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mt-0.5">
                            {isConnecting ? 'Connecting to Core...' : isLiveActive ? 'Waiting for your command' : 'Ready'}
                        </p>
                    </div>

                    <button 
                        onClick={stopLiveSession}
                        className="flex-shrink-0 p-4 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-all active:scale-90 border border-white/10"
                        aria-label="Stop Session"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Live Transcription Area */}
                <div className="px-5 pb-5 animate-slide-down">
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/10 min-h-[80px] flex flex-col justify-center transition-all duration-500">
                        {showPlaceholder && (
                            <div className="flex flex-col items-center gap-2 animate-pulse">
                                <p className="text-cyan-400 text-sm font-black uppercase tracking-[0.2em]">I'm listening...</p>
                                <p className="text-slate-500 text-xs font-bold">Ask me to check symptoms or navigate</p>
                            </div>
                        )}
                        
                        {inputTranscription && (
                            <div className="flex gap-3 items-start animate-fade-in mb-2">
                                <span className="text-[9px] font-black bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase mt-1">You</span>
                                <p className="text-slate-200 text-base font-medium leading-relaxed italic">{inputTranscription}</p>
                            </div>
                        )}
                        
                        {outputTranscription && (
                            <div className="flex gap-3 items-start animate-fade-in">
                                <span className="text-[9px] font-black bg-cyan-600 text-white px-1.5 py-0.5 rounded uppercase mt-1">AI</span>
                                <p className="text-white text-lg font-bold leading-snug">{outputTranscription}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
