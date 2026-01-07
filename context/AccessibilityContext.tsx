
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { AccessibilitySettings, UserPersona } from '../types';

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
    applyPersonaDefaults: (persona: UserPersona) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const stored = localStorage.getItem('allwayscare-accessibility-v4');
        return stored ? JSON.parse(stored) : {
            persona: 'none',
            screenReaderMode: false,
            visualCuesMode: true,
            largeTextMode: false,
        };
    });

    useEffect(() => {
        localStorage.setItem('allwayscare-accessibility-v4', JSON.stringify(settings));
        
        const root = document.documentElement;
        root.classList.remove('persona-blind', 'persona-deaf', 'persona-speech');
        
        if (settings.persona !== 'none') {
            root.classList.add(`persona-${settings.persona}`);
        }
    }, [settings]);

    const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    const applyPersonaDefaults = useCallback((persona: UserPersona) => {
        const defaults: AccessibilitySettings = {
            persona,
            screenReaderMode: persona === 'blind',
            visualCuesMode: persona === 'deaf' || persona === 'none',
            largeTextMode: persona === 'blind',
        };
        setSettings(defaults);
    }, []);

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings, applyPersonaDefaults }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
    return context;
};
