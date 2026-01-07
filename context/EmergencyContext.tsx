
import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { useNotifications } from './NotificationContext';
import { useEmergencyContacts } from '../hooks/useEmergencyContacts';

type EmergencyStatus = 'dispatched' | 'on_scene' | 'arrived_hospital' | 'inactive';

interface EmergencyState {
    isEmergencyActive: boolean;
    status: EmergencyStatus;
    etaSeconds: number; // in seconds
    startEmergency: () => void;
    cancelEmergency: () => void;
}

const EmergencyContext = createContext<EmergencyState | undefined>(undefined);

const INITIAL_ETA_MINUTES = 12;

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const [status, setStatus] = useState<EmergencyStatus>('inactive');
    const [etaSeconds, setEtaSeconds] = useState(INITIAL_ETA_MINUTES * 60);

    const { addNotification } = useNotifications();
    const { contacts } = useEmergencyContacts();
    const etaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearEtaInterval = () => {
        if (etaIntervalRef.current) {
            clearInterval(etaIntervalRef.current);
            etaIntervalRef.current = null;
        }
    };

    const startEmergency = useCallback(() => {
        if (isEmergencyActive) return; // Prevent double trigger
        
        clearEtaInterval();
        setIsEmergencyActive(true);
        setStatus('dispatched');
        setEtaSeconds(INITIAL_ETA_MINUTES * 60);

        addNotification({
            type: 'alert',
            message: '🚨 EMERGENCY SOS TRIGGERED! Dispatching emergency services.'
        });
        
        // Use a timeout for geolocation to ensure the alert proceeds even without a lock
        const geoOptions = { timeout: 5000, maximumAge: 0 };
        
        const success = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;
            console.log(`User location: ${latitude}, ${longitude}`);
            addNotification({
                type: 'alert',
                message: `📍 Precise location shared with emergency services.`
            });
            contacts.forEach(contact => {
                addNotification({
                    type: 'alert',
                    message: `⚠️ SOS Alert sent to ${contact.name} with your location.`
                });
            });
        };

        const error = (err: GeolocationPositionError) => {
            console.warn(`Geolocation error (${err.code}): ${err.message}`);
            addNotification({
                type: 'alert',
                message: 'Location sharing slow. Proceeding with last known approximate area.'
            });
            contacts.forEach(contact => {
                addNotification({
                    type: 'alert',
                    message: `⚠️ SOS Alert sent to ${contact.name}.`
                });
            });
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error, geoOptions);
        } else {
            error({ code: 0, message: "Not supported", PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
        }

        etaIntervalRef.current = setInterval(() => {
            setEtaSeconds(prevSeconds => {
                if (prevSeconds > 0) {
                    return prevSeconds - 1;
                }
                setStatus('on_scene');
                addNotification({type: 'alert', message: '🚑 Ambulance has arrived on scene.'})
                clearEtaInterval();
                return 0;
            });
        }, 1000);

    }, [addNotification, contacts, isEmergencyActive]);

    const cancelEmergency = useCallback(() => {
        clearEtaInterval();
        setIsEmergencyActive(false);
        setStatus('inactive');
        setEtaSeconds(INITIAL_ETA_MINUTES * 60);
        addNotification({
            type: 'alert',
            message: 'Emergency alert has been successfully cancelled.'
        });
    }, [addNotification]);

    const value = {
        isEmergencyActive,
        status,
        etaSeconds,
        startEmergency,
        cancelEmergency,
    };
    
    return (
        <EmergencyContext.Provider value={value}>
            {children}
        </EmergencyContext.Provider>
    );
};


export const useEmergency = (): EmergencyState => {
    const context = useContext(EmergencyContext);
    if (context === undefined) {
        throw new Error('useEmergency must be used within an EmergencyProvider');
    }
    return context;
};
