
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface MedicalHistoryProps {
    userMobile: string;
}

const LOCAL_STORAGE_KEY_PREFIX = 'allwayscare-history-';

export const MedicalHistory: React.FC<MedicalHistoryProps> = ({ userMobile }) => {
    const { t } = useLanguage();
    const [history, setHistory] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userMobile}`;

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(storageKey);
            if (storedHistory) {
                setHistory(storedHistory);
            }
        } catch (error) {
            console.error("Failed to load medical history", error);
        }
    }, [storageKey]);
    
    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem(storageKey, history);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save medical history", error);
        }
    }, [storageKey, history]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">{t('profile.medicalHistory.title')}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">{t('profile.medicalHistory.description')}</p>
            <form onSubmit={handleSave}>
                <textarea
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    rows={8}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder={t('profile.medicalHistory.placeholder')}
                />
                 <button type="submit" className={`mt-4 w-full font-bold py-2 px-4 rounded-lg transition-colors ${isSaved ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                    {isSaved ? t('profile.medicalHistory.savedMessage') : t('profile.medicalHistory.saveButton')}
                </button>
            </form>
        </div>
    );
};
