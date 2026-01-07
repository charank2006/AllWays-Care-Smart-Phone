
import React, { useState, useCallback, useEffect } from 'react';
import { getMedicineInfo, findMedicalResources } from '../services/geminiService';
import type { MedicineInfo, View, FamilyMember, MedicalResource } from '../types';
import { useCart } from '../hooks/useCart';
import { useVoiceControl } from '../context/VoiceControlContext';
import { useLanguage } from '../context/LanguageContext';
import { useFamilyStore } from '../App';
import { DictationButton } from '../components/DictationButton';

const PriceIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CartIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LocationIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

interface MedicineFinderProps {
    setActiveView: (view: View) => void;
    isLowConnectivity: boolean;
}

const MedicineFinder: React.FC<MedicineFinderProps> = ({ setActiveView, isLowConnectivity }) => {
    const { medicineInput, setMedicineInput, submitTrigger } = useVoiceControl();
    const { language, t } = useLanguage();
    const { actions } = useFamilyStore();
    const currentUserProfile: FamilyMember = { id: 'currentUser', name: t('familyHub.myProfile'), relationship: 'Me', age: '', avatar: '👤' };
    const selectedMember = useFamilyStore(state => actions.getSelectedMember(currentUserProfile));

    const [info, setInfo] = useState<MedicineInfo | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);
    const [nearbyHospitals, setNearbyHospitals] = useState<MedicalResource[]>([]);
    
    const { addToCart } = useCart();

    const handleSearch = useCallback(async () => {
        if (!medicineInput.trim()) {
            setError(t('medicineFinder.errorNoInput'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setInfo(null);
        setAddedToCart(false);
        setQuantity(1);
        try {
            const result = await getMedicineInfo(medicineInput, language);
            setInfo(result);
        } catch (err) {
            setError(t('medicineFinder.errorFetch'));
        } finally {
            setIsLoading(false);
        }
    }, [medicineInput, language, t]);

    const handleFindHospitals = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported.");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const results = await findMedicalResources("Hospitals and clinics", language, pos.coords.latitude, pos.coords.longitude);
                setNearbyHospitals(results);
            } catch (err) {
                setError("Failed to find nearby facilities.");
            } finally {
                setIsLocating(false);
            }
        }, () => {
            setError("Permission denied for location.");
            setIsLocating(false);
        });
    }, [language]);

    useEffect(() => {
        if (submitTrigger > 0 && medicineInput) {
            handleSearch();
        }
    }, [submitTrigger, medicineInput, handleSearch]);

    const handleAddToCart = () => {
        if (info) {
            addToCart(info, quantity, { id: selectedMember.id, name: selectedMember.name });
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-20">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('sidebar.orderMedicine')}</h1>
            <p className="mt-2 text-lg text-slate-600 font-medium">
                {t('medicineFinder.tagline')} <span className="font-bold text-cyan-700">{selectedMember.name}</span>
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-200">
                    <label htmlFor="medicine" className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                        Search Medicines
                    </label>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                id="medicine"
                                value={medicineInput}
                                onChange={(e) => setMedicineInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                disabled={isLoading}
                                placeholder={t('medicineFinder.placeholder')}
                                className="w-full p-4 pr-12 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-cyan-500 transition-all outline-none font-bold"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <DictationButton onTranscript={(text) => setMedicineInput(text)} />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="w-full bg-cyan-600 text-white font-black py-4 rounded-2xl hover:bg-cyan-700 disabled:bg-slate-300 shadow-lg active:scale-95 transition-all"
                        >
                            {isLoading ? 'FINDING...' : t('medicineFinder.buttonSearch')}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[32px] shadow-lg border border-slate-800 flex flex-col justify-between">
                    <div>
                        <p className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-2">Emergency Care</p>
                        <h3 className="text-white text-xl font-bold leading-tight">Find the nearest hospital or urgent care clinic instantly.</h3>
                    </div>
                    <button 
                        onClick={handleFindHospitals}
                        disabled={isLocating}
                        className="mt-6 flex items-center justify-center gap-3 bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-slate-100 disabled:bg-slate-600 shadow-xl active:scale-95 transition-all"
                    >
                        <LocationIcon />
                        {isLocating ? 'LOCATING...' : 'FIND NEARBY HOSPITALS'}
                    </button>
                </div>
            </div>

            {error && <p className="mt-6 p-4 bg-red-50 text-red-700 font-bold rounded-2xl text-center border-2 border-red-100">{error}</p>}

            {isLoading && (
                 <div className="text-center py-20">
                    <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest">{t('medicineFinder.loadingText')}</p>
                </div>
            )}
            
            {info && (
                <div className="mt-8 bg-white p-8 rounded-[40px] shadow-2xl border-4 border-cyan-500 animate-slide-up">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">{info.name}</h2>
                                    {info.requiresPrescription && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-full uppercase tracking-widest">Rx Required</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-cyan-600">${info.price.toFixed(2)}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Per unit price</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed mb-8">{info.description}</p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-100">
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center font-black bg-white rounded-xl shadow-sm">-</button>
                                    <span className="w-8 text-center font-black text-xl">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center font-black bg-white rounded-xl shadow-sm">+</button>
                                </div>
                                <button onClick={handleAddToCart} className="flex-1 w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-200">
                                    <CartIcon /> ADD TO PHARMACY CART
                                </button>
                            </div>
                            {addedToCart && (
                                <div className="mt-6 text-center p-4 bg-green-50 text-green-700 font-black rounded-2xl animate-fade-in flex items-center justify-center gap-2">
                                    <span>✅ SUCCESS!</span> 
                                    <button onClick={() => setActiveView('cart')} className="underline hover:text-green-900">GO TO CHECKOUT</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {nearbyHospitals.length > 0 && (
                <div className="mt-12 space-y-4 animate-fade-in">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Hospitals Found Near You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nearbyHospitals.map(res => (
                            <div key={res.id} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm hover:border-cyan-500 transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg leading-tight mb-1">{res.name}</h4>
                                        <p className="text-[10px] font-black text-cyan-500 uppercase">{res.distance} away</p>
                                    </div>
                                    <a href={`tel:${res.phone}`} className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl hover:bg-cyan-100 transition-colors">📞</a>
                                </div>
                                <p className="mt-4 text-sm text-slate-500 font-medium">{res.address}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineFinder;
