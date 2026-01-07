
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface PersonalEmergencyInfoProps {
    userMobile: string;
}

const LOCAL_STORAGE_KEY_PREFIX = 'allwayscare-personal-info-';

export const PersonalEmergencyInfo: React.FC<PersonalEmergencyInfoProps> = ({ userMobile }) => {
    const { t } = useLanguage();
    const [info, setInfo] = useState({
        allergies: '',
        medications: '',
        conditions: '',
    });
    const [isSaved, setIsSaved] = useState(false);
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${userMobile}`;

    useEffect(() => {
        try {
            const storedInfo = localStorage.getItem(storageKey);
            if (storedInfo) {
                setInfo(JSON.parse(storedInfo));
            }
        } catch (error) {
            console.error("Failed to load personal info", error);
        }
    }, [storageKey]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem(storageKey, JSON.stringify(info));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save personal info", error);
        }
    }, [storageKey, info]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">{t('profile.emergencyInfo.title')}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">{t('profile.emergencyInfo.description')}</p>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-slate-700">{t('profile.emergencyInfo.allergies')}</label>
                    <textarea id="allergies" name="allergies" value={info.allergies} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" placeholder={t('profile.emergencyInfo.allergiesPlaceholder')} />
                </div>
                 <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-slate-700">{t('profile.emergencyInfo.medications')}</label>
                    <textarea id="medications" name="medications" value={info.medications} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" placeholder={t('profile.emergencyInfo.medicationsPlaceholder')} />
                </div>
                 <div>
                    <label htmlFor="conditions" className="block text-sm font-medium text-slate-700">{t('profile.emergencyInfo.conditions')}</label>
                    <textarea id="conditions" name="conditions" value={info.conditions} onChange={handleChange} rows={2} className="mt-1 w-full p-2 border border-slate-300 rounded-lg" placeholder={t('profile.emergencyInfo.conditionsPlaceholder')} />
                </div>
                <button type="submit" className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${isSaved ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                    {isSaved ? t('profile.emergencyInfo.savedMessage') : t('profile.emergencyInfo.saveButton')}
                </button>
            </form>
        </div>
    );
};
