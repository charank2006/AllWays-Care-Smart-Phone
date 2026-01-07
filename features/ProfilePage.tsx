
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserDetails } from './profile/UserDetails';
import { ProfileEmergencyContacts } from './profile/ProfileEmergencyContacts';
import { PersonalEmergencyInfo } from './profile/PersonalEmergencyInfo';
import { MedicalHistory } from './profile/MedicalHistory';

interface UserData {
    name: string;
    mobile: string;
    age: string;
    bloodGroup: string;
    dob: string;
}

const ProfilePage: React.FC = () => {
    const { t } = useLanguage();
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('medfinder-user-token');
            const storedUsers = localStorage.getItem('medfinder-users');
            if (token && storedUsers) {
                const users = JSON.parse(storedUsers);
                const currentUser = users.find((u: UserData) => u.mobile === token);
                if (currentUser) {
                    setUser(currentUser);
                }
            }
        } catch (error) {
            console.error("Failed to load user data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center p-10">Could not load user profile. Please try logging in again.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('profile.title')}</h1>
                <p className="mt-1 text-lg text-slate-600">{t('profile.tagline')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <UserDetails user={user} />
                    <PersonalEmergencyInfo userMobile={user.mobile} />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <ProfileEmergencyContacts />
                    <MedicalHistory userMobile={user.mobile} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
