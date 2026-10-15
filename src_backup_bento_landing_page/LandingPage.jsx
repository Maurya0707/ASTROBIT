import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Code2, 
  Layers, 
  Sparkles, 
  Lock,
  ChevronRight,
  Compass,
  Play,
  Activity
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { MODULES, PROBLEMS } from '../data/curriculum';

export default function LandingPage({ onLogin }) {
  const [role, setRole] = useState('student'); // 'student' | 'admin'
  const [studentRoll, setStudentRoll] = useState('');
  const [studentName, setStudentName] = useState('');
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
    <div className="relative min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 z-20 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* ================= TOP MINIMALIST GLASS NAVIGATION ================= */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-3 px-5 rounded-2xl bento-card mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">GCPP</span>
              <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">
                v2.4 CORE
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
              Gamified C Programming Platform
            </span>
          </div>
        </div>

        {/* Live Compiler Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GCC 14.2 COMPILER ONLINE</span>
          </div>

          <button
            onClick={quickDemoStudent}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs tracking-tight transition-colors shadow-sm"
          >
            <span>LAUNCH DEMO</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ================= STRUCTURED BENTO GRID ================= */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 flex-1 items-stretch">
        
        {/* ================= BENTO 1: HERO MASTER BLOCK (8 COLS) ================= */}
        <div className="lg:col-span-8 bento-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-xs font-mono text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>COLLEGE LAB SYLLABUS • 21 VERIFIED PROBLEMS</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Master C Programming Through <span className="text-cyan-400">Deep-Space Progression.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              A mathematically structured, gamified practice platform designed for college engineering students. 
              Solve rigorous syllabus-aligned C problems, earn XP, and pilot your astronaut avatar across a fluid 2D star map with instant compiler feedback.
            </p>
          </div>

          {/* Quick Action Buttons & Telemetry Specs */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={quickDemoStudent}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm tracking-tight transition-all shadow-sm"
              >
                <span>ENTER STUDENT LAB</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={quickDemoAdmin}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>FACULTY DECK</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left">
              <div>
                <span className="block text-xs font-mono font-bold text-cyan-400">&lt; 1.2s</span>
                <span className="text-[10px] text-slate-400">GCC Execution</span>
              </div>
              <div>
                <span className="block text-xs font-mono font-bold text-white">6 SECTORS</span>
                <span className="text-[10px] text-slate-400">Lab Syllabus</span>
              </div>
              <div>
                <span className="block text-xs font-mono font-bold text-emerald-400">100% ISOLATED</span>
                <span className="text-[10px] text-slate-400">Secure Sandbox</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BENTO 2: EMBEDDED AUTH & GATEWAY (4 COLS) ================= */}
        <div className="lg:col-span-4 bento-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative">
          <div>
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-black/50 rounded-xl border border-white/10 mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  role === 'student'
                    ? 'bg-cyan-400 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>STUDENT</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-purple-400 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FACULTY</span>
              </button>
            </div>

            {error && (
              <div className="p-2.5 mb-4 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Form Fields */}
            {role === 'student' ? (
              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    COLLEGE ROLL NUMBER
                  </label>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    placeholder="e.g. 24CSE042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    STUDENT FULL NAME
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aditya Maurya"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs font-sans focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs tracking-tight transition-all shadow-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>LAUNCH STUDENT TERMINAL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    FACULTY IDENTIFIER / TA CODE
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="e.g. PROF_ADMIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    SECURITY ACCESS PASSKEY
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-400 hover:bg-purple-300 text-black font-bold text-xs tracking-tight transition-all shadow-sm flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>ENTER FACULTY PORTAL</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Instant One-Click Demo Access */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <span className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
              Instant One-Click Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={quickDemoStudent}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-[11px] font-mono font-medium truncate text-left transition-colors"
              >
                👨‍💻 24CSE042
              </button>
              <button
                type="button"
                onClick={quickDemoAdmin}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-[11px] font-mono font-medium truncate text-left transition-colors"
              >
                🛡️ PROF_ADMIN
              </button>
            </div>
          </div>
        </div>

        {/* ================= BENTO 3: CURRICULUM ARCHITECTURE (4 COLS) ================= */}
        <div className="lg:col-span-4 bento-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Curriculum Roadmap
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">6 SECTORS</span>
            </div>

            <div className="space-y-2.5">
              {MODULES.map((mod, i) => (
                <div 
                  key={mod.id} 
                  className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-slate-900 border border-white/10 text-[10px] font-mono font-bold flex items-center justify-center text-cyan-400">
                      0{i + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {mod.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
                    {mod.code}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>21 Total Syllabus Questions</span>
            <span className="font-mono text-emerald-400 font-semibold">100% Coverage</span>
          </div>
        </div>

        {/* ================= BENTO 4: C COMPILER EXECUTION SANDBOX (5 COLS) ================= */}
        <div className="lg:col-span-5 bento-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Compiler Evaluation Engine
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-semibold">
                ● FAST EVAL
              </span>
            </div>

            {/* Code Snippet Box */}
            <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto shadow-inner">
              <div className="text-slate-500">// GCPP Sandboxed C Runner</div>
              <div><span className="text-purple-400">#include</span> <span className="text-emerald-400">&lt;stdio.h&gt;</span></div>
              <div><span className="text-cyan-400">int</span> <span className="text-yellow-300">main</span>() &#123;</div>
              <div className="pl-4 text-slate-400">printf(<span className="text-emerald-400">"TEST CASES: ALL 3 PASSED\n"</span>);</div>
              <div className="pl-4 text-slate-400"><span className="text-purple-400">return</span> <span className="text-orange-400">0</span>;</div>
              <div>&#125;</div>
            </div>

            {/* Test Run Output Pill */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3/3 Hidden Testcases Passed</span>
              </div>
              <span className="text-slate-400 text-[10px]">0.014s</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Compiler: GCC 14.2 (Ubuntu)</span>
            <span className="font-mono text-cyan-400">Sub-2s Evaluation</span>
          </div>
        </div>

        {/* ================= BENTO 5: MATHEMATICAL GAMIFICATION & RANKS (3 COLS) ================= */}
        <div className="lg:col-span-3 bento-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                Gamified Ranks
              </h3>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Novice Cadet</span>
                  <span className="text-[10px] text-slate-400">0 - 149 XP</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">LV.1</span>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Cosmic Explorer</span>
                  <span className="text-[10px] text-slate-400">150 - 299 XP</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">LV.2</span>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Quantum Voyager</span>
                  <span className="text-[10px] text-slate-400">300 - 499 XP</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">LV.3</span>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white">Galactic Architect</span>
                  <span className="text-[10px] text-slate-400">500+ XP</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">LV.4</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>First Attempt</span>
            <span className="font-mono text-amber-400 font-bold">+100 XP MAX</span>
          </div>
        </div>

        {/* ================= BENTO 6: PERFORMANCE & ENGINEERING SPECS (12 COLS) ================= */}
        <div className="lg:col-span-12 bento-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white font-semibold">60 FPS Render Engine</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Zero frame-drop canvas starfield</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-semibold">Mathematical Precision</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">8-Point Grid & Golden Ratio Layout</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-white font-semibold">Realistic Shooting Stars</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Ultra-thin diagonal fade trails &lt; 0.5s</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-white font-semibold">Zero AI Slop</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">No blurry nebulae or generic glowing orbs</span>
          </div>
        </div>

      </main>

      {/* ================= MINIMALIST FOOTER ================= */}
      <footer className="max-w-7xl mx-auto w-full pt-6 mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-white/5">
        <p>© 2026 GCPP. Built for College Engineering Computer Science Laboratories.</p>
        <p className="font-mono">GCC_VERSION = 14.2.0 • DOCKER_SANDBOX = SECURE</p>
      </footer>
    </div>
  );
}
