
import React, { useState } from 'react';
import { useEmergencyContacts } from '../../hooks/useEmergencyContacts';
import { useLanguage } from '../../context/LanguageContext';

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;


export const ProfileEmergencyContacts: React.FC = () => {
    const { contacts, addContact, removeContact, isLoaded } = useEmergencyContacts();
    const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' });
    const [isAdding, setIsAdding] = useState(false);
    const { t } = useLanguage();

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault();
        if (newContact.name && newContact.relationship && newContact.phone) {
            addContact(newContact);
            setNewContact({ name: '', relationship: '', phone: '' });
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{t('profile.emergencyContacts.title')}</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 text-sm font-semibold bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full hover:bg-cyan-200"
                >
                   <PlusIcon /> {isAdding ? 'Cancel' : 'Add New'}
                </button>
            </div>
            
            {isAdding && (
                 <form onSubmit={handleAddContact} className="space-y-3 p-4 bg-slate-50 rounded-lg mb-4 border animate-fade-in-fast">
                    <input type="text" value={newContact.name} onChange={e => setNewContact(p => ({...p, name: e.target.value}))} placeholder={t('emergencyContacts.addContact.name')} required className="w-full p-2 border rounded-md" />
                    <input type="text" value={newContact.relationship} onChange={e => setNewContact(p => ({...p, relationship: e.target.value}))} placeholder={t('emergencyContacts.addContact.relationship')} required className="w-full p-2 border rounded-md" />
                    <input type="tel" value={newContact.phone} onChange={e => setNewContact(p => ({...p, phone: e.target.value}))} placeholder={t('emergencyContacts.addContact.phone')} required className="w-full p-2 border rounded-md" />
                    <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-2 rounded-lg">{t('emergencyContacts.addContact.button')}</button>
                </form>
            )}
            
            <div className="space-y-3">
                {isLoaded && contacts.length > 0 ? (
                    contacts.map(contact => (
                        <div key={contact.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-800">{contact.name} <span className="text-sm font-normal text-slate-500">({contact.relationship})</span></p>
                                <p className="text-slate-600">{contact.phone}</p>
                            </div>
                            <button onClick={() => removeContact(contact.id)} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon/></button>
                        </div>
                    ))
                ) : (
                    !isAdding && <p className="text-sm text-center text-slate-500 py-4">{t('emergencyContacts.noContacts.description')}</p>
                )}
            </div>
        </div>
    );
};
