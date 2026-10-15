import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Terminal, 
  Code,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { MODULES, PROBLEMS } from '../data/curriculum';
import { soundFx } from '../services/soundFx';
import { cEngine } from '../services/cEngine';

export default function AdminDashboard({ userProgress, onUpdateProblemTestCases }) {
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [selectedProblemId, setSelectedProblemId] = useState(PROBLEMS[0].id);

  // Custom Test Case Form
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');
  const [newTcHidden, setNewTcHidden] = useState(true);
  const [newTcDesc, setNewTcDesc] = useState('');

  // Batch Test Suite Runner State
  const [batchTesting, setBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  const activeProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];

  const handleAddTestCase = (e) => {
    e.preventDefault();
    if (!newTcInput.trim() || !newTcExpected.trim()) {
      alert('Please provide both Input and Expected Output.');
      return;
    }

    soundFx.playPass();
    const newCase = {
      id: `tc_${Date.now()}`,
      input: newTcInput,
      expectedOutput: newTcExpected,
      hidden: newTcHidden,
      desc: newTcDesc.trim() || `Custom Test Case #${activeProblem.testCases.length + 1}`
    };

    activeProblem.testCases.push(newCase);
    setNewTcInput('');
    setNewTcExpected('');
    setNewTcDesc('');
    alert(`Test Case added to "${activeProblem.title}" successfully.`);
  };

  const handleRunBatchVerification = async () => {
    soundFx.playCompile();
    setBatchTesting(true);
    setBatchResults([]);

    const results = [];
    for (let prob of PROBLEMS) {
      try {
        const evalRes = await cEngine.evaluateSubmission(prob, prob.starterCode);
        results.push({
          id: prob.id,
          title: prob.title,
          moduleId: prob.moduleId,
          allPassed: evalRes.allPassed,
          timeMs: evalRes.totalExecutionTimeMs
        });
      } catch (err) {
        results.push({
          id: prob.id,
          title: prob.title,
          moduleId: prob.moduleId,
          allPassed: false,
          error: err.message
        });
      }
    }

    setBatchTesting(false);
    setBatchResults(results);
    soundFx.playPass();
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] overflow-y-auto bg-charcoal-950 p-4 sm:p-6 lg:p-8 font-retro select-none text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cosmic-purple" />
              <h1 className="text-base sm:text-lg font-pixel text-slate-100">
                FACULTY CURRICULUM & VERIFICATION DECK
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage syllabus problems, configure test cases, and execute automated verification.
            </p>
          </div>

          <button
            onClick={handleRunBatchVerification}
            disabled={batchTesting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cosmic-purple hover:bg-purple-400 text-charcoal-950 font-pixel text-xs font-bold transition-all shadow-glow-purple disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{batchTesting ? 'TESTING ALL 21...' : 'RUN ALL 21 LAB TESTS'}</span>
          </button>
        </div>

        {/* Batch Test Results Banner (if executed) */}
        {batchResults && (
          <div className="bg-charcoal-900 border border-charcoal-750 p-4 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-cosmic-cyan">
                AUTOMATED VERIFICATION SUMMARY
              </span>
              <span className="text-xs text-cosmic-emerald font-pixel">
                {batchResults.filter(r => r.allPassed).length} / {batchResults.length} PASSED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {batchResults.map(r => (
                <div key={r.id} className="p-2 bg-charcoal-950 rounded-lg border border-charcoal-800 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[180px]">{r.title}</span>
                  {r.allPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-cosmic-emerald shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedModuleId(m.id);
                const firstInMod = PROBLEMS.find(p => p.moduleId === m.id);
                if (firstInMod) setSelectedProblemId(firstInMod.id);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-retro transition-colors whitespace-nowrap ${
                selectedModuleId === m.id
                  ? 'bg-charcoal-850 border-cosmic-cyan text-cosmic-cyan font-bold shadow-glow-cyan'
                  : 'bg-charcoal-900 border-charcoal-800 text-slate-400 hover:text-white'
              }`}
            >
              M{m.id}: {m.title}
            </button>
          ))}
        </div>

        {/* Two-Column Problem & Test Case Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Problems List in Selected Module (5 cols) */}
          <div className="lg:col-span-5 bg-charcoal-900 border border-charcoal-750 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-pixel text-slate-400 block mb-2">
              PROBLEMS IN MODULE {selectedModuleId}
            </span>

            <div className="space-y-2">
              {PROBLEMS.filter(p => p.moduleId === selectedModuleId).map(prob => (
                <div
                  key={prob.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedProblemId(prob.id);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedProblemId === prob.id
                      ? 'bg-charcoal-850 border-cosmic-orange text-white box-glow-orange'
                      : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-pixel text-[10px] text-cosmic-amber">{prob.id}</span>
                    <span className="text-[10px] text-slate-500">{prob.difficulty}</span>
                  </div>
                  <h3 className="font-pixel text-xs text-slate-200 line-clamp-1">{prob.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span>{prob.testCases.length} Test Cases</span>
                    <span>+{prob.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Active Problem Test Case Manager (7 cols) */}
          <div className="lg:col-span-7 bg-charcoal-900 border border-charcoal-750 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-charcoal-800 pb-3 mb-4">
                <span className="text-[10px] font-pixel text-cosmic-cyan block">SELECTED PROBLEM</span>
                <h2 className="text-sm font-pixel text-slate-100 mt-1">{activeProblem.title}</h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{activeProblem.description}</p>
              </div>

              {/* Registered Test Cases List */}
              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-pixel text-slate-400 block">
                  ACTIVE TEST CASES ({activeProblem.testCases.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeProblem.testCases.map((tc, idx) => (
                    <div key={tc.id || idx} className="bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800 text-xs flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{tc.desc}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          In: {tc.input.replace(/\n/g, ' ')} | Out: {tc.expectedOutput.replace(/\n/g, ' ')}
                        </span>
                      </div>
                      <span className={`text-[9px] font-pixel px-1.5 py-0.5 rounded ${
                        tc.hidden ? 'bg-charcoal-850 text-slate-400' : 'bg-cosmic-cyan/20 text-cosmic-cyan'
                      }`}>
                        {tc.hidden ? 'HIDDEN' : 'SAMPLE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inject New Hidden Test Case */}
            <form onSubmit={handleAddTestCase} className="border-t border-charcoal-800 pt-3 space-y-2">
              <span className="text-[10px] font-pixel text-cosmic-amber block">
                ADD TEST CASE TO THIS PROBLEM
              </span>

              <input
                type="text"
                placeholder="Description (e.g. Edge Case Zero)"
                value={newTcDesc}
                onChange={(e) => setNewTcDesc(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Stdin input"
                  value={newTcInput}
                  onChange={(e) => setNewTcInput(e.target.value)}
                  className="bg-charcoal-950 border border-charcoal-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
                <input
                  type="text"
                  placeholder="Expected stdout"
                  value={newTcExpected}
                  onChange={(e) => setNewTcExpected(e.target.value)}
                  className="bg-charcoal-950 border border-charcoal-800 rounded-lg p-2 text-xs text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTcHidden}
                    onChange={(e) => setNewTcHidden(e.target.checked)}
                    className="rounded bg-charcoal-950 border-charcoal-700 text-cosmic-cyan"
                  />
                  <span>Mark as Hidden Test</span>
                </label>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cosmic-purple text-charcoal-950 font-pixel text-[10px] font-bold hover:bg-purple-400 transition-colors shadow-glow-purple"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>INJECT TEST CASE</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
