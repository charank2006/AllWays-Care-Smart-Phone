
import { useState, useEffect, useCallback } from 'react';
import type { MedicationReminderInfo } from '../types';

const REMINDERS_KEY = 'allwayscare-reminders';

export const useMedicationReminders = () => {
    const [reminders, setReminders] = useState<MedicationReminderInfo[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedReminders = localStorage.getItem(REMINDERS_KEY);
            if (storedReminders) {
                setReminders(JSON.parse(storedReminders));
            }
        } catch (error) {
            console.error("Failed to load reminders from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveReminders = (newReminders: MedicationReminderInfo[]) => {
        try {
            localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
            setReminders(newReminders);
        } catch (error) {
            console.error("Failed to save reminders to localStorage", error);
        }
    };

    const addReminder = useCallback((reminder: Omit<MedicationReminderInfo, 'id'>) => {
        const newReminder: MedicationReminderInfo = { ...reminder, id: new Date().toISOString() };
        saveReminders([...reminders, newReminder]);
    }, [reminders]);

    const removeReminder = useCallback((reminderId: string) => {
        const newReminders = reminders.filter(r => r.id !== reminderId);
        saveReminders(newReminders);
    }, [reminders]);


    return { reminders, addReminder, removeReminder, isLoaded };
};
