
import { useState, useEffect, useCallback } from 'react';
import type { EmergencyContact } from '../types';

const CONTACTS_KEY = 'allwayscare-emergency-contacts';

export const useEmergencyContacts = () => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedContacts = localStorage.getItem(CONTACTS_KEY);
            if (storedContacts) {
                setContacts(JSON.parse(storedContacts));
            }
        } catch (error) {
            console.error("Failed to load contacts from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveContacts = (newContacts: EmergencyContact[]) => {
        try {
            localStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts));
            setContacts(newContacts);
        } catch (error) {
            console.error("Failed to save contacts to localStorage", error);
        }
    };

    const addContact = useCallback((contact: Omit<EmergencyContact, 'id'>) => {
        const newContact: EmergencyContact = { ...contact, id: new Date().toISOString() };
        saveContacts([...contacts, newContact]);
    }, [contacts]);

    const removeContact = useCallback((contactId: string) => {
        const newContacts = contacts.filter(c => c.id !== contactId);
        saveContacts(newContacts);
    }, [contacts]);


    return { contacts, addContact, removeContact, isLoaded };
};
