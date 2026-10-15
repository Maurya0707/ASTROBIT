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
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-6 overflow-hidden select-none">
      
      {/* Top Map Header */}
      <div className="z-10 flex items-center justify-between pointer-events-none mb-2">
        <div className="pointer-events-auto bg-charcoal-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-charcoal-750 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cosmic-cyan animate-spin-slow" />
          <span className="text-xs font-pixel text-slate-100">
            SYLLABUS STAR MAP
          </span>
          <span className="hidden sm:inline text-[11px] font-retro text-slate-400 border-l border-charcoal-700 pl-2">
            Click any unlocked planet to enter problems • Click astronaut to jump!
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 bg-charcoal-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-charcoal-750 text-xs font-retro text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cosmic-cyan" />
            <span>Unlocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Fog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cosmic-emerald" />
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
                      className="absolute -inset-6 rounded-full blur-xl pointer-events-none z-30 opacity-75"
                      style={{ background: 'radial-gradient(circle, rgba(71,85,105,0.4) 0%, rgba(13,14,18,0.95) 75%)' }}
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
                        ? 'hover:scale-110 shadow-lg' 
                        : 'opacity-40 grayscale filter'
                    }`}
                    style={{
                      background: unlocked
                        ? `radial-gradient(circle at 35% 35%, ${mod.accent}, ${mod.color} 65%, #090a0d 95%)`
                        : '#1e2029',
                      boxShadow: unlocked ? `0 0 20px ${mod.color}55` : 'none',
                      border: isCurrent ? `2px solid ${mod.accent}` : '1px solid rgba(255,255,255,0.12)'
                    }}
                  >
                    <div className="z-10 flex flex-col items-center justify-center text-center">
                      {!unlocked ? (
                        <Lock className="w-5 h-5 text-slate-400" />
                      ) : isFullySolved ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <span className="font-pixel text-xs text-white drop-shadow-md">
                          M{mod.id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Planet Label */}
                <div className="mt-2.5 flex flex-col items-center bg-charcoal-900 border border-charcoal-700 px-2.5 py-1 rounded-lg text-center max-w-[150px] shadow-md group-hover:border-cosmic-cyan transition-colors">
                  <span className="text-[10px] font-pixel text-slate-200 truncate w-full">
                    {mod.sectorName}
                  </span>
                  <span className="text-[9px] font-retro text-cosmic-cyan mt-0.5">
                    {solvedInMod.length}/{modProblems.length} SOLVED
                  </span>
                </div>

                {!unlocked && (
                  <div className="absolute -bottom-7 px-2 py-0.5 rounded bg-charcoal-950 border border-red-500/50 text-[9px] font-retro text-red-400 whitespace-nowrap z-40">
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
              <div className="px-2 py-0.5 rounded-full bg-charcoal-950/95 border border-cosmic-cyan text-[8px] font-pixel text-cosmic-cyan shadow-lg flex items-center gap-1 animate-pulse">
                <span>YOU (TAP ME)</span>
                <span className="text-[7px]">👆</span>
              </div>
              <div className="px-1.5 py-0.2 rounded bg-charcoal-900/90 border border-charcoal-700 text-[7px] font-pixel text-slate-300 shadow">
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
        <div className="z-30 bg-charcoal-900/98 backdrop-blur-lg border border-charcoal-750 rounded-2xl p-4 sm:p-5 shadow-2xl max-w-5xl mx-auto w-full transition-all animate-fadeInScale max-h-[380px] flex flex-col">
          <div className="flex items-center justify-between border-b border-charcoal-750 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cosmic-orange/20 border border-cosmic-orange text-cosmic-orange text-[10px] font-pixel">
                  {selectedModule.code}
                </span>
                <h2 className="text-xs sm:text-sm font-pixel text-slate-100">
                  {selectedModule.sectorName}: {selectedModule.title}
                </h2>
              </div>
              <p className="text-[11px] font-retro text-slate-400 mt-0.5 line-clamp-1">
                {selectedModule.description}
              </p>
            </div>

            <button
              onClick={() => setSelectedModule(null)}
              className="p-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 hover:text-white"
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
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    isCleared
                      ? 'bg-charcoal-950 border-cosmic-emerald/40 hover:border-cosmic-emerald'
                      : isAttempted
                      ? 'bg-charcoal-950 border-cosmic-amber/40 hover:border-cosmic-amber'
                      : 'bg-charcoal-950 border-charcoal-800 hover:border-cosmic-cyan box-glow-cyan'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-pixel text-slate-400">
                        LAB #{prob.moduleId}.{idx + 1}
                      </span>
                      <span className="text-[9px] font-retro px-1.5 py-0.2 rounded bg-charcoal-850 text-slate-300 border border-charcoal-700">
                        {prob.difficulty}
                      </span>
                    </div>

                    <h3 className="text-[11px] font-pixel text-slate-200 group-hover:text-cosmic-cyan transition-colors line-clamp-1">
                      {prob.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-charcoal-800/80 text-[11px] font-retro">
                    <span className="text-cosmic-amber flex items-center gap-1">
                      <Zap className="w-3 h-3" /> +{prob.xpReward} XP
                    </span>

                    {isCleared ? (
                      <span className="text-cosmic-emerald flex items-center gap-1 text-[9px] font-pixel">
                        <CheckCircle2 className="w-3 h-3" /> PASSED
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-white flex items-center text-[10px]">
                        SOLVE <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
              <div className="mt-3 pt-3 border-t border-charcoal-750 flex flex-wrap items-center justify-between gap-3 text-xs font-retro">
                {/* Sector Completion Meter */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cosmic-cyan animate-pulse" />
                  <span className="text-slate-300 text-[11px]">
                    SECTOR PROGRESS:
                  </span>
                  <span className="font-pixel text-[10px] text-cosmic-cyan">
                    {solvedInMod.length} / {modProblems.length} PROBLEMS CLEARED
                  </span>
                  {isFullySolved && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-cosmic-emerald text-cosmic-emerald text-[9px] font-pixel">
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-700 hover:border-slate-400 text-slate-300 text-[10px] font-pixel transition-colors"
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
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cosmic-emerald hover:bg-emerald-400 text-charcoal-950 font-pixel text-[10px] font-bold shadow-glow-emerald transition-all animate-bounce"
                      >
                        <span>ADVANCE TO NEXT SECTOR: {nextMod.sectorName}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-slate-400 text-[10px] font-retro">
                        <Lock className="w-3 h-3 text-cosmic-orange" />
                        <span>NEXT SECTOR LOCKED (Solve {modProblems.length - solvedInMod.length} more problem{modProblems.length - solvedInMod.length > 1 ? 's' : ''} to advance)</span>
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-charcoal-950 border border-cosmic-amber/50 text-cosmic-amber text-[10px] font-pixel flex items-center gap-1">
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
