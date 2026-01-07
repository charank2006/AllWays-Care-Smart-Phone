import React, { useState, useCallback, useEffect } from 'react';
import { findAshaWorkers } from '../services/geminiService';
import type { AshaWorker } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const ASHA_STORAGE_KEY = 'medfinder-connected-asha';

const AshaWorkerCard: React.FC<{
    worker: AshaWorker;
    onConnect: (worker: AshaWorker) => void;
    isConnected: boolean;
}> = ({ worker, onConnect, isConnected }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <h3 className="font-bold text-lg text-cyan-800">{worker.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{worker.area}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p><strong>Phone:</strong> {worker.phone}</p>
                <p><strong>{t('asha.availability')}:</strong> {worker.availability}</p>
            </div>
            <button
                onClick={() => onConnect(worker)}
                disabled={isConnected}
                className="mt-4 w-full bg-cyan-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-cyan-700 disabled:bg-green-600 disabled:cursor-not-allowed"
            >
                {isConnected ? t('asha.connected.button') : t('asha.connect.button')}
            </button>
        </div>
    );
};

const AshaConnect: React.FC = () => {
    const { language, t } = useLanguage();
    const { addNotification } = useNotifications();
    const [area, setArea] = useState('');
    const [workers, setWorkers] = useState<AshaWorker[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connectedWorker, setConnectedWorker] = useState<AshaWorker | null>(null);

    useEffect(() => {
        const storedWorker = localStorage.getItem(ASHA_STORAGE_KEY);
        if (storedWorker) {
            setConnectedWorker(JSON.parse(storedWorker));
        }
    }, []);

    const handleSearch = useCallback(async () => {
        if (!area.trim()) {
            setError(t('asha.error.noInput'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setWorkers([]);
        try {
            const results = await findAshaWorkers(area, language);
            setWorkers(results);
        } catch (err) {
            setError(t('asha.error.fail'));
        } finally {
            setIsLoading(false);
        }
    }, [area, language, t]);
    
    const handleConnect = (worker: AshaWorker) => {
        localStorage.setItem(ASHA_STORAGE_KEY, JSON.stringify(worker));
        setConnectedWorker(worker);
        addNotification({
            type: 'alert',
            message: t('asha.connected.notification', { name: worker.name })
        });
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('asha.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('asha.tagline')}</p>

            {connectedWorker && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">{t('asha.myAsha.title')}</h2>
                    <AshaWorkerCard worker={connectedWorker} onConnect={() => {}} isConnected={true} />
                </div>
            )}
            
            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="area" className="block text-lg font-semibold text-slate-700 mb-2">
                    {t('asha.search.label')}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isLoading}
                        placeholder={t('asha.search.placeholder')}
                        className="flex-1 w-full p-3 border border-slate-300 rounded-lg"
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">
                        {isLoading ? t('asha.searching') : t('asha.search.button')}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            {isLoading && <LoadingSpinner text={t('asha.searching')} />}

            {workers.length > 0 && !isLoading && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('asha.results.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workers.map(worker => (
                            <AshaWorkerCard
                                key={worker.id}
                                worker={worker}
                                onConnect={handleConnect}
                                isConnected={connectedWorker?.id === worker.id}
                            />
                        ))}
                    </div>
                </div>
            )}
             {workers.length === 0 && !isLoading && area && (
                <p className="mt-4 text-center text-slate-600">{t('asha.noResults')}</p>
             )}
        </div>
    );
};

export default AshaConnect;