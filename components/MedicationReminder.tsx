
import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useMedicationReminders } from '../hooks/useMedicationReminders';

const CloseIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export const MedicationReminder: React.FC = () => {
    const { notifications, addNotification } = useNotifications();
    const { reminders, isLoaded } = useMedicationReminders();
    const [visibleToasts, setVisibleToasts] = useState<string[]>([]);
    
    // Ref to track which reminders have already fired in the current minute to prevent double-triggering
    const triggeredThisMinute = useRef<Set<string>>(new Set());
    const lastMinuteRef = useRef<string>("");

    // --- SCHEDULER LOGIC ---
    useEffect(() => {
        if (!isLoaded || reminders.length === 0) return;

        const checkReminders = () => {
            const now = new Date();
            const currentTimeStr = now.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            });

            // Reset the "triggered" set if the minute has changed
            if (lastMinuteRef.current !== currentTimeStr) {
                triggeredThisMinute.current.clear();
                lastMinuteRef.current = currentTimeStr;
            }

            reminders.forEach(reminder => {
                const uniqueKey = `${reminder.id}-${currentTimeStr}`;
                
                // EXACT MINUTE MATCH
                if (reminder.time === currentTimeStr && !triggeredThisMinute.current.has(uniqueKey)) {
                    triggeredThisMinute.current.add(uniqueKey);
                    
                    addNotification({
                        type: 'medication',
                        message: `⏰ Time for ${reminder.patientName}'s ${reminder.medicineName} (${reminder.dosage})`
                    });

                    // Sound Alert
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.6;
                        audio.play().catch(() => {});
                    } catch (e) {}
                }
            });
        };

        // Check every 5 seconds for high precision
        const interval = setInterval(checkReminders, 5000); 
        checkReminders(); // Initial check

        return () => clearInterval(interval);
    }, [reminders, isLoaded, addNotification]);

    // --- DISPLAY LOGIC ---
    useEffect(() => {
        const medicationNotifications = notifications.filter(n => n.type === 'medication');

        medicationNotifications.forEach(n => {
            if (!visibleToasts.includes(n.id)) {
                 setTimeout(() => {
                    setVisibleToasts(prev => [...prev, n.id]);
                }, 100); 
            }
        });
    }, [notifications, visibleToasts]);

    const handleDismiss = (id: string) => {
        setVisibleToasts(prev => prev.filter(toastId => toastId !== id));
    };

    const toastsToShow = notifications.filter(n => n.type === 'medication' && visibleToasts.includes(n.id));

    if (toastsToShow.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50 space-y-3 pointer-events-none max-w-[calc(100vw-48px)] sm:max-w-sm">
            {toastsToShow.map(toast => (
                <div key={toast.id} className="w-full p-5 rounded-[24px] shadow-2xl bg-white border-2 border-cyan-500 flex items-start gap-4 animate-slide-up pointer-events-auto ring-8 ring-cyan-500/10">
                    <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 animate-bounce">
                        💊
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Medication Alert</h4>
                        <p className="text-sm text-slate-600 mt-1 font-bold leading-snug break-words">{toast.message}</p>
                    </div>
                    <button 
                        onClick={() => handleDismiss(toast.id)} 
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <CloseIcon />
                    </button>
                </div>
            ))}
        </div>
    );
};
