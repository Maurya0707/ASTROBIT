import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Map, 
  Code2, 
  ShieldCheck, 
  LogOut 
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { getRankForXp, getNextRank } from '../data/curriculum';

export default function HUD({
  currentUser,
  userProgress,
  selectedAvatar,
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

  const avatarSrc = selectedAvatar || currentUser?.avatar || '/sprites/astronaut_idle.png';

  return (
    <header className="sticky top-2 sm:top-3 z-40 w-full px-2 sm:px-4 pointer-events-none select-none">
      <div className="max-w-6xl mx-auto h-11 sm:h-12 px-2 sm:px-3 rounded-lg bg-black/70 backdrop-blur-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center justify-between gap-1.5 sm:gap-2.5 pointer-events-auto">
        
        {/* Left Section: Minimized ASTROBIT Brand & User Profile in Square Divs */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Minimized ASTROBIT Brand Logo (Square Modular Div) */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)] shrink-0">
            <div className="w-6 h-6 rounded-sm bg-cyan-950/70 border border-cyan-400/50 flex items-center justify-center overflow-hidden">
              <img 
                src="/sprites/astronaut_idle.png" 
                alt="Astrobit" 
                onError={(e) => {
                  if (!e.currentTarget.src.includes('astronaut_idle.png')) {
                    e.currentTarget.src = '/sprites/astronaut_idle.png';
                  }
                }}
                className="w-5 h-5 object-contain pixelated"
              />
            </div>
            <span className="font-pixel text-[10px] font-bold text-white tracking-wide">ASTROBIT</span>
          </div>

          {/* User Profile Dossier & Astronaut Avatar (Square Div Fit) */}
          <div 
            onClick={onOpenProfile}
            className="group cursor-pointer flex items-center gap-2 px-2 py-1 rounded-md bg-black/60 border border-white/10 hover:border-cyan-400/50 shadow-sm hover:bg-white/5 transition-all duration-200 shrink-0"
            title="Open Astronaut Dossier & Flight Log"
          >
            <div className="relative w-7 h-7 rounded-sm bg-black/80 border border-cyan-400/40 flex items-center justify-center overflow-hidden">
              <img 
                src={avatarSrc} 
                alt="Astronaut Avatar" 
                onError={(e) => {
                  if (!e.currentTarget.src.includes('astronaut_idle.png')) {
                    e.currentTarget.src = '/sprites/astronaut_idle.png';
                  }
                }}
                className="w-6 h-6 object-contain pixelated group-hover:scale-110 transition-transform" 
              />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-none ring-1 ring-black animate-pulse" />
            </div>

            {/* User Name & Rank */}
            <div className="flex flex-col justify-center leading-tight pr-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-pixel font-bold text-slate-100 truncate max-w-[90px] sm:max-w-[140px]">
                  {currentUser?.name || 'Space Cadet'}
                </span>
                {currentUser?.role === 'student' && (
                  <span className="px-1 py-0.2 rounded-sm bg-amber-500/20 border border-amber-400/70 text-amber-300 text-[8px] font-pixel font-bold whitespace-nowrap">
                    LV.{currentRank.level}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-retro text-cyan-300/80 truncate max-w-[110px] sm:max-w-[150px]">
                {currentRank.badge} {currentUser?.role === 'admin' ? 'Faculty Admin' : currentRank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Navigation View Toggles + Slim XP Meter in Square Divs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Navigation View Toggles (Square Div Container) */}
          <div className="flex items-center bg-black/60 p-0.5 rounded-md border border-white/10 gap-0.5 text-xs font-retro">
            <button
              onClick={() => { soundFx.playClick(); setActiveView('map'); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all text-[10px] ${
                activeView === 'map'
                  ? 'bg-cyan-400 text-black font-pixel font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Map className="w-3 h-3" />
              <span>STAR MAP</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); setActiveView('workspace'); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all text-[10px] ${
                activeView === 'workspace'
                  ? 'bg-amber-500 text-black font-pixel font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>WORKSPACE</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { soundFx.playClick(); setActiveView('admin'); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm transition-all text-[10px] ${
                  activeView === 'admin'
                    ? 'bg-purple-500 text-white font-pixel font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">FACULTY</span>
              </button>
            )}
          </div>

          {/* Slim XP Telemetry in Square Div (Student only) */}
          {currentUser?.role === 'student' && (
            <div className="hidden lg:flex items-center gap-2 bg-black/60 px-2 py-1 rounded-md border border-white/10 text-[9px] font-retro text-slate-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="font-pixel text-[8px] text-cyan-300">{userProgress.xp} XP</span>
              <div className="w-14 h-1.5 bg-black/80 rounded-none border border-white/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Sound Toggle & Logout (Square Divs) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Audio Synthesizer Mute Toggle (Square Button Div) */}
          <button
            onClick={handleToggleSound}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md border flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-black/60 border-white/10 text-slate-500 hover:text-slate-400'
                : 'bg-black/60 border-cyan-400/40 text-cyan-400 hover:border-cyan-300 hover:bg-cyan-950/40'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Logout Button (Square Button Div) */}
          <button
            onClick={() => {
              soundFx.playClick();
              if (confirm('Log out and return to Gateway Terminal?')) {
                onLogout();
              }
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-white/10 bg-black/60 text-slate-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/40 flex items-center justify-center transition-all"
            title="Log Out / Switch Account"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
