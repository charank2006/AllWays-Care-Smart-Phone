
import React from 'react';
import type { MedicalResource } from '../../types';
import { useFavorites } from '../../hooks/useFavorites';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const StarIcon = ({isFavorite}: {isFavorite: boolean}) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-colors ${isFavorite ? 'text-yellow-400 fill-current' : 'text-slate-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const MapsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;

interface ResourceFinderStepProps {
    resources: MedicalResource[];
    onBookResource: (r: MedicalResource) => void;
    isLowConnectivity: boolean;
    isLoading: boolean;
}

export const ResourceFinderStep: React.FC<ResourceFinderStepProps> = ({ resources, onBookResource, isLowConnectivity, isLoading }) => {
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();

    if (isLoading) return <LoadingSpinner text="Finding nearby specialists..." />;
    
    return (
        <div className="space-y-4">
            {resources.length > 0 ? resources.map(res => (
                <div key={res.id} className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg text-cyan-800">{res.name}</h3>
                            <p className="text-sm text-slate-500 font-medium">{res.type}</p>
                            <p className="mt-2 text-slate-700">{res.address}</p>
                            {!isLowConnectivity && <p className="text-slate-600 text-sm">{res.phone}</p>}
                            
                            {res.mapsUri && (
                                <a 
                                    href={res.mapsUri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:underline"
                                >
                                    <MapsIcon /> View on Maps
                                </a>
                            )}
                        <button  onClick={() =>    isFavorite(res.id)      ? removeFavorite(res.id)      : addFavorite(res)  }>  <StarIcon isActive={isFavorite(res.id)} /></button>

                    {(res.type === 'Hospital' || res.type === 'Clinic') && (
                        <button onClick={() => onBookResource(res)} className="mt-4 w-full bg-cyan-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-cyan-700 text-sm">
                            Book Appointment
                        </button>
                    )}
                </div>
            )) : <p className="text-center text-slate-600 bg-white py-8 rounded-xl shadow-md border">No resources found for this specialty.</p>}
        </div>
    );
};
