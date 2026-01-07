
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleVoiceUpdate = (e: any) => {
        if (e.detail.field === 'mobile') setMobile(e.detail.value);
        if (e.detail.field === 'password') setPassword(e.detail.value);
    };
    window.addEventListener('voice_field_update', handleVoiceUpdate);
    return () => window.removeEventListener('voice_field_update', handleVoiceUpdate);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const storedUsers = localStorage.getItem('medfinder-users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const user = users.find((u: any) => u.mobile === mobile);

      if (user && user.password === password) {
        localStorage.setItem('medfinder-user-token', user.mobile); 
        onLoginSuccess();
      } else {
        setError('Invalid mobile number or password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-black mb-6">Welcome Back</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm font-bold">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="mobile" className="block text-base font-bold text-black italic mb-1">Mobile Number</label>
          <input
            type="tel"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            className="w-full p-4 bg-white border-2 border-slate-400 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all !text-black font-bold outline-none placeholder:text-slate-400"
            placeholder="Enter your mobile number"
          />
        </div>
        <div>
          <label htmlFor="password"  className="block text-base font-bold text-black italic mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 bg-white border-2 border-slate-400 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 transition-all !text-black font-bold outline-none placeholder:text-slate-400"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="w-full bg-cyan-600 text-white font-black py-4 px-4 rounded-xl hover:bg-cyan-700 transition-all shadow-lg active:scale-95 text-lg mt-2 uppercase tracking-wider">
          Sign In Now
        </button>
      </form>
      <p className="text-center text-sm text-slate-700 mt-6 font-medium">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="font-bold text-cyan-700 hover:underline">
          Create Account
        </button>
      </p>
    </div>
  );
};
