
import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import type { MedicalResource } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FavoritesProps {
    isLowConnectivity: boolean;
}

const StarIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const FavoriteCard: React.FC<{ resource: MedicalResource, onRemove: (id: string) => void, isLowConnectivity: boolean }> = ({ resource, onRemove, isLowConnectivity }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-start justify-between gap-4">
        <div>
            <h3 className="font-bold text-lg text-cyan-800">{resource.name}</h3>
            <p className="text-sm text-slate-500 font-medium">{resource.type}</p>
            <p className="mt-2 text-slate-700">{resource.address}</p>
            {!isLowConnectivity && <p className="text-slate-600 text-sm">{resource.phone}</p>}
        </div>
        <button 
            onClick={() => onRemove(resource.id)}
            className="flex-shrink-0 p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            aria-label={`Remove ${resource.name} from favorites`}
        >
            <TrashIcon />
        </button>
    </div>
);


const Favorites: React.FC<FavoritesProps> = ({ isLowConnectivity }) => {
    const { favorites, removeFavorite, isLoaded } = useFavorites();
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('sidebar.myFavorites')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('favorites.tagline')}</p>

            <div className="mt-8">
                {!isLoaded ? (
                     <div className="text-center py-10">
                        <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-3 text-slate-600">{t('favorites.loading')}</p>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="space-y-4">
                        {favorites.map(resource => (
                            <FavoriteCard 
                                key={resource.id} 
                                resource={resource} 
                                onRemove={removeFavorite}
                                isLowConnectivity={isLowConnectivity}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-10 rounded-xl shadow-md border border-slate-200">
                        <StarIcon />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800">{t('favorites.emptyTitle')}</h2>
                        <p className="mt-2 text-slate-600">{t('favorites.emptyDescription')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
