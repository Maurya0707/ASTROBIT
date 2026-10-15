import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  ChevronRight, 
  ChevronLeft,
  Sparkles, 
  CheckCircle2, 
  Play, 
  Zap, 
  Compass, 
  X,
  Radio,
  Star,
  Rocket
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MODULES, PROBLEMS, getRankForXp } from '../data/curriculum.js';
import { 
  getModuleBezierPoints, 
  getPointOnCubicBezier, 
  getModuleProgress, 
  getSectorWaypoints, 
  getAstronautCoordinatesForSector,
  getActiveCampaignSectorId
} from '../utils/orbitalSpline.js';
import { soundFx } from '../services/soundFx';

// Interstellar telemetry waypoints placed in the space between planets (elevated to avoid hyperlane collision)
const INTERSTELLAR_WAYPOINTS = [
  { x: 550, y: 190, tag: 'HYPERLANE 01', distance: '1.4 AU', sub: 'TERRA → DUNE TRANSIT' },
  { x: 1130, y: 190, tag: 'CORONA PASS', distance: '2.8 AU', sub: 'MAGMA ACCRETION CORRIDOR' },
  { x: 1710, y: 190, tag: 'FROST EXPANSE', distance: '4.2 AU', sub: 'GLACIAL CRYO-CURRENT' },
  { x: 2290, y: 190, tag: 'KRONOS RINGS', distance: '5.6 AU', sub: 'DUST SHEPHERD FIELD' },
  { x: 2870, y: 190, tag: 'QUANTUM RIFT', distance: '7.0 AU', sub: 'CYBER SINGULARITY HORIZON' },
];

// Floating cosmic asteroids in deep space between sectors
const COSMIC_DEBRIS = [
  { x: 420, y: 160, size: 8, delay: 0 },
  { x: 670, y: 440, size: 12, delay: 1.5 },
  { x: 1010, y: 150, size: 9, delay: 0.8 },
  { x: 1250, y: 460, size: 14, delay: 2.1 },
  { x: 1590, y: 170, size: 7, delay: 1.2 },
  { x: 1840, y: 450, size: 11, delay: 2.8 },
  { x: 2180, y: 140, size: 10, delay: 0.4 },
  { x: 2420, y: 470, size: 13, delay: 1.9 },
  { x: 2760, y: 160, size: 8, delay: 2.4 },
  { x: 3010, y: 460, size: 12, delay: 1.1 },
];

export default function SpaceMap({ 
  userProgress, 
  onSelectProblem, 
  currentSectorId, 
  setCurrentSectorId 
}) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [avatarPos, setAvatarPos] = useState({ x: 260, y: 360 });
  const [isTraveling, setIsTraveling] = useState(false);
  
  // Dynamic multi-state astronaut animation on the level node
  const [characterAction, setCharacterAction] = useState('typing'); // 'typing' | 'jumping' | 'floating' | 'sitting' | 'waving'

  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scrollContainerRef = useRef(null);
  const currentRank = getRankForXp(userProgress.xp);

  const isModuleUnlocked = (mod) => {
    if (mod.id === 1) return true;
    const prevMod = MODULES.find(m => m.id === mod.id - 1);
    if (prevMod) {
      const { isCompleted } = getModuleProgress(prevMod.id, userProgress.clearedProblems);
      if (isCompleted) return true;
    }
    return currentRank.level >= mod.minLevelToUnlock || userProgress.xp >= mod.minXpToUnlock;
  };

  // Determine current active playable module (the earliest unlocked module with remaining problems, or currentSectorId)
  const getCurrentTargetModule = () => {
    return MODULES.find(m => m.id === currentSectorId) || MODULES[0];
  };

  // Ref to track last cleared count and animation frame
  const prevClearedCountRef = useRef(userProgress.clearedProblems.length);
  const animFrameRef = useRef(null);

  // Position astronaut & animate slow traversal when questions are cleared
  useEffect(() => {
    const curCleared = userProgress.clearedProblems.length;
    let isNewSolve = false;
    try {
      if (sessionStorage.getItem('GCPP_NEW_SOLVE_TRIGGERED') === 'true') {
        isNewSolve = true;
        sessionStorage.removeItem('GCPP_NEW_SOLVE_TRIGGERED');
      }
    } catch (e) {}

    if (curCleared > prevClearedCountRef.current) {
      isNewSolve = true;
    }

    const curMod = MODULES.find(m => m.id === currentSectorId) || MODULES[0];
    const { totalCount, solvedCount } = getModuleProgress(curMod.id, userProgress.clearedProblems);
    const { p0, p1, p2, p3 } = getModuleBezierPoints(curMod.id);

    if (isNewSolve && solvedCount > 0) {
      // Animate character moving slowly to the newly completed question milestone along the path!
      const oldSolved = Math.max(0, solvedCount - 1);
      const getTForSolve = (solved) => {
        if (solved === 0) return 0;
        if (solved >= totalCount) return 1;
        if (totalCount === 1) return 0.50;
        return 0.20 + ((solved - 1) / (totalCount - 1)) * 0.60;
      };
      const tOld = getTForSolve(oldSolved);
      const tNew = getTForSolve(solvedCount);

      setIsTraveling(true);
      setCharacterAction('walking');
      soundFx.playWarp();

      const startTime = performance.now();
      const duration = 2800; // 2.8s slow, steady cosmic walk

      const animateStep = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
        const currentT = tOld + (tNew - tOld) * ease;
        const pt = getPointOnCubicBezier(p0, p1, p2, p3, currentT);

        setAvatarPos(pt);

        if (scrollContainerRef.current) {
          const targetScroll = Math.max(0, pt.x - window.innerWidth / 2 + 100);
          scrollContainerRef.current.scrollLeft = targetScroll;
        }

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animateStep);
        } else {
          setAvatarPos(getAstronautCoordinatesForSector(curMod.id, userProgress.clearedProblems));
          setIsTraveling(false);
          setCharacterAction('jumping');
          soundFx.playPass();

          if (solvedCount >= totalCount) {
            soundFx.playLevelUp();
            confetti({
              particleCount: 110,
              spread: 75,
              origin: { y: 0.5 }
            });
          }

          setTimeout(() => {
            setCharacterAction('typing');
          }, 1800);
        }
      };

      animFrameRef.current = requestAnimationFrame(animateStep);
    } else {
      // Place character at current progress position along the spline
      const targetPt = getAstronautCoordinatesForSector(curMod.id, userProgress.clearedProblems);
      setAvatarPos(targetPt);

      if (scrollContainerRef.current) {
        const targetScroll = Math.max(0, targetPt.x - window.innerWidth / 2 + 100);
        scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }

    prevClearedCountRef.current = curCleared;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentSectorId, userProgress.clearedProblems]);

  // Periodic multi-animation cycling on the level node
  useEffect(() => {
    if (isTraveling) return;

    const actionCycle = ['typing', 'jumping', 'floating', 'sitting', 'waving'];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % actionCycle.length;
      setCharacterAction(actionCycle[currentIdx]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTraveling]);

  // Click astronaut directly to trigger victory jump
  const handleAstronautClick = (e) => {
    e.stopPropagation();
    soundFx.playPass();
    setCharacterAction('jumping');
    setTimeout(() => {
      setCharacterAction('typing');
    }, 1800);
  };

  // Smooth camera centering on a module
  const centerOnModule = (mod) => {
    if (scrollContainerRef.current) {
      const targetPt = getAstronautCoordinatesForSector(mod.id, userProgress.clearedProblems);
      const targetScroll = Math.max(0, targetPt.x - window.innerWidth / 2 + 100);
      scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
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

    const startPos = avatarPos;
    const targetPos = getAstronautCoordinatesForSector(targetMod.id, userProgress.clearedProblems);
    setCurrentSectorId(targetMod.id);

    const midX = (startPos.x + targetPos.x) / 2;
    const p0 = startPos;
    const p3 = targetPos;
    const p1 = { x: midX, y: Math.min(p0.y, p3.y) - 60 };
    const p2 = { x: midX, y: Math.max(p0.y, p3.y) + 60 };

    const duration = 1800;
    const startTime = performance.now();

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = 0.5 - Math.cos(t * Math.PI) / 2;
      const pt = getPointOnCubicBezier(p0, p1, p2, p3, ease);
      setAvatarPos(pt);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = pt.x - window.innerWidth / 2 + 100;
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animateStep);
      } else {
        setAvatarPos(targetPos);
        setIsTraveling(false);
        setCharacterAction('jumping');
        soundFx.playPass();
        setTimeout(() => {
          setCharacterAction('typing');
        }, 1500);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateStep);
  };

  // Quick pan navigation
  const panDelta = (delta) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
      soundFx.playClick();
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Enable mouse wheel to smoothly pan horizontally across the 3,480px universe
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // If user holds Shift or natural horizontal trackpad delta exists, let native scroll handle it
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const isAtEnd = container.scrollLeft >= maxScrollLeft - 10;
      const isAtStart = container.scrollLeft <= 10;

      // When reaching the galactic boundaries, let the event bubble up to scroll the page vertically down to the footer
      if ((e.deltaY > 0 && isAtEnd) || (e.deltaY < 0 && isAtStart)) {
        return;
      }

      // Smoothly pan through space horizontally with mouse wheel
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.3;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Get sprite image based on animation state
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

  // Render the glowing cosmic hyperlanes connecting the planets
  const renderOrbitalPaths = () => {
    return MODULES.slice(0, -1).map((mod, idx) => {
      const nextMod = MODULES[idx + 1];
      const p0 = mod.coordinates;
      const p3 = nextMod.coordinates;
      const midX = (p0.x + p3.x) / 2;
      const p1 = { x: midX, y: p0.y - 70 };
      const p2 = { x: midX, y: p3.y + 70 };

      const isPathActive = isModuleUnlocked(nextMod);
      const { ratio } = getModuleProgress(mod.id, userProgress.clearedProblems);
      const d = `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`;

      return (
        <g key={`path-${mod.id}-${nextMod.id}`}>
          {/* Outer glow stroke */}
          <path
            d={d}
            fill="none"
            stroke={isPathActive ? 'rgba(0, 240, 255, 0.18)' : 'rgba(71, 85, 105, 0.25)'}
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Core dashed trajectory */}
          <path
            d={d}
            fill="none"
            stroke={isPathActive ? 'rgba(0, 240, 255, 0.45)' : 'rgba(100, 116, 139, 0.35)'}
            strokeWidth="3"
            strokeDasharray={isPathActive ? '12 8' : '6 8'}
          />

          {/* Charged plasma energy beam on the completed question path */}
          {ratio > 0 && (
            <path
              d={d}
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="1400"
              strokeDashoffset={1400 * (1 - ratio)}
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_rgba(16,185,129,0.9)] opacity-95 transition-all duration-1000"
            />
          )}

          {/* Animated stardust pulse stream along unlocked hyperlanes */}
          {isPathActive && (
            <path
              d={d}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="16 24"
              className="opacity-75 animate-pulse"
            />
          )}
        </g>
      );
    });
  };

  // Find the current active sector
  const activeSector = MODULES.find(m => m.id === currentSectorId) || MODULES[0];

  return (
    <div className="relative w-full flex flex-col justify-start pt-3 sm:pt-4 px-2 sm:px-4 pb-6 select-none">
      
      {/* ================= TOP STAR MAP HUD ================= */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-2 sm:gap-3 pointer-events-none mb-1.5">
        {/* Left Title & Status (Square Div Fit) */}
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-md border border-white/15 flex items-center gap-2.5 shadow-md">
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="text-[11px] font-pixel font-bold text-slate-100 tracking-wider">
            SYLLABUS STAR MAP
          </span>
          <span className="hidden lg:inline text-[10px] font-retro text-slate-400 border-l border-white/10 pl-2">
            Interstellar Distance: 7.0 AU across 6 Celestial Sectors
          </span>
        </div>

        {/* Center Quick Sector Jump Pills (Square Div Fit) */}
        <div className="hidden xl:flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-xl p-1 rounded-md border border-white/15 shadow-md">
          {MODULES.map((m) => {
            const unlocked = isModuleUnlocked(m);
            const isCurrent = m.id === currentSectorId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  centerOnModule(m);
                  if (unlocked) travelToModule(m);
                }}
                className={`px-2 py-1 rounded-sm text-[9px] font-pixel transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                    : unlocked
                    ? 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
                    : 'bg-black/40 text-slate-500 border border-transparent opacity-60'
                }`}
              >
                {!unlocked ? (
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: m.accent }} />
                )}
                <span>{m.code}</span>
              </button>
            );
          })}
        </div>

        {/* Right Warp Controls & Telemetry (Square Div Fit) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => panDelta(-450)}
            className="px-2.5 py-1.5 rounded-md bg-black/60 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-pixel transition-colors flex items-center gap-1 shadow-md"
            title="Pan Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WARP WEST</span>
          </button>
          
          <button
            onClick={() => centerOnModule(activeSector)}
            className="px-3 py-1.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-300 font-pixel text-xs transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
            title="Focus on Active Sector"
          >
            <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            <span>ACTIVE SECTOR</span>
          </button>

          <button
            onClick={() => panDelta(450)}
            className="px-2.5 py-1.5 rounded-md bg-black/60 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-pixel transition-colors flex items-center gap-1 shadow-md"
            title="Pan Right"
          >
            <span className="hidden sm:inline">WARP EAST</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ================= MAIN INTERSTELLAR SCROLL CONTAINER ================= */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`relative w-full max-w-full overflow-x-auto overflow-y-hidden border border-white/15 rounded-lg bg-black/30 h-[535px] cursor-grab active:cursor-grabbing select-none scrollbar-thin scrollbar-thumb-cyan-500/30 hover:scrollbar-thumb-cyan-400 scrollbar-track-black/40 ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        {/* Full Interstellar Canvas: 3500px wide for true deep space travel */}
        <div className="relative w-[3480px] h-[520px]">
          
          {/* Orbital Spline Connection Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderOrbitalPaths()}
          </svg>

          {/* Deep Space Interstellar Waypoints */}
          {INTERSTELLAR_WAYPOINTS.map((wp, idx) => (
            <div
              key={`wp-${idx}`}
              style={{
                left: `${wp.x}px`,
                top: `${wp.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-10 pointer-events-none flex flex-col items-center opacity-70 group"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                <span className="text-[8px] font-pixel text-slate-300 tracking-wider">
                  {wp.tag}
                </span>
                <span className="text-[8px] font-retro text-amber-400 font-bold border-l border-white/10 pl-1.5">
                  {wp.distance}
                </span>
              </div>
              <span className="text-[7px] font-retro text-slate-500 mt-0.5 tracking-wider">
                {wp.sub}
              </span>
            </div>
          ))}

          {/* Question Milestone Checkpoints along each Sector Hyperlane */}
          {MODULES.map((mod) => {
            const waypoints = getSectorWaypoints(mod.id, userProgress.clearedProblems);
            const modUnlocked = isModuleUnlocked(mod);

            return waypoints.map((wp) => (
              <div
                key={`wp-${wp.problem.id}`}
                style={{
                  left: `${wp.x}px`,
                  top: `${wp.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (modUnlocked) {
                    onSelectProblem(wp.problem);
                  }
                }}
                className={`absolute z-20 flex flex-col items-center group transition-transform ${
                  modUnlocked ? 'cursor-pointer pointer-events-auto hover:scale-125' : 'pointer-events-none opacity-40'
                }`}
                title={`Lab ${wp.labNumber}: ${wp.problem.title} (${wp.isCleared ? 'Cleared' : wp.isNext ? 'Next Mission' : 'Locked'})`}
              >
                {/* Waypoint glowing circle */}
                <div className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  wp.isCleared
                    ? 'w-6 h-6 bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]'
                    : wp.isNext
                    ? 'w-6 h-6 bg-amber-400 text-black border-2 border-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.95)] animate-pulse'
                    : 'w-4 h-4 bg-slate-900 border border-slate-700 text-slate-500'
                }`}>
                  {wp.isCleared ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[3]" />
                  ) : wp.isNext ? (
                    <span className="text-[8px] font-pixel font-bold">▶</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}

                  {/* Pulsing ring for active next question */}
                  {wp.isNext && (
                    <span className="absolute -inset-1.5 rounded-full border border-amber-400/70 animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Question lab number pill below */}
                <div className="mt-1 px-1.5 py-0.2 rounded-sm bg-black/85 backdrop-blur-md border border-white/10 text-[7px] font-pixel text-slate-300 shadow group-hover:border-cyan-400/80 group-hover:text-cyan-300 transition-colors whitespace-nowrap">
                  {wp.labNumber}
                </div>
              </div>
            ));
          })}

          {/* Floating Deep Space Cosmic Debris */}
          {COSMIC_DEBRIS.map((deb, idx) => (
            <div
              key={`deb-${idx}`}
              style={{
                left: `${deb.x}px`,
                top: `${deb.y}px`,
                width: `${deb.size}px`,
                height: `${deb.size}px`,
                animationDelay: `${deb.delay}s`
              }}
              className="absolute pointer-events-none rounded-full bg-slate-400/20 border border-slate-300/30 blur-[0.5px] animate-float opacity-40"
            />
          ))}

          {/* Planetary Sector Nodes */}
          {MODULES.map((mod) => {
            const unlocked = isModuleUnlocked(mod);
            const isCurrent = currentSectorId === mod.id;
            const modProblems = PROBLEMS.filter(p => p.moduleId === mod.id);
            const solvedInMod = modProblems.filter(p => userProgress.clearedProblems.includes(p.id));
            const isFullySolved = modProblems.length > 0 && solvedInMod.length === modProblems.length;
            const starCount = isFullySolved ? 3 : solvedInMod.length > 0 ? 2 : 1;

            // Planet size based on artwork (Ringed has wider horizontal rings)
            const isRinged = mod.id === 5;
            const planetWidth = isRinged ? 'w-48 sm:w-56' : 'w-28 sm:w-32';
            const planetHeight = 'h-28 sm:h-32';

            return (
              <div
                key={mod.id}
                data-planet-id={mod.id}
                id={`planet-node-${mod.id}`}
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
                {/* ================= STATE HEADER BADGE (Square Div Fit) ================= */}
                <div className={`transition-transform duration-300 group-hover:-translate-y-1 ${isCurrent ? 'mb-16' : 'mb-2'}`}>
                  {!unlocked ? (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[9px] font-pixel text-slate-300 shadow-md">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      <span>LOCKED</span>
                    </div>
                  ) : isCurrent ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-400/20 backdrop-blur-md border border-amber-300 text-[9px] font-pixel text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.5)] animate-pulse tracking-wide">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>NEW / CURRENT</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-500/20 backdrop-blur-md border border-emerald-400/70 text-[9px] font-pixel text-emerald-300 shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span>UNLOCKED</span>
                    </div>
                  )}
                </div>

                {/* ================= PLANET GRAPHIC CONTAINER ================= */}
                <div className="relative flex items-center justify-center">
                  
                  {/* Dynamic Glowing Aura behind Planet */}
                  {unlocked ? (
                    <div 
                      className={`absolute inset-0 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
                        isCurrent ? 'opacity-80 scale-125' : 'opacity-40 group-hover:opacity-75'
                      }`}
                      style={{ background: `radial-gradient(circle, ${mod.accent} 0%, ${mod.color} 50%, transparent 75%)` }}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-40"
                      style={{ background: 'radial-gradient(circle, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 75%, transparent 100%)' }}
                    />
                  )}

                  {/* Pulsing beacon waves for Current active planet */}
                  {isCurrent && (
                    <>
                      <div 
                        className="absolute -inset-4 rounded-full border border-amber-400/50 animate-ping pointer-events-none opacity-30"
                      />
                      <div 
                        className="absolute -inset-8 rounded-full border-2 border-amber-300/30 animate-pulse pointer-events-none"
                      />
                    </>
                  )}

                  {/* The Actual Illustrated Planet Image */}
                  <div 
                    className={`relative ${planetWidth} ${planetHeight} flex items-center justify-center transition-all duration-300 ${
                      unlocked
                        ? 'group-hover:scale-110 drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
                        : 'opacity-55 filter grayscale contrast-125'
                    }`}
                  >
                    <img
                      src={mod.planetImg}
                      alt={mod.sectorName}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
                    />

                    {/* ================= LOCKED OVERLAY: CROSSED CHAINS + PADLOCK ================= */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        {/* Metallic Crossed Chains SVG */}
                        <svg 
                          viewBox="0 0 120 120" 
                          className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]"
                        >
                          <defs>
                            <linearGradient id={`chainGrad-${mod.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f1f5f9" />
                              <stop offset="35%" stopColor="#94a3b8" />
                              <stop offset="70%" stopColor="#475569" />
                              <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                          </defs>
                          
                          {/* Diagonal Chain 1: TL to BR */}
                          <line x1="12" y1="12" x2="108" y2="108" stroke="#020617" strokeWidth="13" strokeLinecap="round" />
                          <line x1="12" y1="12" x2="108" y2="108" stroke={`url(#chainGrad-${mod.id})`} strokeWidth="9" strokeLinecap="round" strokeDasharray="12 6" />
                          <line x1="12" y1="12" x2="108" y2="108" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 15" strokeDashoffset="2" opacity="0.8" />

                          {/* Diagonal Chain 2: TR to BL */}
                          <line x1="108" y1="12" x2="12" y2="108" stroke="#020617" strokeWidth="13" strokeLinecap="round" />
                          <line x1="108" y1="12" x2="12" y2="108" stroke={`url(#chainGrad-${mod.id})`} strokeWidth="9" strokeLinecap="round" strokeDasharray="12 6" />
                          <line x1="108" y1="12" x2="12" y2="108" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 15" strokeDashoffset="2" opacity="0.8" />
                        </svg>

                        {/* Heavy Metallic Padlock Centered on Crossed Chains */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-14 drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]">
                          <img 
                            src="/planets/padlock.png" 
                            alt="Locked Padlock" 
                            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]" 
                          />
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* ================= PLANET INFO & SECTOR DETAILS (Square Div Fit) ================= */}
                <div className="mt-2 flex flex-col items-center bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1 rounded-md text-center max-w-[170px] shadow-lg group-hover:border-cyan-400/80 transition-colors">
                  <div className="flex items-center gap-1.5 w-full justify-center">
                    <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: mod.accent }} />
                    <span className="text-[10px] font-pixel text-slate-100 truncate">
                      {mod.sectorName}
                    </span>
                  </div>
                  <span className="text-[9px] font-retro text-cyan-300 mt-0.5">
                    {solvedInMod.length}/{modProblems.length} SOLVED • {mod.distanceAu}
                  </span>
                </div>

                {/* ================= UNLOCKED / SOLVED FOOTER (STARS + PLAY / CLEARED) ================= */}
                {unlocked ? (
                  <div className="flex flex-col items-center gap-1 mt-1.5">
                    {/* 3 Stars Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <span 
                          key={s} 
                          className={`text-sm ${
                            s <= starCount 
                              ? 'text-amber-400 filter drop-shadow-[0_0_6px_rgba(250,204,21,0.9)]' 
                              : 'text-slate-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Cleared Checkmark or Play Button (Square Div Fit) */}
                    {isFullySolved ? (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-sm bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 font-pixel text-[8px] shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>MASTERED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-0.5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-pixel text-[8px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all">
                        <Play className="w-2 h-2 fill-current" />
                        <span>PLAY</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1.5 px-2 py-0.5 rounded-sm bg-black/80 backdrop-blur-md border border-red-500/40 text-[8px] font-retro text-red-300 whitespace-nowrap">
                    REQ LV.{mod.minLevelToUnlock} ({mod.minXpToUnlock} XP)
                  </div>
                )}

              </div>
            );
          })}

          {/* ================= 2D Pixel-Art Astronaut Traversing Current Sector ================= */}
          <div
            style={{
              left: `${avatarPos.x}px`,
              top: `${avatarPos.y - 68}px`,
              transform: 'translate(-50%, -50%)',
              transition: isTraveling ? 'none' : 'transform 0.25s ease-out',
              width: '56px',
              height: '56px'
            }}
            onClick={handleAstronautClick}
            className="absolute z-30 cursor-pointer flex flex-col items-center justify-center group pointer-events-auto"
          >
            {/* Astronaut Sprite */}
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
                alt="Astronaut on Sector"
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

      {/* ================= SELECTED SECTOR MISSION MODAL OVERLAY ================= */}
      {selectedModule && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedModule(null);
          }}
        >
          <div className="bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 rounded-lg p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] max-w-4xl mx-auto w-full transition-all animate-fadeInScale max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-black/40 border border-white/10 p-1 flex items-center justify-center">
                <img 
                  src={selectedModule.planetImg} 
                  alt={selectedModule.sectorName} 
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-sm bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-pixel">
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
            </div>

            <button
              onClick={() => setSelectedModule(null)}
              className="p-1 rounded-sm bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
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
                  data-prob-card={prob.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedModule(null);
                    onSelectProblem(prob);
                  }}
                  className={`p-3 rounded-md border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group backdrop-blur-md ${
                    isCleared
                      ? 'bg-black/50 border-emerald-500/40 hover:border-emerald-400'
                      : isAttempted
                      ? 'bg-black/50 border-amber-500/40 hover:border-amber-400'
                      : 'bg-black/45 border-white/10 hover:border-cyan-400/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-pixel text-slate-400">
                        LAB #{prob.moduleId}.{idx + 1}
                      </span>
                      <span className="text-[9px] font-retro px-1.5 py-0.2 rounded-sm bg-white/5 text-slate-300 border border-white/10">
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

          {/* Next Module / Sector Navigation Bar */}
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
                    <span className="px-1.5 py-0.2 rounded-sm bg-emerald-950 border border-cosmic-emerald text-cosmic-emerald text-[9px] font-pixel">
                      ★ SECTOR MASTERED
                    </span>
                  )}
                </div>

                {/* Navigation Options (Square Div Fit) */}
                <div className="flex items-center gap-2">
                  {prevMod && (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        travelToModule(prevMod);
                        setSelectedModule(prevMod);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-charcoal-950 border border-charcoal-700 hover:border-slate-400 text-slate-300 text-[10px] font-pixel transition-colors"
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
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-cosmic-emerald hover:bg-emerald-400 text-charcoal-950 font-pixel text-[10px] font-bold shadow-glow-emerald transition-all animate-bounce"
                      >
                        <span>ADVANCE TO NEXT SECTOR: {nextMod.sectorName}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-charcoal-950 border border-charcoal-750 text-slate-400 text-[10px] font-retro">
                        <Lock className="w-3 h-3 text-cosmic-orange" />
                        <span>NEXT SECTOR LOCKED (Solve {modProblems.length - solvedInMod.length} more problem{modProblems.length - solvedInMod.length > 1 ? 's' : ''} to advance)</span>
                      </div>
                    )
                  ) : (
                    <div className="px-3 py-1.5 rounded-md bg-charcoal-950 border border-cosmic-amber/50 text-cosmic-amber text-[10px] font-pixel flex items-center gap-1">
                      <span>👑 FINAL SECTOR OF SYLLABUS REACHED</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
          </div>
        </div>
      )}

    </div>
  );
}
