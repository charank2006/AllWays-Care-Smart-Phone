
import React from 'react';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

interface ChatAssistantButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

export const ChatAssistantButton: React.FC<ChatAssistantButtonProps> = ({ onClick, isOpen }) => {
    return (
        <button
            onClick={onClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
                isOpen ? 'bg-slate-800 rotate-90' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            aria-label="Toggle AI Assistant Chat"
        >
            {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <ChatIcon />
            )}
        </button>
    );
};
