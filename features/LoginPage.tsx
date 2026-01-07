
import React, { useState } from 'react';
import { Login } from '../components/Login';
import { Register } from '../components/Register';

const StethoscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/center" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" > <path d="M4.5 4.5A3 3 0 0 1 7.5 2H11a5.5 5.5 0 0 1 5.5 5.5v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V7.5a1 1 0 0 0-1-1H18M7 15a6 6 0 1 0 0-12H7v12Z" /> <circle cx="20" cy="18" r="2" /> </svg>
);

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <StethoscopeIcon className="w-10 h-10 text-cyan-600" />
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            AllWays Care
          </h1>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          {isLoginView ? (
            <Login onLoginSuccess={onLoginSuccess} onSwitchToRegister={() => setIsLoginView(false)} />
          ) : (
            <Register onRegisterSuccess={onLoginSuccess} onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </div>
         <p className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} AllWays Care. Your AI Health Companion.
          </p>
      </div>
    </div>
  );
};

export default AuthPage;
