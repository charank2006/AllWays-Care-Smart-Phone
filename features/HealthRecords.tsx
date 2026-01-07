import React, { useState, useCallback, useRef } from 'react';
import type { HealthRecordAnalysis, FamilyMember } from '../types';
import { analyzeHealthRecord } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useFamilyStore } from '../App';

const UploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

const HealthRecords: React.FC = () => {
    const { language, t } = useLanguage();
    const { actions } = useFamilyStore();
    const currentUserProfile: FamilyMember = { id: 'currentUser', name: t('familyHub.myProfile'), relationship: 'Me', age: '', avatar: '👤' };
    const selectedMember = useFamilyStore(state => actions.getSelectedMember(currentUserProfile));

    const [analysis, setAnalysis] = useState<HealthRecordAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [recordText, setRecordText] = useState('');
    const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setImage({ data: result.split(',')[1], mimeType: file.type });
        };
        reader.readAsDataURL(file);
    };
    
    const handleAnalysis = useCallback(async () => {
        if (!recordText.trim() && !image) {
            setError('Please provide text or an image of your health record.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeHealthRecord(recordText, language, image ?? undefined);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze the health record.');
        } finally {
            setIsLoading(false);
        }
    }, [recordText, image, language]);
    
    const handleReset = () => {
        setRecordText('');
        setImage(null);
        setImagePreview(null);
        setAnalysis(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{t('healthRecords.title')}</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">
                {t('healthRecords.tagline')} <span className="font-semibold text-cyan-700">For: {selectedMember.name}</span>
            </p>
            
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <h4 className="font-bold text-amber-800">{t('healthRecords.privacy.title')}</h4>
                <p className="text-amber-700">{t('healthRecords.privacy.text')}</p>
            </div>

            {!analysis && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow-md border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <textarea value={recordText} onChange={e => setRecordText(e.target.value)} disabled={isLoading || !!image} placeholder={t('healthRecords.pastePlaceholder')} className="w-full h-40 p-3 border rounded-lg disabled:bg-slate-100" />
                        <div className="text-center space-y-2">
                           <p className="text-sm text-slate-500 font-semibold">OR</p>
                           <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" disabled={isLoading || !!recordText} />
                           <button onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!recordText} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 disabled:bg-slate-100"><UploadIcon /> {t('healthRecords.uploadButton')} of report or prescription</button>
                           {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-24 w-auto mx-auto rounded" />}
                        </div>
                   </div>
                   <button onClick={handleAnalysis} disabled={isLoading || (!recordText && !image)} className="mt-4 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400">
                       {isLoading ? t('healthRecords.button.analyzing') : `${t('healthRecords.button.analyze')} for ${selectedMember.name}`}
                   </button>
                   {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
                </div>
            )}


            {isLoading && <LoadingSpinner text={t('healthRecords.loading')} />}

            {analysis && !isLoading && (
                <div className="mt-6 bg-white p-6 rounded-xl shadow-md border animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">{t('healthRecords.results.title')} for {selectedMember.name}</h2>
                    <div className="prose max-w-none mt-4 text-slate-700">
                        <h3 className="font-bold text-slate-800">{t('healthRecords.results.explanation')}:</h3>
                        <div>{analysis.explanation.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
                    </div>
                    {analysis.prescribedMedications.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-bold text-slate-800">{t('healthRecords.results.prescriptions')}:</h3>
                            <ul className="list-none mt-2 text-slate-700 space-y-2">
                                {analysis.prescribedMedications.map((m, i) => (
                                    <li key={i} className="p-2 bg-slate-50 rounded-md">
                                        <strong className="text-slate-900">{m.name}</strong> - {m.dosage}, {m.frequency}
                                        {m.purpose && <><br/><em className="text-sm text-slate-600">Purpose: {m.purpose}</em></>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button onClick={handleReset} className="mt-6 w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-700">{t('healthRecords.results.analyzeAnother')}</button>
                </div>
            )}
        </div>
    );
};

export default HealthRecords;