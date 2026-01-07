
import React, { useState } from 'react';

const UploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

interface RecordUploadStepProps {
    onAnalyze: (text: string, img?: { data: string, mimeType: string }) => void;
    isLoading: boolean;
    error: string | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

export const RecordUploadStep: React.FC<RecordUploadStepProps> = ({ onAnalyze, isLoading, error, fileInputRef }) => {
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

    const handleSubmit = () => {
        if (!recordText && !image) { return; }
        onAnalyze(recordText, image ?? undefined);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-2xl font-bold text-slate-800">Post-Visit Follow-Up</h2>
            <p className="mt-1 text-slate-600">Upload your doctor's report or lab results to get a simple explanation and automatically manage your new prescriptions.</p>
            <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <h4 className="font-bold text-amber-800">Privacy Warning</h4>
                <p className="text-amber-700">Please only upload anonymized reports.</p>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <textarea
                    value={recordText}
                    onChange={e => setRecordText(e.target.value)}
                    disabled={isLoading || !!image}
                    placeholder="Paste text from your report here..."
                    className="w-full h-32 p-3 border rounded-lg disabled:bg-slate-100"
                />
                <div className="text-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isLoading || !!recordText}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !!recordText}
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 text-slate-500 font-bold py-3 px-4 rounded-lg hover:bg-slate-50 disabled:bg-slate-100"
                    >
                        <UploadIcon /> Upload Image
                    </button>
                    {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-16 w-16 mx-auto rounded" />}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                disabled={isLoading || (!recordText && !image)}
                className="mt-4 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400"
            >
                {isLoading ? 'Analyzing...' : 'Analyze My Report'}
            </button>
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </div>
    );
};
