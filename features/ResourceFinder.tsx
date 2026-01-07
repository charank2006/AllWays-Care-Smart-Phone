
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { findMedicalResources } from '../services/geminiService';
import type { MedicalResource } from '../types';
import { useVoiceControl } from '../context/VoiceControlContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../hooks/useFavorites';
import { DictationButton } from '../components/DictationButton';
import { speak } from '../utils/tts';

const SearchIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const LocationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const StarIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-colors ${isFavorite ? 'text-yellow-400 fill-current' : 'text-slate-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const VerifiedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MapsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;

const ResourceCard: React.FC<{ resource: MedicalResource }> = ({ resource }) => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(resource.id);
    const { t } = useLanguage();

    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-black text-xl text-slate-800">{resource.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{resource.type}</p>
                        {resource.communityVerified && (
                             <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><VerifiedIcon /> Verified</span>
                        )}
                    </div>
                </div>
                <button 
                    onClick={() => isFav ? removeFavorite(resource.id) : addFavorite(resource)}
                    className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <StarIcon isFavorite={isFav} />
                </button>
            </div>
            <p className="mt-4 text-slate-600 font-medium">{resource.address}</p>
            
            {resource.mapsUri && (
                <a 
                    href={resource.mapsUri} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-3 inline-flex items-center gap-2 bg-cyan-600 text-white text-[10px] font-black px-4 py-2 rounded-full hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"
                >
                    <MapsIcon /> OPEN IN GOOGLE MAPS
                </a>
            )}

            <div className="mt-6 flex items-center justify-between border-t pt-4">
                <span className="text-xs font-black text-cyan-600 uppercase tracking-widest">
                    {resource.distance}
                </span>
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">Verified Provider</span>
            </div>
        </div>
    );
};

const ResourceFinder: React.FC = () => {
    const { resourceInput, setResourceInput, submitTrigger } = useVoiceControl();
    const { t, language, speechCode } = useLanguage();
    
    const [resources, setResources] = useState<MedicalResource[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = useCallback(async (query: string, lat?: number, long?: number) => {
        if (!query.trim()) return;
        
        setSearchPerformed(true);
        setIsLoading(true);
        setError(null);
        setResources([]);
        try {
            const results = await findMedicalResources(query, language, lat, long);
            setResources(results);
            if (results.length > 0) {
                speak(`I found ${results.length} locations.`, speechCode);
            } else {
                setError("I couldn't find any locations for that search. Please try a more general term like 'hospital'.");
            }
        } catch (err) {
            setError(t('resourceFinder.errorFetch'));
        } finally {
            setIsLoading(false);
        }
    }, [language, t, speechCode]);

    useEffect(() => {
        if (submitTrigger > 0 && resourceInput) {
            handleSearch(resourceInput);
        }
    }, [submitTrigger, resourceInput, handleSearch]);

    const handleGeoSearch = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        setSearchPerformed(true);
        setIsLocating(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                handleSearch("hospitals nearby", position.coords.latitude, position.coords.longitude);
            },
            () => {
                setIsLocating(false);
                setError("Location permission denied. Please allow access to find nearby clinics.");
            }
        );
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            <header className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Resource Finder</h1>
                <p className="mt-2 text-lg text-slate-600 font-medium">Locate healthcare facilities with real-time Google Maps grounding.</p>
            </header>

            <div className="bg-white p-8 rounded-[32px] shadow-lg border border-slate-200">
                <div className="flex flex-col gap-6">
                    <div className="relative group">
                        <input
                            type="text"
                            value={resourceInput}
                            onChange={(e) => setResourceInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(resourceInput)}
                            disabled={isLoading || isLocating}
                            placeholder="e.g., Hospital in Mumbai or Pharmacy nearby..."
                            className="w-full p-6 pr-16 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-xl font-bold focus:bg-white focus:border-cyan-500 transition-all outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 scale-125">
                             <DictationButton onTranscript={(text) => setResourceInput(text)} />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleSearch(resourceInput)}
                            disabled={isLoading || isLocating || !resourceInput}
                            className="flex-1 flex items-center justify-center gap-3 bg-cyan-600 text-white font-black py-5 px-6 rounded-[24px] hover:bg-cyan-700 disabled:bg-slate-300 shadow-lg transition-all active:scale-95"
                        >
                            <SearchIcon/>
                            {isLoading ? "SEARCHING..." : "SEARCH FACILITY"}
                        </button>
                        <button
                            onClick={handleGeoSearch}
                            disabled={isLoading || isLocating}
                            className="sm:px-10 flex items-center justify-center gap-3 bg-slate-800 text-white font-black py-5 px-6 rounded-[24px] hover:bg-black disabled:bg-slate-300 shadow-lg transition-all active:scale-95"
                        >
                            <LocationIcon/>
                            {isLocating ? "LOCATING..." : "FIND NEAR ME"}
                        </button>
                    </div>
                </div>
            </div>

            {error && <p className="mt-8 p-4 bg-red-50 text-red-700 font-bold rounded-2xl text-center border-2 border-red-100">{error}</p>}
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading || isLocating ? (
                     <div className="col-span-full text-center py-20 bg-white rounded-[40px] shadow-inner border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Accessing Google Maps Grounding...</p>
                    </div>
                ) : resources.length > 0 ? (
                    resources.map(res => <ResourceCard key={res.id} resource={res} />)
                ) : searchPerformed ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-[40px] border-2 border-slate-100">
                        <div className="text-6xl mb-6">🏜️</div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">No Grounding Data</h2>
                        <p className="text-slate-500 font-medium">Try adding a city name or choosing 'Find Near Me'.</p>
                    </div>
                ) : (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Waiting for input</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceFinder;
