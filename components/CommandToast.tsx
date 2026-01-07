import React, { useEffect, useState } from 'react';
import { useVoiceControl } from '../context/VoiceControlContext';

export const CommandToast: React.FC = () => {
    const { toastMessage } = useVoiceControl();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (toastMessage) {
            setMessage(toastMessage);
            setVisible(true);
        } else {
             timer = setTimeout(() => {
                setVisible(false);
            }, 300);
        }
        return () => clearTimeout(timer);
    }, [toastMessage]);

    return (
        <div 
            className={`fixed bottom-44 right-6 z-50 p-3 rounded-lg shadow-md bg-gray-900 text-white transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
};