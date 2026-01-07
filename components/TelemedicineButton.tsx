import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const TelemedicineIcon: React.FC = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-8 h-8 text-white" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <path d="m12 8-2 4 4 0-2 4" />
    </svg>
);


interface TelemedicineButtonProps {
    onClick: () => void;
}

export const TelemedicineButton: React.FC<TelemedicineButtonProps> = ({ onClick }) => {
    const { t } = useLanguage();

    return (
        <button
            onClick={onClick}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 transform hover:scale-110"
            aria-label={t('fab.telemedicine')}
        >
            <TelemedicineIcon />
        </button>
    );
};