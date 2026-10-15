import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Send, 
  HelpCircle, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  FileCode,
  Zap,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../services/soundFx';
import { cEngine } from '../services/cEngine';
import { MODULES, PROBLEMS } from '../data/curriculum.js';
import { getModuleProgress } from '../utils/orbitalSpline.js';

export default function Workspace({ 
  problem, 
  userProgress, 
  onProblemSolved, 
  onProblemAttempted,
  onBackToMap,
  onDeductXp,
  onNextProblem,
  onPrevProblem,
  hasNextProblem,
  hasPrevProblem,
  problemIndex,
  totalProblems
}) {
  const [code, setCode] = useState(problem.starterCode);
  const [splitRatio, setSplitRatio] = useState(38.2); // Golden Ratio default
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'hints'
  const [isMobileTab, setIsMobileTab] = useState('editor'); // 'spec' | 'editor' on mobile
  
  // Execution status
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [astronautReaction, setAstronautReaction] = useState('/sprites/astronaut_floating.png');

  // Hint management
  const [unlockedHintLevels, setUnlockedHintLevels] = useState([]);

  const containerRef = useRef(null);

  const isCurrentCleared = userProgress.clearedProblems.includes(problem.id);

  // Sync state when problem changes
  useEffect(() => {
    setCode(problem.starterCode);
    setEvalResult(null);
    setSelectedTestCaseIdx(0);
    setAstronautReaction('/sprites/astronaut_floating.png');
    setUnlockedHintLevels([]);
  }, [problem.id]);

  // Handle Dragging Split-Pane Handle with 60fps pointer events
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    soundFx.playClick();
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const newRatio = (pointerX / rect.width) * 100;
      if (newRatio >= 22 && newRatio <= 78) {
        setSplitRatio(newRatio);
      }
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const snapToGoldenRatio = () => {
    soundFx.playClick();
    setSplitRatio(38.2);
  };

  const snapToEqual = () => {
    soundFx.playClick();
    setSplitRatio(50);
  };

  // Run Code / Submit Code
  const handleExecute = async (isSubmission = true) => {
    soundFx.playCompile();
    setIsEvaluating(true);
    setAstronautReaction('/sprites/astronaut_typing.png');
    onProblemAttempted?.(problem.id);

    try {
      const res = await cEngine.evaluateSubmission(problem, code);
      setIsEvaluating(false);
      setEvalResult(res);

      if (res.allPassed) {
        soundFx.playPass();
        soundFx.playLevelUp();
        setAstronautReaction('/sprites/astronaut_cheering.png');

        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 }
        });

        if (isSubmission) {
          onProblemSolved(problem.id, res.earnedXp);
        }
      } else {
        soundFx.playFail();
        setAstronautReaction('/sprites/astronaut_hint.png');
      }
    } catch (err) {
      setIsEvaluating(false);
      soundFx.playFail();
      setAstronautReaction('/sprites/astronaut_hint.png');
      setEvalResult({
        allPassed: false,
        compilationError: err.message,
        results: []
      });
    }
  };

  const handleUnlockHint = (hint) => {
    if (unlockedHintLevels.includes(hint.level)) return;
    if (userProgress.xp < hint.cost) {
      soundFx.playFail();
      alert(`Insufficient XP! You need ${hint.cost} XP to unlock this hint.`);
      return;
    }
    soundFx.playWarp();
    onDeductXp(hint.cost);
    setUnlockedHintLevels([...unlockedHintLevels, hint.level]);
  };

  const currentMod = MODULES.find(m => m.id === problem.moduleId) || MODULES[0];
  const nextMod = MODULES.find(m => m.id === problem.moduleId + 1);
  const { modProblems, totalCount, solvedCount, ratio, isCompleted } = getModuleProgress(problem.moduleId, userProgress.clearedProblems);
  const progressPercent = ratio * 100;

  return (
    <div className="relative w-full h-[calc(100vh-4.25rem)] flex flex-col overflow-hidden bg-transparent select-none border-t border-white/10">
      
      {/* ================= TOP NAVIGATION BAR: Next Problem Bar ================= */}
      <div className="h-11 px-3 sm:px-6 bg-black/60 border-b border-white/10 flex items-center justify-between gap-3 text-xs font-retro z-20">
        
        {/* Previous Problem Button */}
        <button
          onClick={() => {
            if (hasPrevProblem) {
              soundFx.playClick();
              onPrevProblem();
            }
          }}
          disabled={!hasPrevProblem}
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-black/60 border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">PREV LAB</span>
        </button>

        {/* Center Progress Mission Indicator */}
        <div className="flex items-center gap-2 truncate text-center">
          <button 
            onClick={onBackToMap}
            className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 border-r border-white/15 pr-3"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>STAR MAP</span>
          </button>

          <span className="text-[10px] font-pixel text-amber-400">
            MOD {problem.moduleId}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            LAB #{problemIndex + 1} OF {totalProblems}:
          </span>
          <span className="font-pixel text-[11px] text-slate-100 truncate max-w-[200px] sm:max-w-[340px]">
            {problem.title}
          </span>

          {isCurrentCleared && (
            <span className="hidden sm:flex items-center gap-1 text-emerald-400 text-[9px] font-pixel bg-emerald-950/40 border border-emerald-500/50 px-1.5 py-0.2 rounded-sm ml-1">
              <CheckCircle2 className="w-3 h-3" /> CLEARED
            </span>
          )}
        </div>

        {/* Next Problem Button */}
        <button
          onClick={() => {
            if (hasNextProblem) {
              soundFx.playClick();
              onNextProblem();
            }
          }}
          disabled={!hasNextProblem}
          className="flex items-center gap-1 px-3.5 py-1 rounded-md bg-black/60 border border-amber-500/60 text-amber-400 hover:bg-amber-500 hover:text-black font-pixel text-[10px] font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>NEXT LAB</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ================= INTERSTELLAR FLIGHT TRAJECTORY STRIP ================= */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none z-10">
        {/* Origin Planet */}
        <div className="flex items-center gap-2">
          <img 
            src={currentMod.planetImg} 
            alt={currentMod.sectorName} 
            className="w-5 h-5 object-contain filter drop-shadow" 
          />
          <div className="flex flex-col">
            <span className="font-pixel text-[9px] text-slate-200">
              {currentMod.sectorName}
            </span>
            <span className="text-[8px] font-retro text-cyan-300">
              {solvedCount}/{totalCount} Completed ({Math.round(progressPercent)}%)
            </span>
          </div>
        </div>

        {/* Interstellar Trajectory Track with Slowly Moving Astronaut */}
        <div className="flex-1 max-w-lg mx-2 flex flex-col justify-center">
          <div className="relative w-full h-6 flex items-center">
            {/* Trajectory Guide Track */}
            <div className="absolute left-2 right-2 h-1 rounded-full bg-slate-800/80 border border-slate-700/60 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checkpoints for Each Lab in this Module */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              {modProblems.map((prob, idx) => {
                const isCleared = userProgress.clearedProblems.includes(prob.id);
                const isCurrent = prob.id === problem.id;

                return (
                  <div 
                    key={prob.id} 
                    className="relative flex flex-col items-center group pointer-events-auto"
                    title={`Lab ${problem.moduleId}.${idx + 1}: ${prob.title} (${isCleared ? 'Cleared' : 'Pending'})`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isCleared
                        ? 'bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : isCurrent
                        ? 'bg-amber-400 border-2 border-amber-200 text-black shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      {isCleared ? (
                        <span className="text-[7px] font-bold">✓</span>
                      ) : (
                        <span className="text-[6px] font-pixel">{idx + 1}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The Animated Travelling Astronaut Sprite slowly advancing along the track! */}
            <div 
              className="absolute pointer-events-none z-10 transition-all duration-1000 ease-out -translate-x-1/2 flex flex-col items-center"
              style={{ 
                left: `${Math.max(8, Math.min(92, progressPercent))}%`,
                top: '-7px'
              }}
            >
              <img 
                src="/sprites/astronaut_walking.png"
                alt="Travelling Astronaut"
                className="w-5 h-5 object-contain pixelated filter drop-shadow-[0_2px_8px_rgba(0,240,255,0.7)] animate-bounce"
              />
            </div>
          </div>
        </div>

        {/* Destination Planet */}
        <div className="flex items-center gap-2">
          {nextMod ? (
            <>
              <div className="flex flex-col text-right">
                <span className="font-pixel text-[9px] text-slate-300">
                  {nextMod.sectorName}
                </span>
                <span className={`text-[8px] font-retro ${
                  isCompleted ? 'text-emerald-400 font-bold' : 'text-slate-500'
                }`}>
                  {isCompleted ? '★ PATH COMPLETE' : 'Next Planet'}
                </span>
              </div>
              <img 
                src={nextMod.planetImg} 
                alt={nextMod.sectorName} 
                className={`w-5 h-5 object-contain filter drop-shadow transition-all ${
                  isCompleted ? 'brightness-110' : 'grayscale opacity-50'
                }`} 
              />
            </>
          ) : (
            <div className="flex items-center gap-1 text-amber-300 font-pixel text-[8px]">
              <span>👑 APEX SECTOR</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Split-Pane Workspace Body */}
      <div 
        ref={containerRef}
        className={`relative flex-1 flex flex-col md:flex-row overflow-hidden ${
          isDragging ? 'cursor-col-resize' : ''
        }`}
      >
        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center justify-between bg-black/40 border-b border-white/10 px-3 py-1.5 text-xs font-retro">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-md border border-white/10 w-full justify-center">
            <button
              onClick={() => setIsMobileTab('spec')}
              className={`flex-1 py-1 rounded-sm text-[10px] font-pixel text-center ${isMobileTab === 'spec' ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400'}`}
            >
              PROBLEM
            </button>
            <button
              onClick={() => setIsMobileTab('editor')}
              className={`flex-1 py-1 rounded-sm text-[10px] font-pixel text-center ${isMobileTab === 'editor' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400'}`}
            >
              CODE & TEST
            </button>
          </div>
        </div>

        {/* ================= LEFT PANE: Problem Statement Panel (Partially Transparent) ================= */}
        <div 
          style={{ width: `${splitRatio}%` }}
          className={`h-full flex-col border-r border-white/10 bg-black/50 overflow-hidden ${
            isMobileTab === 'spec' ? 'flex w-full md:w-auto' : 'hidden md:flex'
          }`}
        >
          {/* Panel Header */}
          <div className="h-10 px-4 bg-black/50 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-pixel text-slate-100 truncate max-w-[200px] sm:max-w-[260px]">
                {problem.title}
              </h2>
            </div>
            <span className="text-[10px] font-retro px-2 py-0.5 rounded-sm bg-amber-500/20 border border-amber-400 text-amber-300">
              +{problem.xpReward} XP
            </span>
          </div>

          {/* Tab Switcher: Problem Briefing / Hints */}
          <div className="flex items-center border-b border-white/10 bg-black/35 text-xs font-retro">
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('problem'); }}
              className={`flex-1 py-2 text-center transition-colors ${
                activeTab === 'problem'
                  ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BRIEFING & SPECS
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('hints'); }}
              className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'border-b-2 border-amber-400 text-amber-300 font-bold bg-white/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HINTS ({unlockedHintLevels.length}/{problem.hints.length})</span>
            </button>
          </div>

          {/* Panel Body: Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 font-retro space-y-4">
            {activeTab === 'problem' ? (
              <>
                <div className="flex items-center justify-between bg-black/45 p-2.5 rounded-md border border-white/10 backdrop-blur-md">
                  <span className="text-slate-400">SYLLABUS REF:</span>
                  <span className="text-cyan-400 font-semibold">{problem.syllabusRef}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-pixel text-[10px] text-cyan-400 tracking-wider">
                    MISSION OBJECTIVE
                  </h3>
                  <p className="leading-relaxed whitespace-pre-wrap text-slate-200">
                    {problem.description}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-black/40 p-3 rounded-md border border-white/10 backdrop-blur-md">
                    <span className="font-pixel text-[9px] text-amber-400 block mb-1">
                      INPUT FORMAT:
                    </span>
                    <p className="text-slate-300">{problem.inputFormat}</p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-md border border-white/10 backdrop-blur-md">
                    <span className="font-pixel text-[9px] text-amber-400 block mb-1">
                      OUTPUT FORMAT:
                    </span>
                    <p className="text-slate-300 whitespace-pre-wrap">{problem.outputFormat}</p>
                  </div>

                  <div className="bg-black/40 p-3 rounded-md border border-white/10 backdrop-blur-md">
                    <span className="font-pixel text-[9px] text-amber-400 block mb-1">
                      CONSTRAINTS:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{problem.constraints}</p>
                  </div>
                </div>

                {/* Sample I/O */}
                <div className="space-y-2">
                  <h3 className="font-pixel text-[10px] text-cyan-400 tracking-wider">
                    SAMPLE TELEMETRY
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="bg-black/40 p-2.5 rounded-md border border-white/10 backdrop-blur-md">
                      <span className="text-[9px] text-slate-400 block mb-1 font-pixel">SAMPLE INPUT</span>
                      <pre className="font-mono text-cyan-300 text-[11px] whitespace-pre-wrap">{problem.sampleInput}</pre>
                    </div>
                    <div className="bg-black/40 p-2.5 rounded-md border border-white/10 backdrop-blur-md">
                      <span className="text-[9px] text-slate-400 block mb-1 font-pixel">SAMPLE OUTPUT</span>
                      <pre className="font-mono text-emerald-400 text-[11px] whitespace-pre-wrap">{problem.sampleOutput}</pre>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Tiered Hint System */
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-black/45 p-3 rounded-md border border-white/10 backdrop-blur-md">
                  <img 
                    src="/sprites/astronaut_hint.png" 
                    alt="Hint" 
                    style={{ width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px' }}
                    className="object-contain pixelated" 
                  />
                  <div>
                    <h4 className="font-pixel text-[10px] text-amber-400">TIERED HINT TRANSMISSION</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hints provide algorithmic assistance at the cost of XP.
                    </p>
                  </div>
                </div>

                {problem.hints.map((hint) => {
                  const isUnlocked = unlockedHintLevels.includes(hint.level);
                  return (
                    <div 
                      key={hint.level}
                      className={`p-3 rounded-md border transition-all ${
                        isUnlocked ? 'bg-black/50 border-amber-400/50 backdrop-blur-md' : 'bg-black/35 border-white/10 backdrop-blur-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-pixel text-[10px] text-slate-300">
                          HINT LEVEL #{hint.level}
                        </span>
                        {!isUnlocked ? (
                          <button
                            onClick={() => handleUnlockHint(hint)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] font-pixel hover:bg-amber-400 hover:text-black transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>UNLOCK (-{hint.cost} XP)</span>
                          </button>
                        ) : (
                          <span className="text-[9px] font-pixel text-emerald-400">
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <p className="text-slate-200 leading-relaxed font-retro text-xs">
                          {hint.text}
                        </p>
                      ) : (
                        <div className="h-8 bg-black/40 rounded flex items-center justify-center text-slate-500 text-[10px] italic">
                          Encrypted hint transmission.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ================= DRAGGABLE SPLIT HANDLE ================= */}
        <div
          onPointerDown={handlePointerDown}
          className="hidden md:flex relative w-2 h-full bg-black/40 hover:bg-cyan-400/40 active:bg-cyan-400 items-center justify-center cursor-col-resize transition-colors z-20 group border-x border-white/5"
          title="Drag to resize (φ snap)"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-0.5 h-3 rounded bg-slate-500 group-hover:bg-white" />
            <div className="w-0.5 h-3 rounded bg-slate-500 group-hover:bg-white" />
          </div>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-black/90 border border-cyan-400 px-2 py-0.5 rounded-sm text-[8px] font-pixel text-cyan-300 whitespace-nowrap shadow-xl z-30">
            <button onClick={(e) => { e.stopPropagation(); snapToGoldenRatio(); }} className="hover:underline">
              φ (38.2%)
            </button>
            <span>|</span>
            <button onClick={(e) => { e.stopPropagation(); snapToEqual(); }} className="hover:underline">
              50%
            </button>
          </div>
        </div>

        {/* ================= RIGHT PANE: Code Editor & Console ================= */}
        <div 
          style={{ width: `${100 - splitRatio}%` }}
          className={`h-full flex-col bg-transparent overflow-hidden ${
            isMobileTab === 'editor' ? 'flex w-full md:w-auto' : 'hidden md:flex'
          }`}
        >
          {/* Editor Action Bar */}
          <div className="h-10 px-3 sm:px-4 bg-black/60 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-slate-300">
                main.c (C17 / GCC)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('hints'); setIsMobileTab('spec'); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-black/50 hover:bg-white/10 border border-white/15 text-xs font-retro text-amber-400 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HINT</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  if (confirm('Reset to starter C code?')) setCode(problem.starterCode);
                }}
                className="p-1 rounded-sm bg-black/60 hover:bg-white/10 border border-white/15 text-slate-400 hover:text-white transition-colors"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={isEvaluating}
                onClick={() => handleExecute(false)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-black/60 hover:bg-white/10 border border-white/15 text-xs font-retro text-slate-200 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>TEST</span>
              </button>

              <button
                id="submit-code-btn"
                disabled={isEvaluating}
                onClick={() => handleExecute(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-amber-500 hover:bg-amber-400 text-black text-xs font-pixel font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'RUNNING' : 'SUBMIT'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-transparent min-h-[200px]">
            <Editor
              height="100%"
              defaultLanguage="c"
              language="c"
              theme="vs-dark"
              value={code}
              onChange={(val) => {
                setCode(val || '');
                soundFx.playType();
              }}
              options={{
                fontSize: 13,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                lineNumbers: 'on',
                padding: { top: 8, bottom: 8 }
              }}
            />
          </div>

          {/* Lower Test Execution Console with Next Problem Victory Prompt */}
          <div className="h-56 border-t border-white/10 bg-black/60 flex flex-col">
            {/* Console Header */}
            <div className="h-9 px-4 bg-black/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-pixel text-slate-200">
                  EVALUATION CONSOLE
                </span>
                {evalResult && (
                  <span className={`text-[9px] font-pixel px-1.5 py-0.2 rounded-sm ml-2 ${
                    evalResult.allPassed 
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/50'
                      : 'bg-red-950/60 text-red-400 border border-red-800/60'
                  }`}>
                    {evalResult.allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
                  </span>
                )}
              </div>

              {/* Action and Astronaut Reaction Avatar */}
              <div className="flex items-center gap-2">
                {evalResult?.allPassed && hasNextProblem && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onNextProblem();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-400 hover:bg-emerald-300 text-black font-pixel text-[9px] font-bold shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all animate-bounce"
                  >
                    <span>NEXT LAB &gt;&gt;</span>
                  </button>
                )}

                <img 
                  src={astronautReaction} 
                  alt="Reaction" 
                  onError={(e) => {
                    if (!e.currentTarget.src.includes('astronaut_idle.png')) {
                      e.currentTarget.src = '/sprites/astronaut_idle.png';
                    }
                  }}
                  style={{ width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px' }}
                  className="object-contain pixelated" 
                />
              </div>
            </div>

            {/* Test Case Breakdown */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
              {evalResult ? (
                evalResult.compilationError ? (
                  <div className="space-y-3">
                    {/* Structured Diagnostic Telemetry & How To Fix */}
                    {evalResult.diagnosticAdvice ? (
                      <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-md space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-pixel text-[10px] text-red-400">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>COMPILATION &amp; SYNTAX ERROR</span>
                          </div>
                          {evalResult.diagnosticAdvice.line > 0 && (
                            <span className="px-2 py-0.5 rounded-sm bg-black/60 border border-red-500 text-red-400 font-mono text-[9px] font-bold">
                              LINE {evalResult.diagnosticAdvice.line}
                            </span>
                          )}
                        </div>

                        <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap bg-black/60 p-2 rounded-sm border border-red-900/50">
                          {evalResult.compilationError}
                        </pre>

                        {evalResult.diagnosticAdvice.fixSuggestion && (
                          <div className="bg-black/60 p-2.5 rounded-sm border border-amber-500/40 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-pixel text-[9px] text-amber-400 block mb-0.5">
                                💡 HOW TO FIX THIS ERROR:
                              </span>
                              <p className="text-slate-200 font-retro text-xs leading-relaxed">
                                {evalResult.diagnosticAdvice.fixSuggestion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-md text-red-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-pixel text-[10px] text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>SYNTAX / COMPILATION ERROR</span>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap">{evalResult.compilationError}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    
                    {/* Victory Banner if all tests passed */}
                    {evalResult.allPassed && (
                      <div className="p-2.5 rounded-md bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs font-retro">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span className="font-pixel text-[10px] text-emerald-400">
                            SOLVED! +{evalResult.earnedXp} XP EARNED
                          </span>
                        </div>
                        {hasNextProblem ? (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onNextProblem();
                            }}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-emerald-400 text-black font-pixel text-[10px] font-bold hover:bg-emerald-300 transition-colors shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                          >
                            <span>PROCEED TO NEXT LAB</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="font-pixel text-[10px] text-amber-400">
                            🎉 FINAL CURRICULUM PROBLEM CLEARED!
                          </span>
                        )}
                      </div>
                    )}

                    {/* How to Fix Diagnostic Advice for Failed Test Cases */}
                    {!evalResult.allPassed && evalResult.diagnosticAdvice && (
                      <div className="p-3 bg-black/50 border border-amber-500/60 rounded-md space-y-2 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-pixel text-[10px] text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>TELEMETRY DIAGNOSIS: {evalResult.diagnosticAdvice.title}</span>
                          </div>
                        </div>

                        {evalResult.diagnosticAdvice.details && (
                          <p className="text-slate-300 font-retro text-xs leading-relaxed">
                            {evalResult.diagnosticAdvice.details}
                          </p>
                        )}

                        {evalResult.diagnosticAdvice.fixSuggestion && (
                          <div className="bg-black/60 p-2.5 rounded-sm border border-white/10 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-pixel text-[9px] text-amber-400 block mb-0.5">
                                💡 HOW TO FIX YOUR CODE:
                              </span>
                              <p className="text-slate-200 font-retro text-xs leading-relaxed">
                                {evalResult.diagnosticAdvice.fixSuggestion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {evalResult.results.map((tc, idx) => (
                        <button
                          key={tc.id}
                          onClick={() => { soundFx.playClick(); setSelectedTestCaseIdx(idx); }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-sm border text-xs font-retro transition-colors ${
                            selectedTestCaseIdx === idx
                              ? 'bg-black/70 border-cyan-400 text-cyan-300'
                              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tc.passed ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          )}
                          <span>{tc.desc}</span>
                        </button>
                      ))}
                    </div>

                    {evalResult.results[selectedTestCaseIdx] && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-black/45 p-2.5 rounded-md border border-white/10 backdrop-blur-md">
                        <div>
                          <span className="text-[9px] font-pixel text-slate-400 block mb-0.5">INPUT</span>
                          <pre className="bg-black/60 p-1.5 rounded-sm text-slate-300 whitespace-pre-wrap text-[11px] border border-white/5">
                            {evalResult.results[selectedTestCaseIdx].input}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[9px] font-pixel text-slate-400 block mb-0.5">EXPECTED OUTPUT</span>
                          <pre className="bg-black/60 p-1.5 rounded-sm text-emerald-400 whitespace-pre-wrap text-[11px] border border-white/5">
                            {evalResult.results[selectedTestCaseIdx].expectedOutput}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[9px] font-pixel text-slate-400 block mb-0.5">YOUR OUTPUT</span>
                          <pre className={`p-1.5 rounded-sm whitespace-pre-wrap text-[11px] ${
                            evalResult.results[selectedTestCaseIdx].passed
                              ? 'bg-black/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950/40 text-red-300 border border-red-800/50'
                          }`}>
                            {evalResult.results[selectedTestCaseIdx].actualOutput}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-retro">
                  <span className="text-[11px]">Ready to evaluate. Press [SUBMIT] or [TEST].</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
