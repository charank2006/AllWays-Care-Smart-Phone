import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from "@google/genai";
import { createHealthChatSession } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

const SendIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const UserIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 rounded-full bg-cyan-200 text-cyan-700 p-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const AiIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 p-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;


interface Message {
  text: string;
  isUser: boolean;
}

interface TelemedicineProps {
    onClose: () => void;
}

const Telemedicine: React.FC<TelemedicineProps> = ({ onClose }) => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        const session = createHealthChatSession(language);
        setChatSession(session);
        setMessages([{ text: t('telemedicine.initialMessage'), isUser: false }]);
    }, [language, t]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async () => {
        if (!input.trim() || !chatSession || isLoading) return;

        const userMessage: Message = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatSession.sendMessage({ message: input });
            const aiMessage: Message = { text: response.text, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { text: t('telemedicine.errorMessage'), isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, chatSession, isLoading, t]);
    
    return (
        <div className="max-w-4xl mx-auto flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-start pr-12">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t('sidebar.virtualAssistant')}</h1>
                    <p className="mt-1 text-base sm:text-lg text-slate-600">{t('telemedicine.tagline')}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label={t('telemedicine.closeAria')}
                >
                    <CloseIcon />
                </button>
            </div>
            
            <div className="mt-6 flex-1 flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}>
                            {!msg.isUser && <div className="flex-shrink-0"><AiIcon /></div>}
                            <div className={`max-w-md p-3 rounded-xl ${msg.isUser ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                <p>{msg.text}</p>
                            </div>
                            {msg.isUser && <div className="flex-shrink-0"><UserIcon /></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <AiIcon />
                            <div className="max-w-md p-3 rounded-xl bg-slate-100 text-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={t('telemedicine.placeholder')}
                            disabled={isLoading}
                            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400">
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Telemedicine;