
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 4.5A3 3 0 0 1 7.5 2H11a5.5 5.5 0 0 1 5.5 5.5v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7.5a1 1 0 0 0-1-1H18M7 15a6 6 0 1 0 0-12H7v12Z" />
    <circle cx="20" cy="18" r="2" />
  </svg>
);


export const Header: React.FC = () => {
  const { t } = useLanguage();
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3">
        <StethoscopeIcon className="w-10 h-10 text-cyan-600" />
        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
          {t('symptomChecker.title')}
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-600 font-medium">
        {t('symptomChecker.tagline')}
      </p>
    </header>
  );
};
