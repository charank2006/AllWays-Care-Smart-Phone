import React, { useState } from 'react';
import { useEmergencyContacts } from '../hooks/useEmergencyContacts';
import type { EmergencyContact } from '../types';
import { useLanguage } from '../context/LanguageContext';

const UserPlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const ContactCard: React.FC<{ contact: EmergencyContact, onRemove: (id: string) => void }> = ({ contact, onRemove }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-start justify-between gap-4">
            <div>
                <h3 className="font-bold text-lg text-cyan-800">{contact.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{contact.relationship}</p>
                <a href={`tel:${contact.phone}`} className="mt-2 text-slate-700 font-semibold hover:text-cyan-600">{contact.phone}</a>
            </div>
            <button
                onClick={() => onRemove(contact.id)}
                className="flex-shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`${t('emergencyContacts.remove')} ${contact.name}`}
            >
                <TrashIcon />
            </button>
        </div>
    );
};

const EmergencyContacts: React.FC = () => {
    const { contacts, addContact, removeContact, isLoaded } = useEmergencyContacts();
    const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewContact(prev => ({ ...prev, [name]: value }));
    };

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (newContact.name && newContact.relationship && newContact.phone) {
            addContact(newContact);
            setNewContact({ name: '', relationship: '', phone: '' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('emergencyContacts.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('emergencyContacts.description')}</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {isLoaded && contacts.length > 0 ? (
                        contacts.map(contact => (
                            <ContactCard key={contact.id} contact={contact} onRemove={removeContact} />
                        ))
                    ) : (
                        <div className="text-center bg-white p-10 rounded-xl shadow-md border border-slate-200 h-full flex flex-col justify-center">
                            <h2 className="text-2xl font-bold text-slate-800">{t('emergencyContacts.noContacts')}</h2>
                            <p className="mt-2 text-slate-600">{t('emergencyContacts.noContacts.description')}</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('emergencyContacts.addContact.title')}</h2>
                    <form onSubmit={handleAddContact} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t('emergencyContacts.addContact.name')}</label>
                            <input type="text" name="name" id="name" value={newContact.name} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., Jane Doe" />
                        </div>
                        <div>
                            <label htmlFor="relationship" className="block text-sm font-medium text-slate-700">{t('emergencyContacts.addContact.relationship')}</label>
                            <input type="text" name="relationship" id="relationship" value={newContact.relationship} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., Partner" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">{t('emergencyContacts.addContact.phone')}</label>
                            <input type="tel" name="phone" id="phone" value={newContact.phone} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 555-123-4567" />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400">
                            <UserPlusIcon />
                            {t('emergencyContacts.addContact.button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
