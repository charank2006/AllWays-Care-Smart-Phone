
import React, { useState, useCallback } from 'react';
import { getPersonalizedPlan } from '../services/geminiService';
import type { HealthPlan } from '../types';
import { MultiStepLoader } from '../components/MultiStepLoader';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { SignLanguageInterpreter } from '../components/SignLanguageInterpreter';
import { speak } from '../utils/tts';

const DietIcon = () => <span className="text-4xl">🍎</span>;
const ExerciseIcon = () => <span className="text-4xl">🏃</span>;
const WellbeingIcon = () => <span className="text-4xl">🧘</span>;

const healthGoals = ['Lose Weight', 'Build Muscle', 'Reduce Stress', 'Heart Health', 'More Energy'];
const PLAN_STEPS = ['Analyzing profile', 'Crafting diet', 'Designing workout', 'Finalizing wellbeing'];

const PersonalizedHealthPlan: React.FC<{ isLowConnectivity: boolean }> = ({ isLowConnectivity }) => {
    const [goal, setGoal] = useState('');
    const [preferences, setPreferences] = useState('');
    const [plan, setPlan] = useState<HealthPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language, speechCode } = useLanguage();
    const { settings } = useAccessibility();

    const handleGeneratePlan = useCallback(async () => {
        if (!goal) {
            setError('Please select a goal.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlan(null);
        try {
            const result = await getPersonalizedPlan(goal, preferences, language);
            setPlan(result);
            
            const summary = `I've created a plan for ${result.goal}. Diet focus: ${result.diet.summary}. Exercise focus: ${result.exercise.summary}.`;
            if (settings.persona === 'blind') {
                speak(summary, speechCode);
            }
        } catch (err) {
            setError('Failed to generate plan.');
        } finally {
            setIsLoading(false);
        }
    }, [goal, preferences, language, settings.persona, speechCode]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-12">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personalized Wellness</h1>
                <p className="text-lg text-slate-600">AI health blueprint tailored for you.</p>
            </header>

            <SignLanguageInterpreter text={plan ? `${plan.diet.summary} ${plan.exercise.summary}` : ''} isActive={settings.persona === 'deaf'} />

            <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-200">
                <div className="mb-8">
                    <label className="block text-lg font-black text-slate-800 mb-4">What is your primary goal?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {healthGoals.map(g => (
                            <button 
                                key={g} 
                                onClick={() => setGoal(g)} 
                                className={`p-4 font-black rounded-2xl border-2 transition-all ${goal === g ? 'bg-cyan-600 text-white border-cyan-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-300'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-8">
                    <label htmlFor="preferences" className="block text-lg font-black text-slate-800 mb-4">Any restrictions or preferences?</label>
                    <input
                        type="text"
                        id="preferences"
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="e.g. Vegetarian, No heavy lifting"
                        className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading || !goal}
                    className="w-full bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-black disabled:bg-slate-400 shadow-lg active:scale-95 transition-all text-xl"
                >
                    {isLoading ? 'Crafting Plan...' : 'Generate Plan'}
                </button>
            </div>

            {isLoading && <MultiStepLoader steps={PLAN_STEPS} loadingText="AI is crunching health data..." />}

            {plan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                    <PlanSection icon={<DietIcon />} title="Diet" summary={plan.diet.summary} items={plan.diet.mealSuggestions} color="bg-emerald-50" isLowConnectivity={isLowConnectivity} />
                    <PlanSection icon={<ExerciseIcon />} title="Fitness" summary={plan.exercise.summary} items={plan.exercise.weeklyRoutine} color="bg-blue-50" isLowConnectivity={isLowConnectivity} />
                    <PlanSection icon={<WellbeingIcon />} title="Wellbeing" summary={plan.wellbeing.summary} items={plan.wellbeing.practices} color="bg-purple-50" isLowConnectivity={isLowConnectivity} />
                </div>
            )}
        </div>
    );
};

const PlanSection = ({ icon, title, summary, items, color, isLowConnectivity }: any) => (
    <div className={`p-6 rounded-[32px] border border-white shadow-sm ${color}`}>
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
        </div>
        <p className="text-sm font-bold text-slate-800/70 leading-snug mb-4">{summary}</p>
        {!isLowConnectivity && (
            <ul className="space-y-2 border-t border-black/5 pt-4">
                {items.map((item: string, i: number) => (
                    <li key={i} className="text-xs font-bold text-slate-700 flex items-start gap-2">
                        <span className="mt-1">•</span>
                        {item}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default PersonalizedHealthPlan;
