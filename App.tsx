
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import Dashboard from './features/Dashboard';
import Telemedicine from './features/Telemedicine';
import CommunityForum from './features/CommunityForum';
import WearableIntegration from './features/WearableIntegration';
import MedicineFinder from './features/MedicineFinder';
import MentalHealthSupport from './features/MentalHealthSupport';
import PersonalizedHealthPlan from './features/PersonalizedHealthPlan';
import PredictiveAnalytics from './features/PredictiveAnalytics';
import AIInsights from './features/AIInsights';
import GenomicAnalysis from './features/GenomicAnalysis';
import Favorites from './features/Favorites';
import Cart from './features/Cart';
import { VoiceControlProvider, useVoiceControl } from './context/VoiceControlContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { LiveAudioProvider, useLiveAudio } from './context/LiveAudioContext';
import { LiveVoiceInterface } from './components/LiveVoiceInterface';
import { VoiceControlButton } from './components/VoiceControlButton';
import { ChatAssistantButton } from './components/ChatAssistantButton';
import { ChatbotWidget } from './components/ChatbotWidget';
import { CommandToast } from './components/CommandToast';
import { NotificationBell } from './components/NotificationBell';
import { MedicationReminder } from './components/MedicationReminder';
import AIHealthAssistant from './features/AIHealthAssistant';
import ResourceFinder from './features/ResourceFinder';
import SymptomChecker from './features/SymptomChecker';
import AppointmentPrep from './features/AppointmentPrep';
import HealthRecords from './features/HealthRecords';
import QuickCommunicate from './features/QuickCommunicate';
import VitalsView from './features/vitals/VitalsView';
import MedicineIdentifier from './features/MedicineIdentifier';
import InclusiveBridge from './features/InclusiveBridge';
import type { View, FamilyMember } from './types';
import { EmergencyProvider } from './context/EmergencyContext';
import { EmergencySOSButton } from './components/EmergencySOSButton';
import EmergencyMode from './features/EmergencyMode';
import MedicationReminders from './features/MedicationReminders';
import AuthPage from './features/LoginPage';
import ProfilePage from './features/ProfilePage';
import AshaConnect from './features/AshaConnect';
import MedicalCamps from './features/MedicalCamps';
import FamilyHub from './features/FamilyHub';
import HealthSchemes from './features/HealthSchemes';
import { create as createStore } from 'zustand';
import { speak } from './utils/tts';

// --- Global Family Store ---
const FAMILY_MEMBERS_KEY = 'allwayscare-family-members';
interface FamilyState {
    members: FamilyMember[];
    selectedMemberId: string;
    hydrated: boolean;
    actions: {
        hydrate: () => void;
        addMember: (member: Omit<FamilyMember, 'id'>) => void;
        removeMember: (id: string) => void;
        selectMember: (id: string) => void;
        getSelectedMember: (currentUserProfile: FamilyMember) => FamilyMember;
    };
}
export const useFamilyStore = createStore<FamilyState>((set, get) => ({
    members: [],
    selectedMemberId: 'currentUser',
    hydrated: false,
    actions: {
        hydrate: () => {
            const stored = localStorage.getItem(FAMILY_MEMBERS_KEY);
            if (stored) set({ members: JSON.parse(stored), hydrated: true });
            else set({ hydrated: true });
        },
        addMember: (member) => {
            const newMembers = [...get().members, { ...member, id: new Date().toISOString() }];
            localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(newMembers));
            set({ members: newMembers });
        },
        removeMember: (id) => {
            const newMembers = get().members.filter(m => m.id !== id);
            localStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(newMembers));
            set({ members: newMembers });
        },
        selectMember: (id) => set({ selectedMemberId: id }),
        getSelectedMember: (currentUser) => {
            const state = get();
            return state.selectedMemberId === 'currentUser' ? currentUser : state.members.find(m => m.id === state.selectedMemberId) || currentUser;
        }
    }
}));

const VisualCuesOverlay: React.FC = () => {
    const { isListening } = useVoiceControl();
    const { settings } = useAccessibility();
    const { isLiveActive } = useLiveAudio();
    if (!settings.visualCuesMode) return null;
    return (
        <div className={`fixed inset-0 pointer-events-none z-[100] transition-all duration-500 ${settings.persona === 'deaf' ? 'animate-vibrate-visual' : ''}`}>
            {(isListening || isLiveActive) && <div className="absolute inset-0 border-[12px] border-cyan-500/40 animate-pulse"></div>}
        </div>
    );
};

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('allwayscare-user-token'));

    return (
        <LanguageProvider>
            <AccessibilityProvider>
                <NotificationProvider>
                    <EmergencyProvider>
                        <VoiceControlProvider>
                            <LiveAudioProvider onNavigate={(v) => window.dispatchEvent(new CustomEvent('nav', {detail: v}))}>
                                {!isLoggedIn ? (
                                    <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />
                                ) : (
                                    <AppContentWrapper onLogout={() => setIsLoggedIn(false)} />
                                )}
                            </LiveAudioProvider>
                        </VoiceControlProvider>
                    </EmergencyProvider>
                </NotificationProvider>
            </AccessibilityProvider>
        </LanguageProvider>
    );
};

const AppContentWrapper: React.FC<{onLogout: () => void}> = ({ onLogout }) => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    
    useEffect(() => {
        const handleNav = (e: any) => setActiveView(e.detail);
        window.addEventListener('nav', handleNav);
        return () => window.removeEventListener('nav', handleNav);
    }, []);

    return <AppInner activeView={activeView} setActiveView={setActiveView} onLogout={onLogout} />;
};

const AppInner: React.FC<{activeView: View, setActiveView: (v: View) => void, onLogout: () => void}> = ({ activeView, setActiveView, onLogout }) => {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isChatWidgetOpen, setChatWidgetOpen] = useState(false);
    const { speechCode } = useLanguage();
    const { settings } = useAccessibility();
    const { actions: familyActions } = useFamilyStore();
    const { startLiveSession, stopLiveSession, isLiveActive } = useLiveAudio();
    
    useEffect(() => { familyActions.hydrate(); }, [familyActions]);

    useEffect(() => {
        if (!isLiveActive) {
            speak(`Opening ${activeView.replace(/-/g, ' ')}`, speechCode);
        }
    }, [activeView, speechCode, isLiveActive]);

    const handleToggleLive = () => {
        if (isLiveActive) {
            stopLiveSession();
        } else {
            startLiveSession();
        }
    };

    const renderView = () => {
        switch (activeView) {
          case 'dashboard': return <Dashboard setActiveView={setActiveView} />;
          case 'ai-assistant': return <AIHealthAssistant setActiveView={setActiveView} isLowConnectivity={false} />;
          case 'telemedicine': return <Telemedicine onClose={() => setActiveView('dashboard')} />;
          case 'forum': return <CommunityForum />;
          case 'wearables': return <WearableIntegration />;
          case 'price-comparison': return <MedicineFinder setActiveView={setActiveView} isLowConnectivity={false} />;
          case 'mental-health': return <MentalHealthSupport />;
          case 'resource-finder': return <ResourceFinder />;
          case 'symptom-checker': return <SymptomChecker />;
          case 'emergency-mode': return <EmergencyMode setActiveView={setActiveView} />;
          case 'medication-reminders': return <MedicationReminders />;
          case 'profile': return <ProfilePage />;
          case 'family-hub': return <FamilyHub setActiveView={setActiveView} />;
          case 'medicine-identifier': return <MedicineIdentifier />;
          case 'inclusive-bridge': return <InclusiveBridge />;
          case 'vitals': return <VitalsView />;
          case 'asha-connect': return <AshaConnect />;
          case 'medical-camps': return <MedicalCamps />;
          case 'health-schemes': return <HealthSchemes />;
          case 'health-records': return <HealthRecords />;
          case 'health-plan': return <PersonalizedHealthPlan isLowConnectivity={false} />;
          case 'ai-insights': return <AIInsights />;
          case 'predictive-analytics': return <PredictiveAnalytics isLowConnectivity={false} />;
          case 'genomic-analysis': return <GenomicAnalysis />;
          case 'quick-communicate': return <QuickCommunicate />;
          case 'cart': return <Cart />;
          case 'favorites': return <Favorites isLowConnectivity={false} />;
          default: return <Dashboard setActiveView={setActiveView} />;
        }
    };

    return (
        <div className={`flex h-screen font-sans overflow-hidden ${settings.largeTextMode ? 'text-lg' : ''}`}>
            <VisualCuesOverlay />
            <LiveVoiceInterface />
            <ChatbotWidget isOpen={isChatWidgetOpen} onClose={() => setChatWidgetOpen(false)} />
            <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} onLogout={onLogout} />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <MobileHeader onMenuClick={() => setMobileSidebarOpen(true)} />
                <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-slate-50">
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                        <NotificationBell />
                    </div>
                    {renderView()}
                </main>
            </div>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
                <EmergencySOSButton setActiveView={setActiveView} />
                <VoiceControlButton toggleListening={handleToggleLive} />
                <ChatAssistantButton isOpen={isChatWidgetOpen} onClick={() => setChatWidgetOpen(!isChatWidgetOpen)} />
            </div>
            <CommandToast />
            <MedicationReminder />
        </div>
    );
};

export default App;
