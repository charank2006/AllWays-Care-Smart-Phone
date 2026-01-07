import React, { useState, useEffect, useCallback } from 'react';
import { getMedicalCamps } from '../services/geminiService';
import type { MedicalCamp } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CampCard: React.FC<{ camp: MedicalCamp }> = ({ camp }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h3 className="font-bold text-xl text-cyan-800">{camp.name}</h3>
            <p className="text-md font-semibold text-slate-700 mt-1">{camp.date}</p>
            <p className="text-sm text-slate-500">{camp.location}</p>
            <div className="mt-4 pt-3 border-t">
                <h4 className="font-semibold text-slate-800 text-sm mb-2">{t('camps.services.title')}</h4>
                <div className="flex flex-wrap gap-2">
                    {camp.services.map(service => (
                        <span key={service} className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            {service}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MedicalCamps: React.FC = () => {
    const { language, t } = useLanguage();
    const { addNotification } = useNotifications();
    const [camps, setCamps] = useState<MedicalCamp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCamps = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Using a generic area for simulation purposes
            const results = await getMedicalCamps("nearby rural district", language);
            setCamps(results);

            // Simulate notifications for new camps
            if (results.length > 0) {
                const alreadyNotified = sessionStorage.getItem(`notified-camp-${results[0].id}`);
                if (!alreadyNotified) {
                    addNotification({
                        type: 'alert',
                        message: t('camps.notification', {
                            name: results[0].name,
                            location: results[0].location,
                            date: results[0].date
                        })
                    });
                    sessionStorage.setItem(`notified-camp-${results[0].id}`, 'true');
                }
            }
        } catch (err) {
            setError(t('camps.error'));
        } finally {
            setIsLoading(false);
        }
    }, [language, t, addNotification]);

    useEffect(() => {
        fetchCamps();
    }, [fetchCamps]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('camps.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('camps.tagline')}</p>

            <div className="mt-8">
                {isLoading ? (
                    <LoadingSpinner text={t('camps.loading')} />
                ) : error ? (
                    <p className="text-red-600 text-center">{error}</p>
                ) : camps.length > 0 ? (
                    <div className="space-y-6">
                        {camps.map(camp => (
                            <CampCard key={camp.id} camp={camp} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-10 rounded-xl shadow-md border">
                        <h2 className="text-2xl font-bold text-slate-800">{t('camps.noCamps')}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalCamps;