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
import { PROBLEMS } from '../data/curriculum';

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

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-charcoal-950 select-none">
      
      {/* ================= TOP NAVIGATION BAR: Next Problem Bar (Same CSS Style) ================= */}
      <div className="h-11 px-3 sm:px-6 bg-charcoal-900 border-b border-charcoal-750 flex items-center justify-between gap-3 text-xs font-sans z-20">
        
        {/* Previous Problem Button */}
        <button
          onClick={() => {
            if (hasPrevProblem) {
              soundFx.playClick();
              onPrevProblem();
            }
          }}
          disabled={!hasPrevProblem}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-charcoal-950 border border-charcoal-750 text-slate-300 hover:text-white hover:border-cosmic-cyan disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-cosmic-cyan" />
          <span className="hidden sm:inline">PREV LAB</span>
        </button>

        {/* Center Progress Mission Indicator */}
        <div className="flex items-center gap-2 truncate text-center">
          <button 
            onClick={onBackToMap}
            className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-cosmic-cyan border-r border-charcoal-750 pr-3"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>STAR MAP</span>
          </button>

          <span className="text-[10px] font-sans font-bold text-cosmic-orange">
            MOD {problem.moduleId}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            LAB #{problemIndex + 1} OF {totalProblems}:
          </span>
          <span className="font-sans font-bold text-[11px] text-slate-100 truncate max-w-[200px] sm:max-w-[340px]">
            {problem.title}
          </span>

          {isCurrentCleared && (
            <span className="hidden sm:flex items-center gap-1 text-cosmic-emerald text-[9px] font-sans font-bold bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded ml-1">
              <CheckCircle2 className="w-3 h-3" /> CLEARED
            </span>
          )}
        </div>

        {/* Next Problem Button (With Glowing Cosmic Highlight) */}
        <button
          onClick={() => {
            if (hasNextProblem) {
              soundFx.playClick();
              onNextProblem();
            }
          }}
          disabled={!hasNextProblem}
          className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-sans text-xs font-bold shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <span>NEXT LAB</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Split-Pane Workspace Body */}
      <div 
        ref={containerRef}
        className={`relative flex-1 flex flex-col md:flex-row overflow-hidden ${
          isDragging ? 'cursor-col-resize' : ''
        }`}
      >
        {/* Mobile View Toggle */}
        <div className="flex md:hidden items-center justify-between bg-charcoal-900 border-b border-charcoal-750 px-3 py-1.5 text-xs font-sans">
          <div className="flex items-center gap-1 bg-charcoal-950 p-1 rounded-lg border border-charcoal-800 w-full justify-center">
            <button
              onClick={() => setIsMobileTab('spec')}
              className={`flex-1 py-1 rounded text-[10px] font-sans font-bold text-center ${isMobileTab === 'spec' ? 'bg-cosmic-cyan text-charcoal-950 font-bold' : 'text-slate-400'}`}
            >
              PROBLEM
            </button>
            <button
              onClick={() => setIsMobileTab('editor')}
              className={`flex-1 py-1 rounded text-[10px] font-sans font-bold text-center ${isMobileTab === 'editor' ? 'bg-cosmic-orange text-charcoal-950 font-bold' : 'text-slate-400'}`}
            >
              CODE & TEST
            </button>
          </div>
        </div>

        {/* ================= LEFT PANE: Problem Statement Panel ================= */}
        <div 
          style={{ width: `${splitRatio}%` }}
          className={`h-full flex-col border-r border-charcoal-750 bg-charcoal-900/95 overflow-hidden ${
            isMobileTab === 'spec' ? 'flex w-full md:w-auto' : 'hidden md:flex'
          }`}
        >
          {/* Panel Header */}
          <div className="h-10 px-4 bg-charcoal-950 border-b border-charcoal-750 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-pulse" />
              <h2 className="text-xs font-sans font-bold text-slate-100 truncate max-w-[200px] sm:max-w-[260px]">
                {problem.title}
              </h2>
            </div>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cosmic-orange/20 border border-cosmic-orange text-cosmic-orange">
              +{problem.xpReward} XP
            </span>
          </div>

          {/* Tab Switcher: Problem Briefing / Hints */}
          <div className="flex items-center border-b border-charcoal-750 bg-charcoal-900 text-xs font-sans">
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('problem'); }}
              className={`flex-1 py-2 text-center transition-colors ${
                activeTab === 'problem'
                  ? 'border-b-2 border-cosmic-cyan text-cosmic-cyan font-bold bg-charcoal-850'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BRIEFING & SPECS
            </button>
            <button
              onClick={() => { soundFx.playClick(); setActiveTab('hints'); }}
              className={`flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'border-b-2 border-cosmic-amber text-cosmic-amber font-bold bg-charcoal-850'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HINTS ({unlockedHintLevels.length}/{problem.hints.length})</span>
            </button>
          </div>

          {/* Panel Body: Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 font-sans space-y-4">
            {activeTab === 'problem' ? (
              <>
                <div className="flex items-center justify-between bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800">
                  <span className="text-slate-400">SYLLABUS REF:</span>
                  <span className="text-cosmic-cyan font-semibold">{problem.syllabusRef}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-[10px] text-cosmic-cyan tracking-wider">
                    MISSION OBJECTIVE
                  </h3>
                  <p className="leading-relaxed whitespace-pre-wrap text-slate-200">
                    {problem.description}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
                    <span className="font-sans font-bold text-[9px] text-cosmic-amber block mb-1">
                      INPUT FORMAT:
                    </span>
                    <p className="text-slate-300">{problem.inputFormat}</p>
                  </div>

                  <div className="bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
                    <span className="font-sans font-bold text-[9px] text-cosmic-amber block mb-1">
                      OUTPUT FORMAT:
                    </span>
                    <p className="text-slate-300 whitespace-pre-wrap">{problem.outputFormat}</p>
                  </div>

                  <div className="bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
                    <span className="font-sans font-bold text-[9px] text-cosmic-orange block mb-1">
                      CONSTRAINTS:
                    </span>
                    <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">{problem.constraints}</p>
                  </div>
                </div>

                {/* Sample I/O */}
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-[10px] text-cosmic-cyan tracking-wider">
                    SAMPLE TELEMETRY
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800">
                      <span className="text-[9px] text-slate-400 block mb-1 font-sans font-bold">SAMPLE INPUT</span>
                      <pre className="font-mono text-cosmic-cyan text-[11px] whitespace-pre-wrap">{problem.sampleInput}</pre>
                    </div>
                    <div className="bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800">
                      <span className="text-[9px] text-slate-400 block mb-1 font-sans font-bold">SAMPLE OUTPUT</span>
                      <pre className="font-mono text-cosmic-emerald text-[11px] whitespace-pre-wrap">{problem.sampleOutput}</pre>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Tiered Hint System */
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-charcoal-950 p-3 rounded-xl border border-charcoal-800">
                  <img 
                    src="/sprites/astronaut_hint.png" 
                    alt="Hint" 
                    style={{ width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px' }}
                    className="object-contain pixelated" 
                  />
                  <div>
                    <h4 className="font-sans font-bold text-[10px] text-cosmic-amber">TIERED HINT TRANSMISSION</h4>
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
                      className={`p-3 rounded-xl border transition-all ${
                        isUnlocked ? 'bg-charcoal-850 border-cosmic-amber/50' : 'bg-charcoal-950 border-charcoal-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans font-bold text-[10px] text-slate-300">
                          HINT LEVEL #{hint.level}
                        </span>
                        {!isUnlocked ? (
                          <button
                            onClick={() => handleUnlockHint(hint)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cosmic-orange/20 border border-cosmic-orange text-cosmic-orange text-[9px] font-sans font-bold hover:bg-cosmic-orange hover:text-charcoal-950 transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>UNLOCK (-{hint.cost} XP)</span>
                          </button>
                        ) : (
                          <span className="text-[9px] font-sans font-bold text-cosmic-emerald">
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      {isUnlocked ? (
                        <p className="text-slate-200 leading-relaxed font-sans text-xs">
                          {hint.text}
                        </p>
                      ) : (
                        <div className="h-8 bg-charcoal-900/60 rounded flex items-center justify-center text-slate-500 text-[10px] italic">
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
          className="hidden md:flex relative w-2 h-full bg-charcoal-900 hover:bg-cosmic-cyan/50 active:bg-cosmic-cyan items-center justify-center cursor-col-resize transition-colors z-20 group"
          title="Drag to resize (φ snap)"
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-0.5 h-3 rounded bg-slate-600 group-hover:bg-charcoal-950" />
            <div className="w-0.5 h-3 rounded bg-slate-600 group-hover:bg-charcoal-950" />
          </div>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-charcoal-950 border border-cosmic-cyan px-2 py-0.5 rounded text-[8px] font-sans font-bold text-cosmic-cyan whitespace-nowrap shadow-xl z-30">
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
          className={`h-full flex-col bg-charcoal-950 overflow-hidden ${
            isMobileTab === 'editor' ? 'flex w-full md:w-auto' : 'hidden md:flex'
          }`}
        >
          {/* Editor Action Bar */}
          <div className="h-10 px-3 sm:px-4 bg-charcoal-950 border-b border-charcoal-750 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cosmic-orange" />
              <span className="text-xs font-mono text-slate-300">
                main.c (C17 / GCC)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('hints'); setIsMobileTab('spec'); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-750 text-xs font-sans text-cosmic-amber transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">HINT</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  if (confirm('Reset to starter C code?')) setCode(problem.starterCode);
                }}
                className="p-1 rounded bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-750 text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset Code Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                disabled={isEvaluating}
                onClick={() => handleExecute(false)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-xs font-sans text-slate-200 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-cosmic-cyan" />
                <span>TEST</span>
              </button>

              <button
                disabled={isEvaluating}
                onClick={() => handleExecute(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-sans font-bold shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'RUNNING...' : 'SUBMIT'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden bg-charcoal-950 min-h-[200px]">
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
          <div className="h-56 border-t border-charcoal-750 bg-charcoal-900/98 flex flex-col">
            {/* Console Header */}
            <div className="h-9 px-4 bg-charcoal-950 border-b border-charcoal-750 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cosmic-cyan" />
                <span className="text-[11px] font-sans font-bold text-slate-200">
                  EVALUATION CONSOLE
                </span>
                {evalResult && (
                  <span className={`text-[9px] font-sans font-bold px-1.5 py-0.2 rounded ml-2 ${
                    evalResult.allPassed 
                      ? 'bg-cosmic-emerald/20 text-cosmic-emerald border border-cosmic-emerald/50'
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
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-sans text-xs font-bold shadow-sm transition-all animate-bounce"
                  >
                    <span>NEXT LAB &gt;&gt;</span>
                  </button>
                )}

                <img 
                  src={astronautReaction} 
                  alt="Reaction" 
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
                      <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] text-red-400">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span>COMPILATION &amp; SYNTAX ERROR</span>
                          </div>
                          {evalResult.diagnosticAdvice.line > 0 && (
                            <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-red-500 text-red-400 font-mono text-[9px] font-bold">
                              LINE {evalResult.diagnosticAdvice.line}
                            </span>
                          )}
                        </div>

                        <pre className="text-xs text-red-300 font-mono whitespace-pre-wrap bg-charcoal-950/80 p-2 rounded border border-red-900/50">
                          {evalResult.compilationError}
                        </pre>

                        {evalResult.diagnosticAdvice.fixSuggestion && (
                          <div className="bg-charcoal-900/90 p-2.5 rounded-lg border border-cosmic-orange/50 flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-cosmic-amber flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <span className="font-sans font-bold text-[9px] text-cosmic-amber block mb-0.5">
                                💡 HOW TO FIX THIS ERROR:
                              </span>
                              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                                {evalResult.diagnosticAdvice.fixSuggestion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] text-red-400">
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
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-cosmic-emerald/60 flex items-center justify-between text-xs font-sans">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cosmic-emerald animate-pulse" />
                          <span className="font-sans font-bold text-[10px] text-cosmic-emerald">
                            SOLVED! +{evalResult.earnedXp} XP EARNED
                          </span>
                        </div>
                        {hasNextProblem ? (
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onNextProblem();
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black font-sans text-xs font-bold hover:bg-emerald-300 transition-colors shadow-sm"
                          >
                            <span>PROCEED TO NEXT LAB</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="font-sans text-xs font-bold text-amber-400">
                            🎉 FINAL CURRICULUM PROBLEM CLEARED!
                          </span>
                        )}
                      </div>
                    )}

                    {/* How to Fix Diagnostic Advice for Failed Test Cases */}
                    {!evalResult.allPassed && evalResult.diagnosticAdvice && (
                      <div className="p-3 bg-black/60 border border-amber-500/30 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] text-cosmic-orange">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>TELEMETRY DIAGNOSIS: {evalResult.diagnosticAdvice.title}</span>
                          </div>
                        </div>

                        {evalResult.diagnosticAdvice.details && (
                          <p className="text-slate-300 font-sans text-xs leading-relaxed">
                            {evalResult.diagnosticAdvice.details}
                          </p>
                        )}

                        {evalResult.diagnosticAdvice.fixSuggestion && (
                          <div className="bg-charcoal-900/90 p-2.5 rounded-lg border border-charcoal-750 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-cosmic-amber flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-sans font-bold text-[9px] text-cosmic-amber block mb-0.5">
                                💡 HOW TO FIX YOUR CODE:
                              </span>
                              <p className="text-slate-200 font-sans text-xs leading-relaxed">
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
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-sans transition-colors ${
                            selectedTestCaseIdx === idx
                              ? 'bg-charcoal-800 border-cosmic-cyan text-cosmic-cyan'
                              : 'bg-charcoal-950 border-charcoal-800 text-slate-400'
                          }`}
                        >
                          {tc.passed ? (
                            <CheckCircle className="w-3 h-3 text-cosmic-emerald" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          )}
                          <span>{tc.desc}</span>
                        </button>
                      ))}
                    </div>

                    {evalResult.results[selectedTestCaseIdx] && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800">
                        <div>
                          <span className="text-[9px] font-sans font-bold text-slate-400 block mb-0.5">INPUT</span>
                          <pre className="bg-charcoal-900 p-1.5 rounded text-slate-300 whitespace-pre-wrap text-[11px]">
                            {evalResult.results[selectedTestCaseIdx].input}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[9px] font-sans font-bold text-slate-400 block mb-0.5">EXPECTED OUTPUT</span>
                          <pre className="bg-charcoal-900 p-1.5 rounded text-cosmic-emerald whitespace-pre-wrap text-[11px]">
                            {evalResult.results[selectedTestCaseIdx].expectedOutput}
                          </pre>
                        </div>

                        <div>
                          <span className="text-[9px] font-sans font-bold text-slate-400 block mb-0.5">YOUR OUTPUT</span>
                          <pre className={`p-1.5 rounded whitespace-pre-wrap text-[11px] ${
                            evalResult.results[selectedTestCaseIdx].passed
                              ? 'bg-charcoal-900 text-cosmic-emerald'
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
                <div className="h-full flex flex-col items-center justify-center text-slate-500 font-sans">
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
