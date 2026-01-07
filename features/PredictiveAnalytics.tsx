
import React, { useState, useCallback } from 'react';
import { getPredictiveAnalysis } from '../services/geminiService';
import type { LifestyleData, PredictiveAnalysis, HealthRisk } from '../types';
import { MultiStepLoader } from '../components/MultiStepLoader';
import { useLanguage } from '../context/LanguageContext';

const lifestyleOptions = [
    'Regular Exercise (3x/week)',
    'Balanced Diet',
    'Non-Smoker',
    'Limited Alcohol',
    'Sedentary Job',
    'High Stress Levels'
];

const ANALYTICS_STEPS = [
    'Processing your profile data',
    'Analyzing lifestyle factors',
    'Identifying potential long-term risks',
    'Compiling prevention strategies'
];

const getRiskLevelClass = (level: HealthRisk['riskLevel']) => {
    switch (level) {
        case 'High': return 'border-red-500 bg-red-50';
        case 'Medium': return 'border-orange-500 bg-orange-50';
        case 'Low': return 'border-yellow-500 bg-yellow-50';
        default: return 'border-slate-300 bg-slate-50';
    }
}

interface PredictiveAnalyticsProps {
    isLowConnectivity: boolean;
}

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ isLowConnectivity }) => {
    const [data, setData] = useState<LifestyleData>({ age: '', lifestyleFactors: [], familyHistory: '' });
    const [analysis, setAnalysis] = useState<PredictiveAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const handleLifestyleToggle = (factor: string) => {
        setData(prev => {
            const newFactors = prev.lifestyleFactors.includes(factor)
                ? prev.lifestyleFactors.filter(f => f !== factor)
                : [...prev.lifestyleFactors, factor];
            return { ...prev, lifestyleFactors: newFactors };
        });
    };

    const handleAnalyze = useCallback(async () => {
        if (!data.age) {
            setError('Please enter your age.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getPredictiveAnalysis(data, language);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to get predictive analysis from AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [data, language]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Predictive Health Analytics</h1>
            <p className="mt-1 text-base sm:text-lg text-slate-600">Understand potential long-term risks based on your lifestyle.</p>
            
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <h4 className="font-bold text-amber-800">Educational Tool Only</h4>
                <p className="text-amber-700">This AI analysis is for informational purposes and is not a medical diagnosis. It identifies potential risks based on statistical data. Always consult a healthcare professional.</p>
            </div>

            <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label htmlFor="age" className="block text-lg font-semibold text-slate-700 mb-2">Age</label>
                        <input type="number" id="age" value={data.age} onChange={e => setData(d => ({...d, age: e.target.value }))} className="w-full p-2 border border-slate-300 rounded-md" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-lg font-semibold text-slate-700 mb-2">Lifestyle Factors</label>
                        <div className="flex flex-wrap gap-2">
                            {lifestyleOptions.map(factor => (
                                <button key={factor} onClick={() => handleLifestyleToggle(factor)} className={`text-sm px-3 py-1.5 font-medium rounded-full border-2 ${data.lifestyleFactors.includes(factor) ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                                    {factor}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="mt-4">
                    <label htmlFor="familyHistory" className="block text-lg font-semibold text-slate-700 mb-2">Family Medical History (Optional)</label>
                    <input type="text" id="familyHistory" value={data.familyHistory} onChange={e => setData(d => ({...d, familyHistory: e.target.value}))} placeholder="e.g., 'History of heart disease, diabetes'" className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <button onClick={handleAnalyze} disabled={isLoading} className="mt-6 w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 disabled:bg-cyan-400">
                    {isLoading ? 'Analyzing...' : 'Analyze My Risk Factors'}
                </button>
            </div>
            
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
            
            {isLoading && (
                <MultiStepLoader 
                    steps={ANALYTICS_STEPS}
                    loadingText="AI is analyzing your profile..."
                />
            )}

            {analysis && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">AI Health Risk Analysis</h2>
                    <p className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-700">{analysis.summary}</p>
                    <div className="mt-4 space-y-4">
                        {analysis.potentialRisks.map((riskItem, i) => (
                            <div key={i} className={`border-l-4 rounded-r-lg p-4 ${getRiskLevelClass(riskItem.riskLevel)}`}>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-slate-800">{riskItem.risk}</h3>
                                    <span className={`px-2.5 py-0.5 text-sm font-medium rounded-full`}>
                                        {riskItem.riskLevel} Risk
                                    </span>
                                </div>

                                <p className="mt-1 text-slate-600">{riskItem.explanation}</p>
                                {!isLowConnectivity && (
                                    <div className="mt-3">
                                        <h4 className="font-semibold text-slate-700">Prevention Tips:</h4>
                                        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 mt-1">
                                            {riskItem.preventionTips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictiveAnalytics;
