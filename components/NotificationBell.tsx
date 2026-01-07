import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.22 2.85-1.22 3.486 0l5.58 10.796c.636 1.22-.474 2.605-1.743 2.605H4.42c-1.269 0-2.379-1.385-1.743-2.605l5.58-10.796zM10 14a1 1 0 100-2 1 1 0 000 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const ReminderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
const MedicationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm0 6a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" /></svg>;

const getIconForType = (type: 'reminder' | 'alert' | 'medication') => {
    switch (type) {
        case 'reminder': return <ReminderIcon />;
        case 'alert': return <AlertIcon />;
        case 'medication': return <MedicationIcon />;
    }
}

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleToggle = () => {
        setIsOpen(prev => !prev);
        if(!isOpen) {
            notifications.forEach(n => !n.read && markAsRead(n.id));
        }
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 rounded-full text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-30 animate-fade-in-fast">
                   <div className="p-3 flex justify-between items-center border-b">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {notifications.length > 0 && <button onClick={clearAll} className="text-sm text-cyan-600 hover:underline">Clear All</button>}
                   </div>
                   <div className="max-h-96 overflow-y-auto">
                       {notifications.length > 0 ? (
                           notifications.map(n => (
                               <div key={n.id} className="p-3 border-b last:border-b-0 hover:bg-slate-50">
                                   <div className="flex items-start gap-3">
                                       <div className="flex-shrink-0 mt-1">{getIconForType(n.type)}</div>
                                       <p className="text-sm text-slate-700">{n.message}</p>
                                   </div>
                               </div>
                           ))
                       ) : (
                           <p className="p-4 text-center text-sm text-slate-500">No notifications yet.</p>
                       )}
                   </div>
                </div>
            )}
        </div>
    );
};
