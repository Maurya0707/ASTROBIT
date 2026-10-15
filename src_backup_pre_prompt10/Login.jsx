import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  HelpCircle 
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPass, setStudentPass] = useState('');
  
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    soundFx.playClick();
    setRole(newRole);
    setError('');
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentRoll.trim()) {
      setError('Please provide your College Roll Number.');
      soundFx.playFail();
      return;
    }
    if (!studentName.trim()) {
      setError('Please provide your Full Name.');
      soundFx.playFail();
      return;
    }
    soundFx.playPass();
    onLogin({
      role: 'student',
      rollNo: studentRoll.trim().toUpperCase(),
      name: studentName.trim(),
      avatar: '/sprites/astronaut_idle.png'
    });
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminId.trim()) {
      setError('Please enter your Faculty / TA Identifier.');
      soundFx.playFail();
      return;
    }
    // Verify passcode (default: admin123 or any non-empty passcode for lab setup)
    if (adminPass !== 'admin123' && adminPass !== 'gcpp2026' && adminPass.length < 4) {
      setError('Invalid Faculty Passcode. (Hint: use "admin123")');
      soundFx.playFail();
      return;
    }
    soundFx.playPass();
    onLogin({
      role: 'admin',
      facultyId: adminId.trim().toUpperCase(),
      name: `Prof. ${adminId.trim()}`,
      avatar: '/sprites/astronaut_typing.png'
    });
  };

  const quickDemoStudent = () => {
    soundFx.playPass();
    onLogin({
      role: 'student',
      rollNo: '24CSE042',
      name: 'Aditya Maurya',
      avatar: '/sprites/astronaut_idle.png'
    });
  };

  const quickDemoAdmin = () => {
    soundFx.playPass();
    onLogin({
      role: 'admin',
      facultyId: 'PROF_ADMIN',
      name: 'Prof. Aditya Maurya',
      avatar: '/sprites/astronaut_typing.png'
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none z-20">
      
      {/* Login Card with Charcoal aesthetic and glowing border */}
      <div className="relative w-full max-w-md bg-charcoal-900/95 border border-charcoal-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-fadeInScale box-glow-cyan">
        
        {/* Top Space Terminal Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          {/* Animated Mascot Sprite */}
          <div className="relative w-16 h-16 bg-charcoal-850 rounded-2xl border border-charcoal-700 flex items-center justify-center p-1.5 shadow-inner">
            <img 
              src={role === 'student' ? '/sprites/astronaut_idle.png' : '/sprites/astronaut_typing.png'} 
              alt="Astronaut Mascot"
              className="w-12 h-12 object-contain pixelated animate-float"
            />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-cosmic-emerald rounded-full ring-2 ring-charcoal-950 animate-pulse" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-pixel font-bold tracking-wider text-slate-100">
              GCPP <span className="text-cosmic-cyan text-glow-cyan">//</span> TERMINAL
            </h1>
            <p className="text-[11px] font-retro text-slate-400 mt-0.5">
              Gamified C Programming Platform • College Lab Gateway
            </p>
          </div>
        </div>

        {/* Animated Role Toggle: Student vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-charcoal-950 rounded-xl border border-charcoal-800 mb-6 text-xs font-retro">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
              role === 'student'
                ? 'bg-cosmic-cyan text-charcoal-950 font-bold shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>STUDENT</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 ${
              role === 'admin'
                ? 'bg-cosmic-purple text-charcoal-950 font-bold shadow-glow-purple'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FACULTY / TA</span>
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-retro flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= STUDENT LOGIN FORM ================= */}
        {role === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4 font-retro">
            <div>
              <label className="text-[10px] font-pixel text-slate-400 block mb-1">
                COLLEGE ROLL NUMBER
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 24CSE042"
                  value={studentRoll}
                  onChange={(e) => { setStudentRoll(e.target.value); soundFx.playType(); }}
                  className="w-full bg-charcoal-950 border border-charcoal-750 focus:border-cosmic-cyan rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-pixel text-slate-400 block mb-1">
                STUDENT FULL NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Aditya Maurya"
                value={studentName}
                onChange={(e) => { setStudentName(e.target.value); soundFx.playType(); }}
                className="w-full bg-charcoal-950 border border-charcoal-750 focus:border-cosmic-cyan rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-pixel text-slate-400 block mb-1">
                LAB PASSCODE (OPTIONAL)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={studentPass}
                onChange={(e) => { setStudentPass(e.target.value); soundFx.playType(); }}
                className="w-full bg-charcoal-950 border border-charcoal-750 focus:border-cosmic-cyan rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cosmic-cyan hover:bg-cyan-400 text-charcoal-950 font-pixel text-xs font-bold transition-all shadow-glow-cyan flex items-center justify-center gap-2 mt-2"
            >
              <span>ENTER STARSPACE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Cadet One-Click Entry */}
            <button
              type="button"
              onClick={quickDemoStudent}
              className="w-full py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-slate-400 hover:text-slate-200 text-[11px] font-retro transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cosmic-amber" />
              <span>Quick Login as Demo Cadet</span>
            </button>
          </form>
        )}

        {/* ================= ADMIN / PROFESSOR LOGIN FORM ================= */}
        {role === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 font-retro">
            <div>
              <label className="text-[10px] font-pixel text-slate-400 block mb-1">
                FACULTY / TA IDENTIFIER
              </label>
              <input
                type="text"
                placeholder="e.g. PROF_ADMIN or TA_01"
                value={adminId}
                onChange={(e) => { setAdminId(e.target.value); soundFx.playType(); }}
                className="w-full bg-charcoal-950 border border-charcoal-750 focus:border-cosmic-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-pixel text-slate-400 block mb-1">
                SECURITY PASSCODE (DEFAULT: admin123)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => { setAdminPass(e.target.value); soundFx.playType(); }}
                className="w-full bg-charcoal-950 border border-charcoal-750 focus:border-cosmic-purple rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cosmic-purple hover:bg-purple-400 text-charcoal-950 font-pixel text-xs font-bold transition-all shadow-glow-purple flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ACCESS FACULTY DECK</span>
            </button>

            {/* Quick Demo Admin Entry */}
            <button
              type="button"
              onClick={quickDemoAdmin}
              className="w-full py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 text-slate-400 hover:text-slate-200 text-[11px] font-retro transition-colors flex items-center justify-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-cosmic-purple" />
              <span>Quick Login as Demo Professor</span>
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-charcoal-800/80 text-center text-[10px] font-retro text-slate-500">
          Engineered for C Programming Lab Curriculum • GCC Sandbox Active
        </div>

      </div>

    </div>
  );
}
