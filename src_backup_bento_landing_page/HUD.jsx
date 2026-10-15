import React from 'react';
import { 
  Trophy, 
  Target, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Map, 
  Code2, 
  ShieldCheck, 
  LogOut,
  Home
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { getRankForXp, getNextRank } from '../data/curriculum';

export default function HUD({
  currentUser,
  userProgress,
  activeView,
  setActiveView,
  isMuted,
  setIsMuted,
  onOpenProfile,
  onLogout
}) {
  const currentRank = getRankForXp(userProgress.xp);
  const nextRank = getNextRank(currentRank.level);

  // Calculate XP progress within current level
  const currentLevelBaseXp = currentRank.xpRequired;
  const nextLevelBaseXp = nextRank ? nextRank.xpRequired : currentLevelBaseXp + 1000;
  const xpInCurrentLevel = Math.max(0, userProgress.xp - currentLevelBaseXp);
  const xpNeededForNext = nextLevelBaseXp - currentLevelBaseXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const handleToggleSound = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) soundFx.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#020617]/85 backdrop-blur-xl border-b border-white/10 shadow-hud select-none overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6 relative z-10">
        
        {/* Left Section: User Profile & Identity */}
        <div className="flex items-center gap-3 min-w-[210px]">
          {/* Avatar Thumbnail */}
          <div 
            onClick={onOpenProfile}
            className="group relative cursor-pointer flex items-center justify-center p-1 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 transition-all duration-200"
            title="Open Flight Log & Dossier"
          >
            <div className="relative w-9 h-9 bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={currentUser?.avatar || '/sprites/astronaut_idle.png'} 
                alt="Avatar" 
                className="w-8 h-8 object-contain pixelated group-hover:scale-105 transition-transform" 
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-black animate-pulse" />
            </div>
            {currentUser?.role === 'student' && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-mono font-bold shadow-md">
                LV.{currentRank.level}
              </span>
            )}
          </div>

          {/* User Name & Rank with Bold Geometric Typography */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-sans font-bold text-slate-100 tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
                {currentUser?.name || 'Space Cadet'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-sans text-slate-400 font-medium">
              <span>{currentRank.badge}</span>
              <span className="text-cyan-400 font-semibold truncate max-w-[140px]">
                {currentUser?.role === 'admin' ? 'Faculty Admin' : currentRank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Fluid XP Progress Bar (Shown for students) */}
        {currentUser?.role === 'student' && (
          <div className="flex-1 max-w-md mx-2 hidden md:flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-sans font-medium">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">TOTAL XP:</span>
                <span className="font-mono text-cyan-400 font-bold">{userProgress.xp}</span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                <span>NEXT:</span>
                <span className="text-amber-400 font-semibold">
                  {nextRank ? `${userProgress.xp}/${nextLevelBaseXp} XP` : 'MAX'}
                </span>
              </div>
            </div>

            <div className="relative w-full h-2 bg-slate-900/80 rounded-full border border-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Right Section: Navigation, Sound & Logout (Mode Switcher removed per request) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Navigation View Toggles */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 gap-1 text-xs font-sans font-semibold">
            <button
              onClick={() => { soundFx.playClick(); setActiveView('map'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'map'
                  ? 'bg-cyan-400 text-black font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">STAR MAP</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { soundFx.playClick(); setActiveView('admin'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'admin'
                    ? 'bg-purple-400 text-black font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FACULTY DECK</span>
              </button>
            )}
          </div>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-slate-900/80 border-white/10 text-slate-500 hover:text-slate-300'
                : 'bg-slate-900/80 border-cyan-400/40 text-cyan-400 hover:border-cyan-400 shadow-sm'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Logout / Switch Role Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (confirm('Log out and return to Landing Page?')) {
                onLogout();
              }
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
            title="Log Out / Return to Landing Page"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
