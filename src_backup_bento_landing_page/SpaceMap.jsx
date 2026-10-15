import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  Zap, 
  Compass, 
  X,
  Laptop,
  Flame
} from 'lucide-react';
import { MODULES, PROBLEMS, getRankForXp } from '../data/curriculum';
import { soundFx } from '../services/soundFx';

export default function SpaceMap({ 
  userProgress, 
  onSelectProblem, 
  currentSectorId, 
  setCurrentSectorId 
}) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [avatarPos, setAvatarPos] = useState({ x: 120, y: 320 });
  const [isTraveling, setIsTraveling] = useState(false);
  
  // Dynamic multi-state astronaut animation on the level node
  const [characterAction, setCharacterAction] = useState('typing'); // 'typing' | 'jumping' | 'floating' | 'sitting' | 'waving'
  const [actionLabel, setActionLabel] = useState('💻 CODING ON LAPTOP');

  const scrollContainerRef = useRef(null);
  const currentRank = getRankForXp(userProgress.xp);

  const isModuleUnlocked = (mod) => {
    return currentRank.level >= mod.minLevelToUnlock || userProgress.xp >= mod.minXpToUnlock;
  };

  // Center active planet on load
  useEffect(() => {
    const curMod = MODULES.find(m => m.id === currentSectorId) || MODULES[0];
    setAvatarPos(curMod.coordinates);

    if (scrollContainerRef.current) {
      const targetScroll = Math.max(0, curMod.coordinates.x - window.innerWidth / 2 + 100);
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [currentSectorId]);

  // Periodic multi-animation cycling on the level node:
  // Astronaut alternates between working on laptop, jumping, floating in zero-g, sitting, and waving!
  useEffect(() => {
    if (isTraveling) return;

    const actionCycle = [
      { action: 'typing', label: '💻 CODING ON LAPTOP' },
      { action: 'jumping', label: '🚀 CELEBRATING JUMP!' },
      { action: 'floating', label: '✨ ZERO-G LEVITATION' },
      { action: 'sitting', label: '📖 STUDYING LAB DOCS' },
      { action: 'waving', label: '👋 MISSION COMMANDER' }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % actionCycle.length;
      setCharacterAction(actionCycle[currentIdx].action);
      setActionLabel(actionCycle[currentIdx].label);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTraveling]);

  // Click astronaut directly to trigger an interactive joyful jump!
  const handleAstronautClick = (e) => {
    e.stopPropagation();
    soundFx.playPass();
    setCharacterAction('jumping');
    setActionLabel('🎉 VICTORY JUMP!');
    setTimeout(() => {
      setCharacterAction('typing');
      setActionLabel('💻 CODING ON LAPTOP');
    }, 1800);
  };

  // Spline Path Interpolation for Smooth Character Transitions
  const travelToModule = (targetMod) => {
    if (!isModuleUnlocked(targetMod) || isTraveling) {
      if (!isModuleUnlocked(targetMod)) soundFx.playFail();
      return;
    }

    soundFx.playWarp();
    setIsTraveling(true);
    setCharacterAction('walking');
    setActionLabel('🚀 TRAVERSING SPLINE PATH');

    const startMod = MODULES.find(m => m.id === currentSectorId) || MODULES[0];
    setCurrentSectorId(targetMod.id);

    const p0 = startMod.coordinates;
    const p3 = targetMod.coordinates;
    const midX = (p0.x + p3.x) / 2;
    const p1 = { x: midX, y: p0.y - 50 };
    const p2 = { x: midX, y: p3.y + 50 };

    const duration = 1200;
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const u = 1 - easeT;
      const x = u * u * u * p0.x + 3 * u * u * easeT * p1.x + 3 * u * easeT * easeT * p2.x + easeT * easeT * easeT * p3.x;
      const y = u * u * u * p0.y + 3 * u * u * easeT * p1.y + 3 * u * easeT * easeT * p2.y + easeT * easeT * easeT * p3.y;

      setAvatarPos({ x, y });

      if (t < 1) {
        requestAnimationFrame(animateStep);
      } else {
        setAvatarPos(p3);
        setIsTraveling(false);
        setCharacterAction('jumping');
        setActionLabel('🎉 ARRIVED AT SECTOR!');
        soundFx.playPass();
        setTimeout(() => {
          setCharacterAction('typing');
          setActionLabel('💻 CODING ON LAPTOP');
        }, 1500);
      }
    };

    requestAnimationFrame(animateStep);
  };

  // Get sprite image based on current animation state
  const getCurrentSprite = () => {
    if (isTraveling) return '/sprites/astronaut_walking.png';
    switch (characterAction) {
      case 'typing': return '/sprites/astronaut_typing.png';
      case 'jumping': return '/sprites/astronaut_cheering.png';
      case 'floating': return '/sprites/astronaut_floating.png';
      case 'sitting': return '/sprites/astronaut_sitting.png';
      case 'walking': return '/sprites/astronaut_walking.png';
      case 'waving':
      default:
        return '/sprites/astronaut_idle.png';
    }
  };

  const renderOrbitalPaths = () => {
    return MODULES.slice(0, -1).map((mod, idx) => {
      const nextMod = MODULES[idx + 1];
      const p0 = mod.coordinates;
      const p3 = nextMod.coordinates;
      const midX = (p0.x + p3.x) / 2;
      const p1 = { x: midX, y: p0.y - 50 };
      const p2 = { x: midX, y: p3.y + 50 };

      const isPathActive = isModuleUnlocked(nextMod);
      const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

      return (
        <g key={`path-${mod.id}-${nextMod.id}`}>
          <path
            d={d}
            fill="none"
            stroke={isPathActive ? 'rgba(0, 240, 255, 0.25)' : 'rgba(55, 65, 81, 0.3)'}
            strokeWidth="3"
            strokeDasharray={isPathActive ? '8 6' : '4 6'}
          />
          {isPathActive && (
            <path
              d={d}
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeDasharray="10 10"
              className="opacity-60 animate-pulse"
            />
          )}
        </g>
      );
    });
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none font-sans">
      
      {/* Top Map Header */}
      <div className="z-10 flex items-center justify-between pointer-events-none mb-2">
        <div className="pointer-events-auto bg-[#030712]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold text-slate-100 tracking-tight">
            SYLLABUS STAR MAP
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 border-l border-white/10 pl-2 font-normal">
            Click any unlocked planet to enter problems • Click astronaut to jump!
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 bg-[#030712]/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Unlocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Star Map Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="relative flex-1 w-full max-w-7xl mx-auto overflow-x-auto overflow-y-hidden border border-charcoal-750 rounded-2xl bg-charcoal-950 grid-8pt shadow-2xl min-h-[460px]"
      >
        <div className="relative w-[1380px] h-[480px]">
          
          {/* Orbital Spline Connection Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderOrbitalPaths()}
          </svg>

          {/* Planetary Sector Nodes */}
          {MODULES.map((mod) => {
            const unlocked = isModuleUnlocked(mod);
            const isCurrent = currentSectorId === mod.id;
            const modProblems = PROBLEMS.filter(p => p.moduleId === mod.id);
            const solvedInMod = modProblems.filter(p => userProgress.clearedProblems.includes(p.id));
            const isFullySolved = modProblems.length > 0 && solvedInMod.length === modProblems.length;

            return (
              <div
                key={mod.id}
                style={{
                  left: `${mod.coordinates.x}px`,
                  top: `${mod.coordinates.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute z-20 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  if (unlocked) {
                    travelToModule(mod);
                    setSelectedModule(mod);
                  } else {
                    soundFx.playFail();
                  }
                }}
              >
                {/* Planet Celestial Orb */}
                <div className="relative">
                  {!unlocked && (
                    <div 
                      className="absolute -inset-2 rounded-full border border-slate-700/60 pointer-events-none z-30 bg-black/40"
                    />
                  )}

                  {isCurrent && (
                    <div 
                      className="absolute -inset-3.5 rounded-full animate-ping opacity-30"
                      style={{ border: `2px solid ${mod.accent}` }}
                    />
                  )}

                  {/* Core Planet Sphere */}
                  <div 
                    className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      unlocked 
                        ? 'hover:scale-105' 
                        : 'opacity-40 grayscale filter'
                    }`}
                    style={{
                      background: unlocked
                        ? `radial-gradient(circle at 35% 35%, ${mod.accent}, ${mod.color} 70%, #030712 95%)`
                        : '#111827',
                      border: isCurrent ? `2px solid ${mod.accent}` : '1px solid rgba(255,255,255,0.15)'
                    }}
                  >
                    <div className="z-10 flex flex-col items-center justify-center text-center">
                      {!unlocked ? (
                        <Lock className="w-5 h-5 text-slate-400" />
                      ) : isFullySolved ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-white">
                          M{mod.id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Planet Label */}
                <div className="mt-2.5 flex flex-col items-center bg-[#030712]/90 border border-white/10 px-3 py-1 rounded-lg text-center max-w-[150px] shadow-sm group-hover:border-cyan-400/50 transition-colors">
                  <span className="text-[11px] font-sans font-bold text-slate-100 truncate w-full">
                    {mod.sectorName}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold mt-0.5">
                    {solvedInMod.length}/{modProblems.length} SOLVED
                  </span>
                </div>

                {!unlocked && (
                  <div className="absolute -bottom-7 px-2.5 py-0.5 rounded bg-black/80 border border-red-500/40 text-[10px] font-mono text-red-400 whitespace-nowrap z-40">
                    REQ LV.{mod.minLevelToUnlock} ({mod.minXpToUnlock} XP)
                  </div>
                )}
              </div>
            );
          })}

          {/* ================= 2D Pixel-Art Astronaut with Multi-Animations Covering Level ================= */}
          <div
            style={{
              left: `${avatarPos.x}px`,
              top: `${avatarPos.y - 48}px`,
              transform: 'translate(-50%, -50%)',
              transition: isTraveling ? 'none' : 'transform 0.25s ease-out',
              width: '56px',
              height: '56px'
            }}
            onClick={handleAstronautClick}
            className="absolute z-30 cursor-pointer flex flex-col items-center justify-center group"
            title="Click me to jump and celebrate!"
          >
            {/* Floating Callout Badges ABOVE the Character */}
            <div className="absolute -top-11 flex flex-col items-center gap-0.5 pointer-events-none whitespace-nowrap z-30">
              <div className="px-2.5 py-0.5 rounded-full bg-[#030712]/95 border border-cyan-400/60 text-[9px] font-sans font-bold text-cyan-300 shadow-sm flex items-center gap-1">
                <span>YOU (TAP ME)</span>
                <span className="text-[9px]">👆</span>
              </div>
              <div className="px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[8px] font-mono text-slate-300 shadow">
                {actionLabel}
              </div>
            </div>

            {/* Astronaut Sprite doing multiple animations (jump, typing laptop, zero-g floating) */}
            <div 
              className={`relative flex items-center justify-center transition-transform ${
                characterAction === 'jumping' 
                  ? 'animate-bounce -translate-y-2' 
                  : characterAction === 'floating'
                  ? 'animate-float'
                  : ''
              }`}
              style={{ width: '56px', height: '56px' }}
            >
              <img
                src={getCurrentSprite()}
                alt="Astronaut on Level"
                style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px' }}
                className="object-contain pixelated drop-shadow-[0_4px_12px_rgba(0,240,255,0.7)] group-hover:scale-110 transition-transform"
              />

              {/* Glowing laptop screen light effect when typing */}
              {characterAction === 'typing' && (
                <span className="absolute bottom-2 right-1 w-2.5 h-2 bg-cosmic-cyan/80 rounded-sm blur-[1px] animate-pulse pointer-events-none" />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Selected Sector Mission Drawer / Modal */}
      {selectedModule && (
        <div className="z-30 bento-card rounded-2xl p-4 sm:p-5 shadow-2xl max-w-5xl mx-auto w-full transition-all animate-fadeInScale max-h-[380px] flex flex-col font-sans">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold">
                  {selectedModule.code}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {selectedModule.sectorName}: {selectedModule.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {selectedModule.description}
              </p>
            </div>

            <button
              onClick={() => setSelectedModule(null)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module Problems Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1">
            {PROBLEMS.filter(p => p.moduleId === selectedModule.id).map((prob, idx) => {
              const isCleared = userProgress.clearedProblems.includes(prob.id);
              const isAttempted = userProgress.attemptedProblems.includes(prob.id);

              return (
                <div
                  key={prob.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectProblem(prob);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    isCleared
                      ? 'bg-black/60 border-emerald-500/40 hover:border-emerald-400'
                      : isAttempted
                      ? 'bg-black/60 border-amber-500/40 hover:border-amber-400'
                      : 'bg-black/60 border-white/10 hover:border-cyan-400/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        LAB #{prob.moduleId}.{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-300 border border-white/10">
                        {prob.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {prob.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-amber-400 font-mono font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" /> +{prob.xpReward} XP
                    </span>

                    {isCleared ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-mono font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-white flex items-center gap-1 text-xs font-semibold">
                        SOLVE <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= NEXT MODULE / SECTOR NAVIGATION BAR ================= */}
          {(() => {
            const currentModIndex = MODULES.findIndex(m => m.id === selectedModule.id);
            const nextMod = MODULES[currentModIndex + 1];
            const prevMod = currentModIndex > 0 ? MODULES[currentModIndex - 1] : null;
            const modProblems = PROBLEMS.filter(p => p.moduleId === selectedModule.id);
            const solvedInMod = modProblems.filter(p => userProgress.clearedProblems.includes(p.id));
            const isFullySolved = modProblems.length > 0 && solvedInMod.length === modProblems.length;
            const canAdvance = nextMod && (isFullySolved || isModuleUnlocked(nextMod));

            return (
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Sector Completion Meter */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">
                    SECTOR PROGRESS:
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {solvedInMod.length} / {modProblems.length} PROBLEMS CLEARED
                  </span>
                  {isFullySolved && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-semibold">
                      ★ SECTOR MASTERED
                    </span>
                  )}
                </div>

                {/* Navigation Options */}
                <div className="flex items-center gap-2">
                  {prevMod && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        travelToModule(prevMod);
                        setSelectedModule(prevMod);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-bold transition-colors"
                    >
                      <span>&lt;&lt; PREV SECTOR</span>
                    </button>
                  )}

                  {nextMod ? (
                    canAdvance ? (
                      <button
                        onClick={() => {
                          soundFx.playWarp();
                          travelToModule(nextMod);
                          setSelectedModule(nextMod);
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs transition-all shadow-sm"
                      >
                        <span>ADVANCE TO NEXT SECTOR: {nextMod.sectorName}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-slate-400 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>NEXT SECTOR LOCKED (Solve {modProblems.length - solvedInMod.length} more problem{modProblems.length - solvedInMod.length > 1 ? 's' : ''} to advance)</span>
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                      <span>👑 FINAL SECTOR OF SYLLABUS REACHED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
