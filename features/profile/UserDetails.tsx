
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface UserData {
    name: string;
    mobile: string;
    age: string;
    bloodGroup: string;
}

interface UserDetailsProps {
    user: UserData;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">{value}</span>
    </div>
);

export const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    const { t } = useLanguage();

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t('profile.userDetails.title')}</h2>
            <div className="flex flex-col items-center">
                <UserIcon />
                <h3 className="text-2xl font-bold text-slate-800 mt-2">{user.name}</h3>
            </div>
            <div className="mt-4 space-y-1">
                <InfoRow label={t('profile.userDetails.mobile')} value={user.mobile} />
                <InfoRow label={t('profile.userDetails.age')} value={user.age} />
                <InfoRow label={t('profile.userDetails.bloodGroup')} value={user.bloodGroup} />
            </div>
        </div>
    );
};
