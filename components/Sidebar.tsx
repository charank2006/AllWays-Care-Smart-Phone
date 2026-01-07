
import React, { useCallback, useMemo } from 'react';
import type { View, FamilyMember } from '../types';
import { useCart } from '../hooks/useCart';
import { useLanguage, languages } from '../context/LanguageContext';
import { useFamilyStore } from '../App';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveAudio } from '../context/LiveAudioContext';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-5 h-5 flex items-center justify-center">{children}</div>
);

const NavItem: React.FC<{
    view: View;
    activeView: View;
    setActiveView: (view: View) => void;
    icon: React.ReactNode;
    labelKey: string;
    badgeCount?: number;
    onClose?: () => void;
}> = ({ view, activeView, setActiveView, icon, labelKey, badgeCount = 0, onClose }) => {
    const { settings } = useAccessibility();
    const { t, language } = useLanguage();
    const { startLiveSession } = useLiveAudio();
    const label = t(labelKey);

    const handleFocus = useCallback(() => {
        if (settings.persona === 'blind') {
            const instruction = `
                The user has focused on the ${label} navigation item. 
                Ask the user in ${language} if they would like to open this page.
                If they say yes, use the navigate_to_page tool with view: "${view}".
            `;
            startLiveSession(instruction);
        }
    }, [settings.persona, label, view, language, startLiveSession]);

    return (
        <button
            onClick={() => { setActiveView(view); if (onClose) onClose(); }}
            onFocus={handleFocus}
            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeView === view ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <IconWrapper>{icon}</IconWrapper>
                <span className="truncate">{label}</span>
            </div>
            {badgeCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badgeCount}</span>}
        </button>
    );
};

export const Sidebar: React.FC<{
  activeView: View;
  setActiveView: (view: View) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
}> = ({ activeView, setActiveView, isMobileOpen, onClose, onLogout }) => {
  const { cartCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const { actions } = useFamilyStore();
  
  const selectedMember = useMemo(() => {
    const currentUserProfile: FamilyMember = { 
        id: 'currentUser', 
        name: t('familyHub.myProfile'), 
        relationship: 'Me', 
        age: '', 
        avatar: '👤' 
    };
    return actions.getSelectedMember(currentUserProfile);
  }, [actions, t]);

  return (
    <aside className={`bg-gray-900 text-white flex flex-col p-4 fixed sm:relative inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 border-r border-gray-800`}>
      <div className="px-2 pb-6 border-b border-gray-800 flex items-center gap-3">
        <div className="p-2 bg-cyan-600 rounded-xl text-xl">🏥</div>
        <h1 className="text-xl font-black tracking-tight">AllWays Care</h1>
      </div>

      <div className="mt-4 px-2">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-gray-800 text-white text-xs p-2 rounded-lg border border-gray-700 outline-none focus:border-cyan-500"
          >
              {languages.map(l => <option key={l.code} value={l.name}>{l.name}</option>)}
          </select>
      </div>

      <nav className="mt-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div>
            <p className="px-4 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Main</p>
            <NavItem view="dashboard" activeView={activeView} setActiveView={setActiveView} icon="🏠" labelKey="sidebar.dashboard" onClose={onClose} />
            <NavItem view="ai-assistant" activeView={activeView} setActiveView={setActiveView} icon="🤖" labelKey="sidebar.aiHealthAssistant" onClose={onClose} />
        </div>

        <div>
            <p className="px-4 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Pharmacy & Orders</p>
            <NavItem view="price-comparison" activeView={activeView} setActiveView={setActiveView} icon="💊" labelKey="sidebar.orderMedicine" onClose={onClose} />
            <NavItem view="cart" activeView={activeView} setActiveView={setActiveView} icon="🛒" labelKey="sidebar.shoppingCart" badgeCount={cartCount} onClose={onClose}/>
            <NavItem view="favorites" activeView={activeView} setActiveView={setActiveView} icon="⭐" labelKey="sidebar.myFavorites" onClose={onClose} />
        </div>

        <div>
            <p className="px-4 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Personal Health</p>
            <NavItem view="vitals" activeView={activeView} setActiveView={setActiveView} icon="💓" labelKey="sidebar.vitals" onClose={onClose} />
            <NavItem view="medicine-identifier" activeView={activeView} setActiveView={setActiveView} icon="📸" labelKey="sidebar.medicineIdentifier" onClose={onClose} />
            <NavItem view="medication-reminders" activeView={activeView} setActiveView={setActiveView} icon="⏰" labelKey="sidebar.medicationReminders" onClose={onClose} />
            <NavItem view="health-records" activeView={activeView} setActiveView={setActiveView} icon="📋" labelKey="sidebar.healthRecords" onClose={onClose} />
            <NavItem view="family-hub" activeView={activeView} setActiveView={setActiveView} icon="👨‍👩‍👦" labelKey="sidebar.familyHub" onClose={onClose} />
            <NavItem view="appointment-prep" activeView={activeView} setActiveView={setActiveView} icon="📅" labelKey="sidebar.appointmentPrep" onClose={onClose} />
        </div>

        <div>
            <p className="px-4 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Rural & Community</p>
            <NavItem view="asha-connect" activeView={activeView} setActiveView={setActiveView} icon="👩‍⚕️" labelKey="sidebar.ashaConnect" onClose={onClose} />
            <NavItem view="medical-camps" activeView={activeView} setActiveView={setActiveView} icon="⛺" labelKey="sidebar.medicalCamps" onClose={onClose} />
            <NavItem view="inclusive-bridge" activeView={activeView} setActiveView={setActiveView} icon="🦻" labelKey="sidebar.inclusiveBridge" onClose={onClose} />
            <NavItem view="forum" activeView={activeView} setActiveView={setActiveView} icon="💬" labelKey="sidebar.communityForum" onClose={onClose} />
        </div>

        <div>
            <p className="px-4 mb-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">AI Labs</p>
            <NavItem view="health-plan" activeView={activeView} setActiveView={setActiveView} icon="🥦" labelKey="sidebar.personalizedPlan" onClose={onClose} />
            <NavItem view="predictive-analytics" activeView={activeView} setActiveView={setActiveView} icon="📊" labelKey="sidebar.predictiveAnalytics" onClose={onClose} />
            <NavItem view="genomic-analysis" activeView={activeView} setActiveView={setActiveView} icon="🧬" labelKey="sidebar.genomicAnalysis" onClose={onClose} />
            <NavItem view="ai-insights" activeView={activeView} setActiveView={setActiveView} icon="💡" labelKey="sidebar.holisticInsights" onClose={onClose} />
        </div>
      </nav>

      <div className="pt-4 mt-4 border-t border-gray-800 space-y-2">
        <button onClick={() => setActiveView('profile')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white">
            <span>👤</span> {t('sidebar.myProfile')}
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <span>🚪</span> {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
};
