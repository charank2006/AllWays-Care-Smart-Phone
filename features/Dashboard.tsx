
import React, { useCallback } from 'react';
import type { View } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useVoiceControl } from '../context/VoiceControlContext';
import { speak } from '../utils/tts';

const AssistantIcon = () => <span className="text-2xl">🤖</span>;
const FamilyIcon = () => <span className="text-2xl">👨‍👩‍👧‍👦</span>;
const PillIcon = () => <span className="text-2xl">💊</span>;
const VitalsIcon = () => <span className="text-2xl">💓</span>;
const ResourceIcon = () => <span className="text-2xl">🏥</span>;
const OrderIcon = () => <span className="text-2xl">🛒</span>;
const ReminderIcon = () => <span className="text-2xl">⏰</span>;
const BridgeIcon = () => <span className="text-2xl">🦻</span>;
const RecordsIcon = () => <span className="text-2xl">📋</span>;

interface DashboardProps {
  setActiveView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { t, speechCode } = useLanguage();
  const { settings } = useAccessibility();
  const { setPendingNavigation, setAwaitingResponse, setIsListening } = useVoiceControl();
  
  const handleTouchNarrate = useCallback((view: View, label: string, desc: string) => {
    if (settings.persona !== 'blind') return;
    window.speechSynthesis.cancel();
    speak(`${label}. ${desc}. Say yes to open this feature.`, speechCode, () => {
        setPendingNavigation(view);
        setAwaitingResponse('yes_no');
        setIsListening(true);
        document.getElementById('voice-trigger-btn')?.click();
    });
  }, [settings.persona, speechCode, setPendingNavigation, setAwaitingResponse, setIsListening]);

  return (
    <div className="animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">{t('dashboard.welcome')}</h1>
            <p className="mt-2 text-xl text-slate-600 font-medium">{t('dashboard.tagline')}</p>
        </div>
        {(settings.persona === 'speech-impaired' || settings.persona === 'deaf' || settings.persona === 'none') && (
            <button 
                onClick={() => setActiveView('inclusive-bridge')} 
                className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95"
            >
                <span className="text-2xl">🦻</span> {t('sidebar.inclusiveBridge').toUpperCase()}
            </button>
        )}
      </div>

      <div className="space-y-16">
        <section>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t('dashboard.essentialServices')}</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    title={t('dashboard.aiAssistant.title')} description={t('dashboard.aiAssistant.desc')} 
                    icon={<AssistantIcon />} onClick={() => setActiveView('ai-assistant')} 
                    onFocus={() => handleTouchNarrate('ai-assistant', t('dashboard.aiAssistant.title'), t('dashboard.aiAssistant.desc'))} 
                />
                <FeatureCard 
                    title={t('dashboard.inclusiveBridge.title')} description={t('dashboard.inclusiveBridge.desc')} 
                    icon={<BridgeIcon />} onClick={() => setActiveView('inclusive-bridge')} 
                    onFocus={() => handleTouchNarrate('inclusive-bridge', t('dashboard.inclusiveBridge.title'), t('dashboard.inclusiveBridge.desc'))} 
                />
                <FeatureCard 
                    title={t('dashboard.identifyPill.title')} description={t('dashboard.identifyPill.desc')} 
                    icon={<PillIcon />} onClick={() => setActiveView('medicine-identifier')} 
                    onFocus={() => handleTouchNarrate('medicine-identifier', t('dashboard.identifyPill.title'), t('dashboard.identifyPill.desc'))} 
                />
                <FeatureCard 
                    title={t('dashboard.orderMedicine.title')} description={t('dashboard.orderMedicine.desc')} 
                    icon={<OrderIcon />} onClick={() => setActiveView('price-comparison')} 
                    onFocus={() => handleTouchNarrate('price-comparison', t('dashboard.orderMedicine.title'), t('dashboard.orderMedicine.desc'))} 
                />
            </div>
        </section>

        <section>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t('dashboard.personalManagement')}</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    title={t('dashboard.familyHub.title')} description={t('dashboard.familyHub.desc')} 
                    icon={<FamilyIcon />} onClick={() => setActiveView('family-hub')} 
                    onFocus={() => {}} 
                />
                <FeatureCard 
                    title={t('dashboard.vitals.title')} description={t('dashboard.vitals.desc')} 
                    icon={<VitalsIcon />} onClick={() => setActiveView('vitals')} 
                    onFocus={() => {}} 
                />
                <FeatureCard 
                    title={t('dashboard.reminders.title')} description={t('dashboard.reminders.desc')} 
                    icon={<ReminderIcon />} onClick={() => setActiveView('medication-reminders')} 
                    onFocus={() => {}} 
                />
                <FeatureCard 
                    title={t('dashboard.records.title')} description={t('dashboard.records.desc')} 
                    icon={<RecordsIcon />} onClick={() => setActiveView('health-records')} 
                    onFocus={() => {}} 
                />
            </div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    onFocus: () => void;
}> = ({ title, description, icon, onClick, onFocus }) => (
    <button
        onClick={onClick}
        onFocus={onFocus}
        className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 text-left hover:shadow-2xl hover:-translate-y-2 hover:border-cyan-500 transition-all duration-300 flex flex-col items-start min-h-[200px] group"
    >
        <div className="p-4 rounded-[20px] bg-slate-50 mb-4 border border-slate-100 group-hover:bg-cyan-50 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-cyan-700 transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
    </button>
);

export default Dashboard;
