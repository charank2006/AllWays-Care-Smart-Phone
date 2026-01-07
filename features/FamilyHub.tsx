import React, { useState, useEffect, useCallback } from 'react';
import type { View, FamilyMember } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFamilyStore } from '../App';

const USER_AVATAR = '👤';
const AVATARS = ['👶', '👧', '👦', '👩', '👨', '👵', '👴', '🧑‍🦱', '🧑‍🦰', '👱‍♀️', '👱‍♂️'];


const PlusIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


const MemberCard: React.FC<{
    member: FamilyMember;
    onClick: () => void;
    onRemove?: (e: React.MouseEvent, id: string) => void;
    isSelected: boolean;
}> = ({ member, onClick, onRemove, isSelected }) => {
    const { t } = useLanguage();
    
    const handleRemove = (e: React.MouseEvent) => {
        if (onRemove) {
            e.stopPropagation(); // Prevent onClick from firing
            onRemove(e, member.id);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={onClick}
                className={`w-full bg-white p-4 rounded-xl shadow-md border text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-2 ${isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-200'}`}
            >
                <span className="text-5xl">{member.avatar}</span>
                <h3 className="font-bold text-lg text-slate-800">{member.name}</h3>
                <p className="text-sm text-slate-500">{member.relationship}{member.age && `, Age ${member.age}`}</p>
            </button>
            {onRemove && (
                 <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 p-1.5 bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                    aria-label={t('familyHub.removeAria', {name: member.name})}
                >
                    <TrashIcon />
                </button>
            )}
        </div>
    );
};

interface FamilyHubProps {
  setActiveView: (view: View) => void;
}

const FamilyHub: React.FC<FamilyHubProps> = ({ setActiveView }) => {
    const { t } = useLanguage();
    const { members, selectedMemberId, actions } = useFamilyStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', relationship: '', age: '', avatar: AVATARS[0] });

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        actions.addMember(newMember);
        setNewMember({ name: '', relationship: '', age: '', avatar: AVATARS[0] });
        setIsAdding(false);
    };

    const handleRemoveMember = (e: React.MouseEvent, id: string) => {
        actions.removeMember(id);
    };
    
    const handleSelectMember = (id: string) => {
        actions.selectMember(id);
    };

    const currentUserProfile: FamilyMember = {
        id: 'currentUser',
        name: t('familyHub.myProfile'),
        relationship: 'Me',
        age: '', 
        avatar: USER_AVATAR
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{t('familyHub.title')}</h1>
            <p className="mt-1 text-lg text-slate-600">{t('familyHub.tagline')}</p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MemberCard 
                    member={currentUserProfile} 
                    onClick={() => handleSelectMember('currentUser')}
                    isSelected={selectedMemberId === 'currentUser'}
                />
                {members.map(member => (
                    <MemberCard 
                        key={member.id} 
                        member={member} 
                        onClick={() => handleSelectMember(member.id)} 
                        onRemove={handleRemoveMember}
                        isSelected={selectedMemberId === member.id}
                    />
                ))}
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-slate-50 p-4 rounded-xl shadow-inner border-2 border-dashed border-slate-300 text-center hover:bg-slate-100 hover:border-cyan-500 transition-all duration-300 flex flex-col items-center justify-center gap-2 text-slate-500"
                >
                    <PlusIcon />
                    <span className="font-semibold">{t('familyHub.addMember')}</span>
                </button>
            </div>
            
            {isAdding && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800">{t('familyHub.add.title')}</h2>
                        <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                            <input type="text" value={newMember.name} onChange={e => setNewMember(p => ({...p, name: e.target.value}))} placeholder={t('familyHub.add.namePlaceholder')} required className="w-full p-2 border rounded-md" />
                            <input type="text" value={newMember.relationship} onChange={e => setNewMember(p => ({...p, relationship: e.target.value}))} placeholder={t('familyHub.add.relationshipPlaceholder')} required className="w-full p-2 border rounded-md" />
                            <input type="number" value={newMember.age} onChange={e => setNewMember(p => ({...p, age: e.target.value}))} placeholder={t('familyHub.add.agePlaceholder')} required className="w-full p-2 border rounded-md" />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t('familyHub.add.chooseAvatar')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVATARS.map(avatar => (
                                        <button type="button" key={avatar} onClick={() => setNewMember(p => ({...p, avatar}))} className={`p-2 rounded-full text-2xl ${newMember.avatar === avatar ? 'bg-cyan-200 ring-2 ring-cyan-500' : 'bg-slate-100'}`}>{avatar}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 w-full bg-slate-200 font-bold py-3 rounded-lg">Cancel</button>
                                <button type="submit" className="flex-1 w-full bg-cyan-600 text-white font-bold py-3 rounded-lg">{t('familyHub.add.button')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyHub;