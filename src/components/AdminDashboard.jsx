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
  Trash2,
  BookPlus,
  Sparkles,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { MODULES, PROBLEMS, getCustomProblems } from '../data/curriculum';
import { soundFx } from '../services/soundFx';
import { cEngine } from '../services/cEngine';
import { createProblemInDB, deleteProblemFromDB, addTestCaseToDB } from '../services/api';

export default function AdminDashboard({ 
  userProgress, 
  onUpdateProblemTestCases,
  onAddProblem,
  onDeleteProblem,
  curriculumVersion 
}) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'insert'
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [selectedProblemId, setSelectedProblemId] = useState(PROBLEMS[0]?.id || 'p1_1');

  // Custom Test Case Form (for existing problems)
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcExpected, setNewTcExpected] = useState('');
  const [newTcHidden, setNewTcHidden] = useState(true);
  const [newTcDesc, setNewTcDesc] = useState('');

  // Batch Test Suite Runner State
  const [batchTesting, setBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  // ================= NEW QUESTION INSERTER FORM STATE =================
  const [insertModuleId, setInsertModuleId] = useState(1);
  const [insertTitle, setInsertTitle] = useState('');
  const [insertProblemId, setInsertProblemId] = useState('');
  const [insertDifficulty, setInsertDifficulty] = useState('Cadet');
  const [insertXp, setInsertXp] = useState(120);
  const [insertDesc, setInsertDesc] = useState('');
  const [insertInputFormat, setInsertInputFormat] = useState('Standard console input.');
  const [insertOutputFormat, setInsertOutputFormat] = useState('Formatted console output.');
  const [insertConstraints, setInsertConstraints] = useState('1 <= N <= 1000');
  const [insertStarterCode, setInsertStarterCode] = useState(`#include <stdio.h>

int main() {
    // Write your C solution here
    
    return 0;
}`);
  const [insertSolutionCode, setInsertSolutionCode] = useState(`#include <stdio.h>

int main() {
    // Reference C solution
    
    return 0;
}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [insertTestCases, setInsertTestCases] = useState([
    { id: 'tc1', input: '5', expectedOutput: '25', desc: 'Sample Test Case', hidden: false },
    { id: 'tc2', input: '10', expectedOutput: '100', desc: 'Hidden Test Case', hidden: true }
  ]);
  const [insertHint1, setInsertHint1] = useState('');
  const [insertHint2, setInsertHint2] = useState('');
  const [successBanner, setSuccessBanner] = useState(null);

  const activeProblem = PROBLEMS.find(p => p.id === selectedProblemId) || PROBLEMS[0];
  const customProblemIds = getCustomProblems().map(p => p.id);

  // Auto-generate suggested Problem ID when module changes
  const generateSuggestedProblemId = (modId) => {
    const modProbs = PROBLEMS.filter(p => p.moduleId === modId);
    return `p${modId}_q${modProbs.length + 1}`;
  };

  const handleSelectInsertModule = (modId) => {
    setInsertModuleId(modId);
    if (!insertProblemId || insertProblemId.startsWith('p')) {
      setInsertProblemId(generateSuggestedProblemId(modId));
    }
  };

  // Add a test case row to the insert question form
  const handleAddInsertTestCaseRow = () => {
    soundFx.playClick();
    const newId = `tc_${Date.now()}_${insertTestCases.length + 1}`;
    setInsertTestCases([
      ...insertTestCases,
      { id: newId, input: '', expectedOutput: '', desc: `Test Case #${insertTestCases.length + 1}`, hidden: true }
    ]);
  };

  const handleRemoveInsertTestCaseRow = (idx) => {
    soundFx.playClick();
    if (insertTestCases.length <= 1) {
      alert('A question must have at least one test case.');
      return;
    }
    setInsertTestCases(insertTestCases.filter((_, i) => i !== idx));
  };

  const handleUpdateInsertTestCase = (idx, field, val) => {
    const updated = [...insertTestCases];
    updated[idx][field] = val;
    setInsertTestCases(updated);
  };

  // Submit and inject the new question into the selected module and MongoDB Atlas
  const handleInsertQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!insertTitle.trim()) {
      alert('Please enter a Question Title.');
      return;
    }
    if (!insertDesc.trim()) {
      alert('Please enter a Problem Description.');
      return;
    }

    // Verify at least one test case with non-empty input/output
    const validTestCases = insertTestCases.filter(tc => tc.expectedOutput.trim().length > 0);
    if (validTestCases.length === 0) {
      alert('Please provide at least one valid test case with Expected Output.');
      return;
    }

    const targetMod = MODULES.find(m => m.id === insertModuleId) || MODULES[0];
    const finalProblemId = (insertProblemId.trim() || generateSuggestedProblemId(insertModuleId)).toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Check if ID already exists
    if (PROBLEMS.some(p => p.id === finalProblemId)) {
      alert(`Problem ID "${finalProblemId}" already exists. Please choose a unique ID.`);
      return;
    }

    const hints = [];
    if (insertHint1.trim()) {
      hints.push({ level: 1, cost: 15, text: insertHint1.trim() });
    }
    if (insertHint2.trim()) {
      hints.push({ level: 2, cost: 30, text: insertHint2.trim() });
    }

    const newQuestion = {
      id: finalProblemId,
      moduleId: targetMod.id,
      title: insertTitle.trim(),
      syllabusRef: `Module ${targetMod.id} - ${targetMod.title}`,
      difficulty: insertDifficulty,
      xpReward: Number(insertXp) || 120,
      description: insertDesc.trim(),
      inputFormat: insertInputFormat.trim(),
      outputFormat: insertOutputFormat.trim(),
      constraints: insertConstraints.trim(),
      sampleInput: validTestCases[0]?.input || '',
      sampleOutput: validTestCases[0]?.expectedOutput || '',
      hints,
      starterCode: insertStarterCode.trim(),
      solutionCode: insertSolutionCode.trim(),
      testCases: validTestCases.map((tc, idx) => ({
        id: tc.id || `tc_${idx + 1}`,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        hidden: tc.hidden,
        desc: tc.desc || `Test Case #${idx + 1}`
      })),
      isCustom: true
    };

    setIsSubmitting(true);

    // 1. Save directly into MongoDB Atlas
    try {
      const dbRes = await createProblemInDB(newQuestion);
      if (dbRes.success) {
        console.log('[Admin] Stored to MongoDB Atlas:', dbRes.message);
      }
    } catch (err) {
      console.warn('[Admin] Failed to store to MongoDB, keeping in memory/local:', err);
    }

    setIsSubmitting(false);

    // 2. Update platform state
    onAddProblem?.(newQuestion);
    soundFx.playPass();

    setSuccessBanner({
      title: newQuestion.title,
      id: newQuestion.id,
      moduleName: targetMod.title,
      sectorName: targetMod.sectorName
    });

    // Reset form
    setInsertTitle('');
    setInsertProblemId(generateSuggestedProblemId(insertModuleId));
    setInsertDesc('');
    setInsertHint1('');
    setInsertHint2('');
    setInsertTestCases([
      { id: 'tc1', input: '', expectedOutput: '', desc: 'Sample Test Case', hidden: false }
    ]);
  };

  // Add Test Case to existing selected problem and MongoDB Atlas
  const handleAddTestCase = async (e) => {
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

    // Save test case to MongoDB Atlas
    try {
      await addTestCaseToDB(activeProblem.id, newCase);
    } catch (err) {
      console.warn('[Admin] Failed to persist test case to MongoDB:', err);
    }

    activeProblem.testCases.push(newCase);
    setNewTcInput('');
    setNewTcExpected('');
    setNewTcDesc('');
    alert(`Test Case added to "${activeProblem.title}" and saved in MongoDB Atlas!`);
  };

  // Batch Test Verification
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
    <div className="relative w-full min-h-[calc(100vh-4.25rem)] overflow-y-auto bg-black/40 backdrop-blur-md p-4 sm:p-6 lg:p-8 font-retro select-none text-slate-200 border-t border-white/10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <h1 className="text-base sm:text-lg font-pixel text-slate-100">
                FACULTY CURRICULUM &amp; LAB DECK
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage syllabus problems, insert new questions into modules, and configure test cases.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab(activeTab === 'browse' ? 'insert' : 'browse');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-pixel text-xs font-bold transition-all ${
                activeTab === 'insert'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
              }`}
            >
              <BookPlus className="w-4 h-4" />
              <span>{activeTab === 'insert' ? 'VIEW QUESTION LIST' : '+ INSERT QUESTION'}</span>
            </button>

            <button
              onClick={handleRunBatchVerification}
              disabled={batchTesting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-purple-500 hover:bg-purple-400 text-black font-pixel text-xs font-bold transition-all shadow-[0_0_16px_rgba(168,85,247,0.4)] disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{batchTesting ? `TESTING ${PROBLEMS.length}...` : `RUN ALL ${PROBLEMS.length} LAB TESTS`}</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('browse'); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-pixel transition-all ${
              activeTab === 'browse'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SYLLABUS &amp; TEST CASES ({PROBLEMS.length} PROBLEMS)</span>
          </button>

          <button
            onClick={() => { 
              soundFx.playClick(); 
              setActiveTab('insert'); 
              if (!insertProblemId) setInsertProblemId(generateSuggestedProblemId(insertModuleId));
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-pixel transition-all ${
              activeTab === 'insert'
                ? 'bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white bg-black/40 border border-white/5'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>INSERT NEW QUESTION INTO MODULE</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: INSERT NEW QUESTION INTO MODULE */}
        {/* ============================================================== */}
        {activeTab === 'insert' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Success Notification Alert */}
            {successBanner && (
              <div className="bg-emerald-950/70 border border-emerald-400/80 p-3.5 rounded-md flex items-center justify-between text-xs text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-pixel text-[11px] text-emerald-300 block">
                      QUESTION INJECTED SUCCESSFULLY INTO {successBanner.sectorName.toUpperCase()}!
                    </span>
                    <span className="text-[11px] text-slate-300">
                      "{successBanner.title}" (ID: {successBanner.id}) is now live on the Star Map and in the coding workspace.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      const mod = MODULES.find(m => m.title === successBanner.moduleName) || MODULES[0];
                      setSelectedModuleId(mod.id);
                      setSelectedProblemId(successBanner.id);
                      setActiveTab('browse');
                      setSuccessBanner(null);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-emerald-500 text-slate-950 font-pixel text-[10px] font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <span>VIEW QUESTION</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setSuccessBanner(null)}
                    className="p-1 rounded-sm text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Inserter Form Card */}
            <form onSubmit={handleInsertQuestionSubmit} className="bg-black/50 border border-white/15 rounded-lg p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
              
              {/* Step 1: Select Target Module */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-pixel text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>STEP 1: SELECT TARGET MODULE / PLANETARY SECTOR</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    The question will appear in this module's hyperlane and lab list.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                  {MODULES.map(m => {
                    const isSelected = insertModuleId === m.id;
                    const countInMod = PROBLEMS.filter(p => p.moduleId === m.id).length;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSelectInsertModule(m.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-black/80 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-[1.02]'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-pixel text-[10px] text-amber-400">{m.code}</span>
                          <span className="text-[9px] font-mono text-slate-500">{countInMod} Labs</span>
                        </div>
                        <span className="font-pixel text-[11px] text-slate-100 truncate">{m.sectorName}</span>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5">{m.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Basic Problem Info */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <label className="text-xs font-pixel text-cyan-400 block">
                  STEP 2: LAB METADATA &amp; PROBLEM STATEMENT
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">QUESTION TITLE *</label>
                    <input
                      type="text"
                      placeholder="e.g. Check Armstrong Number or Matrix Inversion"
                      value={insertTitle}
                      onChange={(e) => setInsertTitle(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-white/20 rounded-md p-2.5 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">QUESTION ID (UNIQUE)</label>
                    <input
                      type="text"
                      placeholder={`p${insertModuleId}_custom_1`}
                      value={insertProblemId}
                      onChange={(e) => setInsertProblemId(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-md p-2.5 text-xs text-amber-400 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">DIFFICULTY &amp; REWARD</label>
                    <div className="flex gap-2">
                      <select
                        value={insertDifficulty}
                        onChange={(e) => {
                          setInsertDifficulty(e.target.value);
                          const rewards = { Cadet: 100, Explorer: 150, Commander: 200, Veteran: 250 };
                          setInsertXp(rewards[e.target.value] || 120);
                        }}
                        className="w-1/2 bg-black/60 border border-white/20 rounded-md p-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="Cadet">Cadet (Easy)</option>
                        <option value="Explorer">Explorer (Med)</option>
                        <option value="Commander">Commander (Hard)</option>
                        <option value="Veteran">Veteran (Expert)</option>
                      </select>
                      <input
                        type="number"
                        min="50"
                        max="500"
                        step="10"
                        value={insertXp}
                        onChange={(e) => setInsertXp(Number(e.target.value))}
                        className="w-1/2 bg-black/60 border border-white/20 rounded-md p-2 text-xs text-amber-400 font-mono text-center focus:border-cyan-400 focus:outline-none"
                        title="XP Reward"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Statement Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-pixel text-slate-300">PROBLEM STATEMENT / DESCRIPTION *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the task clearly. For example: Write a C program that reads an integer N and determines whether it is an Armstrong number..."
                    value={insertDesc}
                    onChange={(e) => setInsertDesc(e.target.value)}
                    required
                    className="w-full bg-black/60 border border-white/20 rounded-md p-2.5 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* I/O Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">INPUT FORMAT</label>
                    <input
                      type="text"
                      placeholder="e.g. Single integer N (1 <= N <= 10^5)"
                      value={insertInputFormat}
                      onChange={(e) => setInsertInputFormat(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-md p-2 text-xs text-slate-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">OUTPUT FORMAT</label>
                    <input
                      type="text"
                      placeholder="e.g. Print 'YES' or 'NO'"
                      value={insertOutputFormat}
                      onChange={(e) => setInsertOutputFormat(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-md p-2 text-xs text-slate-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-pixel text-slate-300">CONSTRAINTS</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 <= N <= 10000"
                      value={insertConstraints}
                      onChange={(e) => setInsertConstraints(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-md p-2 text-xs text-slate-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Step 3: Starter Code & Reference Solution */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-pixel text-purple-400 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>STEP 3A: C STARTER CODE TEMPLATE</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Pre-loaded for student.</span>
                    </div>
                    <textarea
                      rows={6}
                      value={insertStarterCode}
                      onChange={(e) => setInsertStarterCode(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-md p-3 text-xs text-emerald-400 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-pixel text-cyan-400 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" />
                        <span>STEP 3B: REFERENCE C SOLUTION (STORED IN DB)</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Official solution in MongoDB.</span>
                    </div>
                    <textarea
                      rows={6}
                      value={insertSolutionCode}
                      onChange={(e) => setInsertSolutionCode(e.target.value)}
                      placeholder="#include <stdio.h>&#10;&#10;int main() { ... }"
                      className="w-full bg-black/70 border border-white/20 rounded-md p-3 text-xs text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Test Cases Suite */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-pixel text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>STEP 4: AUTOMATED TEST CASES SUITE ({insertTestCases.length})</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Submissions are verified by executing the C program against these standard input/output pairs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddInsertTestCaseRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 text-[10px] font-pixel transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>ADD TEST CASE</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {insertTestCases.map((tc, idx) => (
                    <div key={tc.id || idx} className="bg-black/60 p-3 rounded-md border border-white/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-cyan-400">
                          TEST CASE #{idx + 1} {tc.hidden ? '(HIDDEN)' : '(SAMPLE / VISIBLE)'}
                        </span>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.hidden}
                              onChange={(e) => handleUpdateInsertTestCase(idx, 'hidden', e.target.checked)}
                              className="rounded-sm bg-black border-white/30 text-cyan-400"
                            />
                            <span className="text-[10px]">Hidden from student</span>
                          </label>

                          {insertTestCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInsertTestCaseRow(idx)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete Test Case"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Description (e.g. Standard Input)"
                            value={tc.desc}
                            onChange={(e) => handleUpdateInsertTestCase(idx, 'desc', e.target.value)}
                            className="w-full bg-black/80 border border-white/10 rounded-sm p-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <textarea
                            rows={2}
                            placeholder="Stdin input (leave empty if none)"
                            value={tc.input}
                            onChange={(e) => handleUpdateInsertTestCase(idx, 'input', e.target.value)}
                            className="w-full bg-black/80 border border-white/10 rounded-sm p-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <textarea
                            rows={2}
                            placeholder="Expected stdout output *"
                            value={tc.expectedOutput}
                            onChange={(e) => handleUpdateInsertTestCase(idx, 'expectedOutput', e.target.value)}
                            required
                            className="w-full bg-black/80 border border-white/10 rounded-sm p-1.5 text-xs text-emerald-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 5: Optional Hints */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <label className="text-xs font-pixel text-slate-400 block">
                  STEP 5: OPTIONAL STUDENT HINTS (UNLOCKABLE WITH XP)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-pixel text-amber-300">LEVEL 1 HINT (-15 XP)</span>
                    <input
                      type="text"
                      placeholder="e.g. Remember to modulo by 10 to extract digits: n % 10"
                      value={insertHint1}
                      onChange={(e) => setInsertHint1(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-md p-2 text-xs text-slate-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-pixel text-amber-300">LEVEL 2 HINT (-30 XP)</span>
                    <input
                      type="text"
                      placeholder="e.g. Use a while(temp > 0) loop to iterate through all digits."
                      value={insertHint2}
                      onChange={(e) => setInsertHint2(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-md p-2 text-xs text-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-white/10 pt-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Target: <strong className="text-cyan-300">Module {insertModuleId} ({MODULES.find(m => m.id === insertModuleId)?.sectorName})</strong>
                </span>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-pixel text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  <BookPlus className="w-4 h-4" />
                  <span>INJECT QUESTION INTO MODULE {insertModuleId}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BROWSE SYLLABUS & TEST CASES */}
        {/* ============================================================== */}
        {activeTab === 'browse' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Batch Test Results Banner (if executed) */}
            {batchResults && (
              <div className="bg-black/45 border border-white/15 p-4 rounded-md shadow-xl backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-cyan-400">
                    AUTOMATED VERIFICATION SUMMARY
                  </span>
                  <span className="text-xs text-emerald-400 font-pixel">
                    {batchResults.filter(r => r.allPassed).length} / {batchResults.length} PASSED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {batchResults.map(r => (
                    <div key={r.id} className="p-2 bg-black/60 rounded-sm border border-white/10 flex items-center justify-between text-xs">
                      <span className="truncate max-w-[180px]">{r.title}</span>
                      {r.allPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module Filter Tabs with Inserter Shortcut */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {MODULES.map(m => {
                  const countInMod = PROBLEMS.filter(p => p.moduleId === m.id).length;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedModuleId(m.id);
                        const firstInMod = PROBLEMS.find(p => p.moduleId === m.id);
                        if (firstInMod) setSelectedProblemId(firstInMod.id);
                      }}
                      className={`px-3 py-1.5 rounded-md border text-xs font-retro transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        selectedModuleId === m.id
                          ? 'bg-black/60 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>M{m.id}: {m.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-white/10 text-slate-300 font-mono">
                        {countInMod}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setInsertModuleId(selectedModuleId);
                  setInsertProblemId(generateSuggestedProblemId(selectedModuleId));
                  setActiveTab('insert');
                }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 text-[10px] font-pixel transition-colors"
                title={`Insert new question directly into Module ${selectedModuleId}`}
              >
                <Plus className="w-3 h-3" />
                <span>+ ADD TO M{selectedModuleId}</span>
              </button>
            </div>

            {/* Two-Column Problem & Test Case Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Problems List in Selected Module (5 cols) */}
              <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-lg p-4 space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-pixel text-slate-400 block">
                    PROBLEMS IN MODULE {selectedModuleId} ({PROBLEMS.filter(p => p.moduleId === selectedModuleId).length})
                  </span>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setInsertModuleId(selectedModuleId);
                      setInsertProblemId(generateSuggestedProblemId(selectedModuleId));
                      setActiveTab('insert');
                    }}
                    className="text-[9px] font-pixel text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" /> ADD QUESTION
                  </button>
                </div>

                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                  {PROBLEMS.filter(p => p.moduleId === selectedModuleId).map(prob => {
                    const isCustom = prob.isCustom || customProblemIds.includes(prob.id);
                    return (
                      <div
                        key={prob.id}
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedProblemId(prob.id);
                        }}
                        className={`p-3 rounded-md border cursor-pointer transition-all relative group ${
                          selectedProblemId === prob.id
                            ? 'bg-black/60 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-pixel text-[10px] text-amber-400">{prob.id}</span>
                            {isCustom && (
                              <span className="px-1.5 py-0.2 rounded-sm bg-purple-500/20 border border-purple-400 text-purple-300 text-[8px] font-pixel">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{prob.difficulty}</span>
                            {isCustom && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm(`Remove custom problem "${prob.title}" from MongoDB Atlas?`)) {
                                    try {
                                      await deleteProblemFromDB(prob.id);
                                    } catch (err) {
                                      console.warn('[Admin] Failed to delete from MongoDB:', err);
                                    }
                                    onDeleteProblem?.(prob.id);
                                    soundFx.playFail();
                                  }
                                }}
                                className="text-slate-600 hover:text-rose-400 p-0.5"
                                title="Delete Custom Problem"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h3 className="font-pixel text-xs text-slate-200 line-clamp-1">{prob.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                          <span>{prob.testCases?.length || 0} Test Cases</span>
                          <span>+{prob.xpReward} XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Problem Test Case Manager (7 cols) */}
              <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-lg p-4 sm:p-5 flex flex-col justify-between space-y-4 backdrop-blur-md">
                <div>
                  <div className="border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-pixel text-cyan-400 block">SELECTED PROBLEM DETAILS</span>
                      {(activeProblem.isCustom || customProblemIds.includes(activeProblem.id)) && (
                        <span className="px-2 py-0.5 rounded-sm bg-purple-500/20 border border-purple-400/50 text-purple-300 text-[9px] font-pixel">
                          CUSTOM FACULTY LAB
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-pixel text-slate-100 mt-1">{activeProblem.title}</h2>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3">{activeProblem.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>Reward: <strong className="text-amber-400">+{activeProblem.xpReward} XP</strong></span>
                      <span>Difficulty: <strong className="text-cyan-300">{activeProblem.difficulty}</strong></span>
                      <span>Module: <strong className="text-purple-300">{activeProblem.syllabusRef}</strong></span>
                    </div>
                  </div>

                  {/* Registered Test Cases List */}
                  <div className="space-y-2 mb-4">
                    <span className="text-[10px] font-pixel text-slate-400 block">
                      REGISTERED TEST CASES ({(activeProblem.testCases || []).length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(activeProblem.testCases || []).map((tc, idx) => (
                        <div key={tc.id || idx} className="bg-black/50 p-2.5 rounded-sm border border-white/10 text-xs flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{tc.desc}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              In: {(tc.input || '').replace(/\n/g, ' ')} | Out: {(tc.expectedOutput || '').replace(/\n/g, ' ')}
                            </span>
                          </div>
                          <span className={`text-[9px] font-pixel px-1.5 py-0.5 rounded-sm ${
                            tc.hidden ? 'bg-black/60 text-slate-400 border border-white/10' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                          }`}>
                            {tc.hidden ? 'HIDDEN' : 'SAMPLE'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inject New Hidden Test Case to Active Problem */}
                <form onSubmit={handleAddTestCase} className="border-t border-white/10 pt-3 space-y-2">
                  <span className="text-[10px] font-pixel text-amber-400 block">
                    ADD TEST CASE TO THIS PROBLEM
                  </span>

                  <input
                    type="text"
                    placeholder="Description (e.g. Edge Case Zero)"
                    value={newTcDesc}
                    onChange={(e) => setNewTcDesc(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-sm p-2 text-xs text-slate-200 font-mono"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Stdin input"
                      value={newTcInput}
                      onChange={(e) => setNewTcInput(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-sm p-2 text-xs text-slate-200 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Expected stdout"
                      value={newTcExpected}
                      onChange={(e) => setNewTcExpected(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-sm p-2 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTcHidden}
                        onChange={(e) => setNewTcHidden(e.target.checked)}
                        className="rounded-sm bg-black/60 border-white/20 text-cyan-400"
                      />
                      <span>Mark as Hidden Test</span>
                    </label>

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-purple-500 text-black font-pixel text-[10px] font-bold hover:bg-purple-400 transition-colors shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>INJECT TEST CASE</span>
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
