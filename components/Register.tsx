
import React, { useState, useEffect } from 'react';
import { UserPersona } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const personas: { id: UserPersona; label: string; icon: string; desc: string }[] = [
  { id: 'none', label: 'Standard User', icon: '👤', desc: 'Standard experience' },
  { id: 'blind', label: 'Visually Impaired', icon: '🦯', desc: 'Voice-first guidance' },
  { id: 'deaf', label: 'Hearing Impaired', icon: '🦻', desc: 'Visual sign alerts' },
  { id: 'speech-impaired', label: 'Speech Impaired', icon: '💬', desc: 'Dictation tools' },
];

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { applyPersonaDefaults } = useAccessibility();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    bloodGroup: '',
    dob: '',
    password: '',
    confirmPassword: '',
    persona: 'none' as UserPersona,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const handleVoiceUpdate = (e: any) => {
        const { field, value } = e.detail;
        if (field in formData) {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    window.addEventListener('voice_field_update', handleVoiceUpdate);
    return () => window.removeEventListener('voice_field_update', handleVoiceUpdate);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const storedUsers = localStorage.getItem('medfinder-users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      if (users.some((u: any) => u.mobile === formData.mobile)) {
        setError('A user with this mobile number already exists.');
        return;
      }
      
      const { confirmPassword, ...newUser } = formData;
      users.push(newUser);
      localStorage.setItem('medfinder-users', JSON.stringify(users));
      localStorage.setItem('medfinder-user-token', newUser.mobile);
      
      applyPersonaDefaults(formData.persona);
      onRegisterSuccess();

    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      <h2 className="text-2xl font-bold text-center text-black mb-6">Create Account</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm font-bold">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-black italic mb-1">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none"/>
            </div>
            <div>
              <label htmlFor="mobile" className="block text-sm font-bold text-black italic mb-1">Mobile Number</label>
              <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none"/>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-black italic mb-3">Optimize behavior for:</label>
              <div className="grid grid-cols-2 gap-3">
                {personas.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, persona: p.id }))}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${formData.persona === p.id ? 'border-cyan-600 bg-cyan-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{p.icon}</span>
                      <span className="font-bold text-sm text-black">{p.label}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-600 leading-tight">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-bold text-black italic mb-1">Age</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none"/>
            </div>
             <div className="">
              <label htmlFor="bloodGroup" className="block text-sm font-bold text-black italic mb-1">Blood Group</label>
              <select name="bloodGroup" id="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none">
                <option value="" disabled>Select</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="password-reg" className="block text-sm font-bold text-black italic mb-1">Password</label>
              <input type="password" name="password" id="password-reg" value={formData.password} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none"/>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-black italic mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl focus:border-cyan-600 focus:ring-4 focus:ring-cyan-500/10 transition-all !text-black font-bold outline-none"/>
            </div>
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 px-4 rounded-xl hover:bg-black transition-all mt-4 text-lg shadow-xl active:scale-95 uppercase tracking-wider">
          Create My Account
        </button>
      </form>
      <p className="text-center text-sm text-slate-700 mt-6 pb-4 font-medium">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-bold text-slate-900 hover:underline">
          Sign In
        </button>
      </p>
    </div>
  );
};
