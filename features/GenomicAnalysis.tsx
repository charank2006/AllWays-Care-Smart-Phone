
import React, { useState, useCallback } from 'react';
import { explainGenomicData } from '../services/geminiService';
import type { GenomicMarkerExplanation } from '../types';
import { useLanguage } from '../context/LanguageContext';

const GenomicAnalysis: React.FC = () => {
    const [genomicText, setGenomicText] = useState('');
    const [explanation, setExplanation] = useState<GenomicMarkerExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const handleExplain = useCallback(async () => {
        if (!genomicText.trim()) {
            setError('Please paste some text from your genomics report.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setExplanation(null);
        try {
            const result = await explainGenomicData(genomicText, language);
            setExplanation(result);
        } catch (err) {
            setError('Failed to get an explanation from the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [genomicText, language]);
    
    const setExample = (example: string) => {
        setGenomicText(example);
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Genomic Explainer</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">Learn about genetic markers in simple terms.</p>

            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <h4 className="font-bold text-amber-800">Educational Tool & Privacy Warning</h4>
                <p className="text-amber-700">This tool is for informational purposes only and is not medical advice. Do not enter any personally identifiable information. Only use anonymized data, such as a specific gene or marker ID.</p>
            </div>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <label htmlFor="record" className="block text-lg font-semibold text-slate-700 mb-2">
                    Paste anonymized data snippet below
                </label>
                <textarea
                    id="record"
                    value={genomicText}
                    onChange={(e) => setGenomicText(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g., 'rs1801133 (C;T)'"
                    className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 transition duration-200 font-mono"
                />
                 <div className="text-sm text-slate-500 mt-2">
                    Try an example:
                    <button onClick={() => setExample('rs1801133')} className="ml-2 font-semibold text-cyan-600 hover:underline">rs1801133</button>
                    <button onClick={() => setExample('rs429358')} className="ml-2 font-semibold text-cyan-600 hover:underline">rs429358 (APOE)</button>
                </div>
                <button
                    onClick={handleExplain}
                    disabled={isLoading}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400 transition-colors"
                >
                    {isLoading ? 'Explaining...' : 'Explain My Data'}
                </button>
            </div>

            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}

            {isLoading && (
                 <div className="text-center my-8">
                    <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600">AI is researching the data...</p>
                </div>
            )}

            {explanation && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">AI Explanation for <span className="font-mono text-cyan-700">{explanation.marker}</span></h2>
                    <div className="mt-4 space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-semibold text-slate-500">Associated Gene</p>
                            <p className="text-lg font-bold text-slate-800">{explanation.gene}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                             <p className="text-sm font-semibold text-slate-500">Simple Summary</p>
                             <p className="text-slate-700">{explanation.summary}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                             <p className="text-sm font-semibold text-slate-500">Reference Information</p>
                             <p className="text-slate-700">{explanation.reference_info}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GenomicAnalysis;
