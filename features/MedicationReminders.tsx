import React, { useState } from 'react';
import { useMedicationReminders } from '../hooks/useMedicationReminders';
import type { MedicationReminderInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';

const ClockIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const ReminderCard: React.FC<{ reminder: MedicationReminderInfo, onRemove: (id: string) => void }> = ({ reminder, onRemove }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 text-3xl font-bold text-cyan-600 bg-cyan-50 p-3 rounded-lg">
                    {reminder.time}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{reminder.medicineName}</h3>
                    <p className="text-sm text-slate-500 font-medium">{`For: ${reminder.patientName} | Dosage: ${reminder.dosage}`}</p>
                    {reminder.phone && <p className="text-sm text-slate-500 font-medium">{t('reminders.phoneLabel')}: {reminder.phone}</p>}
                </div>
            </div>
            <button
                onClick={() => onRemove(reminder.id)}
                className="flex-shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label={t('reminders.removeAria', { medicine: reminder.medicineName })}
            >
                <TrashIcon />
            </button>
        </div>
    );
};


const MedicationReminders: React.FC = () => {
    const { reminders, addReminder, removeReminder, isLoaded } = useMedicationReminders();
    const [newReminder, setNewReminder] = useState({ patientName: '', medicineName: '', dosage: '', time: '09:00', phone: '' });
    const { t } = useLanguage();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewReminder(prev => ({ ...prev, [name]: value }));
    };

    const handleAddReminder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newReminder.patientName && newReminder.medicineName && newReminder.dosage && newReminder.time) {
            addReminder(newReminder);
            setNewReminder({ patientName: '', medicineName: '', dosage: '', time: '09:00', phone: '' });
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('reminders.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('reminders.tagline')}</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {isLoaded && reminders.length > 0 ? (
                        reminders.sort((a, b) => a.time.localeCompare(b.time)).map(reminder => (
                            <ReminderCard key={reminder.id} reminder={reminder} onRemove={removeReminder} />
                        ))
                    ) : (
                        <div className="text-center bg-white p-10 rounded-xl shadow-md border border-slate-200 h-full flex flex-col justify-center items-center">
                            <ClockIcon />
                            <h2 className="mt-4 text-2xl font-bold text-slate-800">{t('reminders.noReminders.title')}</h2>
                            <p className="mt-2 text-slate-600">{t('reminders.noReminders.description')}</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('reminders.add.title')}</h2>
                    <form onSubmit={handleAddReminder} className="space-y-4">
                        <div>
                            <label htmlFor="patientName" className="block text-sm font-medium text-slate-700">{t('reminders.add.patientName')}</label>
                            <input type="text" name="patientName" id="patientName" value={newReminder.patientName} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., Mom, Self" />
                        </div>
                        <div>
                            <label htmlFor="medicineName" className="block text-sm font-medium text-slate-700">{t('reminders.add.medicineName')}</label>
                            <input type="text" name="medicineName" id="medicineName" value={newReminder.medicineName} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., Metformin" />
                        </div>
                        <div>
                            <label htmlFor="dosage" className="block text-sm font-medium text-slate-700">{t('reminders.add.dosage')}</label>
                            <input type="text" name="dosage" id="dosage" value={newReminder.dosage} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 500mg" />
                        </div>
                         <div>
                            <label htmlFor="time" className="block text-sm font-medium text-slate-700">{t('reminders.add.time')}</label>
                            <input type="time" name="time" id="time" value={newReminder.time} onChange={handleChange} required className="mt-1 w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">{t('reminders.add.phone')}</label>
                            <input type="tel" name="phone" id="phone" value={newReminder.phone} onChange={handleChange} className="mt-1 w-full p-2 border border-slate-300 rounded-md" placeholder="e.g., 555-123-4567" />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700">
                            <PlusIcon />
                            {t('reminders.add.button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MedicationReminders;