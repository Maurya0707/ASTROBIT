import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Database,
  UserPlus,
  LogIn,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { authLogin, authRegister } from '../services/api';

export default function Login({ onLogin }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  
  // Student fields
  const [studentMobile, setStudentMobile] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPass, setStudentPass] = useState('');
  
  // Faculty fields
  const [adminId, setAdminId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (newRole) => {
    soundFx.playClick();
    setRole(newRole);
    setError('');
    setSuccessMsg('');
  };

  const handleModeChange = (newMode) => {
    soundFx.playClick();
    setAuthMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  // ================= STUDENT SUBMIT =================
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanMobile = studentMobile.trim().replace(/[^0-9]/g, '');

    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please provide a valid 10-digit Mobile Number.');
      soundFx.playFail();
      return;
    }

    if (authMode === 'signup' && !studentName.trim()) {
      setError('Please provide your Full Name.');
      soundFx.playFail();
      return;
    }

    if (!studentPass || studentPass.length < 4) {
      setError('Passcode must be at least 4 characters long.');
      soundFx.playFail();
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const regRes = await authRegister({
          role: 'student',
          mobileNo: cleanMobile,
          name: studentName.trim(),
          password: studentPass.trim(),
          avatar: '/sprites/astronaut_idle.png'
        });

        if (!regRes.success) {
          setIsLoading(false);
          setError(regRes.error || 'Failed to create student account.');
          soundFx.playFail();
          return;
        }

        soundFx.playPass();
        setSuccessMsg('Cadet registered in database! Entering Starspace...');
        setTimeout(() => {
          onLogin(regRes.user);
        }, 800);
      } else {
        const loginRes = await authLogin({
          role: 'student',
          mobileNo: cleanMobile,
          password: studentPass.trim()
        });

        if (!loginRes.success) {
          setIsLoading(false);
          setError(loginRes.error || 'Login failed. Please check credentials.');
          soundFx.playFail();
          return;
        }

        soundFx.playPass();
        onLogin(loginRes.user);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Connection error.');
      soundFx.playFail();
    }
  };

  // ================= FACULTY SUBMIT =================
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanId = adminId.trim();

    if (!cleanId) {
      setError('Please enter your Faculty Identifier or Mobile Number.');
      soundFx.playFail();
      return;
    }

    if (authMode === 'signup') {
      if (!adminName.trim()) {
        setError('Please enter your Full Name.');
        soundFx.playFail();
        return;
      }
      if (!adminPass || adminPass.length < 4) {
        setError('Please create a passcode with at least 4 characters.');
        soundFx.playFail();
        return;
      }
    } else {
      if (!adminPass.trim()) {
        setError('Please enter your Faculty Passcode.');
        soundFx.playFail();
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const regRes = await authRegister({
          role: 'admin',
          facultyId: cleanId.toUpperCase(),
          mobileNo: cleanId.replace(/[^0-9]/g, ''),
          name: adminName.trim(),
          password: adminPass.trim(),
          avatar: '/sprites/astronaut_typing.png'
        });

        if (!regRes.success) {
          setIsLoading(false);
          setError(regRes.error || 'Failed to register Faculty account.');
          soundFx.playFail();
          return;
        }

        soundFx.playPass();
        setSuccessMsg('Faculty account created in database! Accessing Deck...');
        setTimeout(() => {
          onLogin(regRes.user);
        }, 800);
      } else {
        const loginRes = await authLogin({
          role: 'admin',
          facultyId: cleanId.toUpperCase(),
          mobileNo: cleanId.replace(/[^0-9]/g, ''),
          password: adminPass.trim()
        });

        if (!loginRes.success) {
          setIsLoading(false);
          setError(loginRes.error || 'Faculty access denied. Invalid credentials.');
          soundFx.playFail();
          return;
        }

        soundFx.playPass();
        onLogin(loginRes.user);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Connection error.');
      soundFx.playFail();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none z-20">
      
      {/* Login Card with square fit-in cockpit style */}
      <div className="relative w-full max-w-md bg-black/60 border border-white/20 rounded-lg p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fadeInScale">
        
        {/* Top Space Terminal Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-5">
          {/* Animated Mascot Sprite in Square Frame */}
          <div className="relative w-14 h-14 bg-black/40 rounded-md border border-white/10 flex items-center justify-center p-1.5 shadow-inner backdrop-blur-md">
            <img 
              src={role === 'student' ? '/sprites/astronaut_idle.png' : '/sprites/astronaut_typing.png'} 
              alt="Astronaut Mascot"
              onError={(e) => {
                if (!e.currentTarget.src.includes('astronaut_idle.png')) {
                  e.currentTarget.src = '/sprites/astronaut_idle.png';
                }
              }}
              className="w-10 h-10 object-contain pixelated animate-float"
            />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-sm ring-2 ring-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="px-1.5 py-0.2 rounded-sm bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[8px] font-pixel flex items-center gap-1">
                <Database className="w-2.5 h-2.5" />
                <span>MONGODB ATLAS ACTIVE</span>
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-pixel font-bold tracking-wider text-slate-100">
              ASTROBIT <span className="text-cyan-400">//</span> GATEWAY
            </h1>
            <p className="text-[11px] font-retro text-slate-400 mt-0.5">
              Secure Cloud Curriculum &amp; C Programming Lab
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-black/70 rounded-md border border-white/15 mb-3 text-xs font-retro">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sm transition-all ${
              authMode === 'login'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-pixel text-[10px] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3 h-3" />
            <span>SIGN IN</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('signup')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-sm transition-all ${
              authMode === 'signup'
                ? 'bg-amber-500/20 border border-amber-400 text-amber-300 font-pixel text-[10px] shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Role Toggle: Student vs Faculty */}
        <div className="grid grid-cols-2 p-1 bg-black/50 rounded-md border border-white/10 mb-5 text-xs font-retro backdrop-blur-md">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-2 py-1.5 rounded-sm transition-all duration-200 ${
              role === 'student'
                ? 'bg-cyan-400 text-black font-bold font-pixel text-[10px] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>CADET / STUDENT</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center justify-center gap-2 py-1.5 rounded-sm transition-all duration-200 ${
              role === 'admin'
                ? 'bg-purple-500 text-white font-bold font-pixel text-[10px] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FACULTY / TA</span>
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-retro flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-sm bg-red-400 animate-ping flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Callout */}
        {successMsg && (
          <div className="mb-4 p-2.5 rounded-md bg-emerald-950/70 border border-emerald-500/80 text-emerald-300 text-xs font-retro flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= STUDENT FORM ================= */}
        {role === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-3.5 font-retro">
            <div>
              <label className="text-[10px] font-pixel text-slate-300 flex items-center gap-1.5 mb-1">
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>MOBILE NUMBER *</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit Mobile No. (e.g. 9876543210)"
                value={studentMobile}
                onChange={(e) => { 
                  setStudentMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10)); 
                  soundFx.playType(); 
                }}
                required
                className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="text-[10px] font-pixel text-slate-300 block mb-1">
                  STUDENT FULL NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={studentName}
                  onChange={(e) => { setStudentName(e.target.value); soundFx.playType(); }}
                  required
                  className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-pixel text-slate-300 block mb-1">
                {authMode === 'signup' ? 'CREATE LAB PASSCODE *' : 'LAB PASSCODE *'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={studentPass}
                onChange={(e) => { setStudentPass(e.target.value); soundFx.playType(); }}
                required
                className="w-full bg-black/50 border border-white/15 focus:border-cyan-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md bg-cyan-400 hover:bg-cyan-300 text-black font-pixel text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'PROCESSING...' : authMode === 'signup' ? 'REGISTER CADET IN DATABASE' : 'ENTER STARSPACE'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* ================= FACULTY FORM ================= */}
        {role === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5 font-retro">
            <div>
              <label className="text-[10px] font-pixel text-slate-300 block mb-1">
                FACULTY ID OR MOBILE NUMBER *
              </label>
              <input
                type="text"
                placeholder="e.g. FACULTY_01 or 9876543210"
                value={adminId}
                onChange={(e) => { setAdminId(e.target.value); soundFx.playType(); }}
                required
                className="w-full bg-black/50 border border-white/15 focus:border-purple-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="text-[10px] font-pixel text-slate-300 block mb-1">
                  FACULTY FULL NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. John Smith"
                  value={adminName}
                  onChange={(e) => { setAdminName(e.target.value); soundFx.playType(); }}
                  required
                  className="w-full bg-black/50 border border-white/15 focus:border-purple-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-pixel text-slate-300 block mb-1">
                {authMode === 'signup' ? 'CREATE FACULTY PASSCODE *' : 'FACULTY PASSCODE *'}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => { setAdminPass(e.target.value); soundFx.playType(); }}
                required
                className="w-full bg-black/50 border border-white/15 focus:border-purple-400 rounded-md px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors font-mono backdrop-blur-md"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md bg-purple-500 hover:bg-purple-400 text-white font-pixel text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isLoading ? 'PROCESSING...' : authMode === 'signup' ? 'REGISTER FACULTY DECK ACCOUNT' : 'ACCESS FACULTY DECK'}</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[10px] font-retro text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400" />
            MongoDB Atlas Connected
          </span>
          <span className="text-slate-500">ASTROBIT v3.0</span>
        </div>

      </div>

    </div>
  );
}
