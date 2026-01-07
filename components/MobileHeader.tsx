
import React from 'react';

const MenuIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M4.5 4.5A3 3 0 0 1 7.5 2H11a5.5 5.5 0 0 1 5.5 5.5v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7.5a1 1 0 0 0-1-1H18M7 15a6 6 0 1 0 0-12H7v12Z" /> <circle cx="20" cy="18" r="2" /> </svg>
);

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="sm:hidden bg-white shadow-md p-4 flex items-center sticky top-0 z-30">
            <button onClick={onMenuClick} className="p-2 text-slate-600 hover:text-cyan-600" aria-label="Open menu">
                <MenuIcon />
            </button>
            <div className="flex items-center gap-2 ml-4">
                <StethoscopeIcon className="w-7 h-7 text-cyan-600" />
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">AllWays Care</h1>
            </div>
        </header>
    );
};
