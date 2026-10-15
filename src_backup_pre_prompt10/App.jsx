import React, { useState, useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import Login from './components/Login';
import HUD from './components/HUD';
import SpaceMap from './components/SpaceMap';
import Workspace from './components/Workspace';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import { MODULES, PROBLEMS, getRankForXp } from './data/curriculum';
import { soundFx } from './services/soundFx';
import AchievementToast from './components/AchievementToast';
import { checkEligibleAchievements } from './data/achievements';

const STORAGE_KEY = 'GCPP_USER_PROGRESS_V2';
const USER_SESSION_KEY = 'GCPP_USER_SESSION_V2';
const BG_MODE_KEY = 'GCPP_BG_MODE_V2';

const DEFAULT_PROGRESS = {
  xp: 0,
  clearedProblems: [],
  attemptedProblems: [],
  unlockedSectors: [1],
  unlockedAchievements: [],
  selectedAvatar: '/sprites/astronaut_idle.png'
};

export default function App() {
  // Current authenticated user session (Student or Admin)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // User progression state
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PROGRESS;
  });

  // Achievement toast announcements
  const [activeAchievement, setActiveAchievement] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);

  // Background visual mode: 'stargazing' | 'nebula' | 'meteor' | 'minimal'
  const [bgMode, setBgMode] = useState(() => {
    try {
      const saved = localStorage.getItem(BG_MODE_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'stargazing';
  });

  const [activeView, setActiveView] = useState('map'); // 'map' | 'workspace' | 'admin'
  const [currentSectorId, setCurrentSectorId] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(PROBLEMS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('/sprites/astronaut_idle.png');

  // Persist user progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch (e) {}
  }, [userProgress]);

  // Persist session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(USER_SESSION_KEY);
      }
    } catch (e) {}
  }, [currentUser]);

  // Persist background mode
  useEffect(() => {
    try {
      localStorage.setItem(BG_MODE_KEY, bgMode);
    } catch (e) {}
  }, [bgMode]);

  // Handle Login
  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveView('admin');
    } else {
      setActiveView('map');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    setActiveView('map');
  };

  // Handle problem solved callback
  const handleProblemSolved = (problemId, earnedXp) => {
    setUserProgress(prev => {
      const alreadyCleared = prev.clearedProblems.includes(problemId);
      const newCleared = alreadyCleared ? prev.clearedProblems : [...prev.clearedProblems, problemId];
      const newAttempted = prev.attemptedProblems.includes(problemId)
        ? prev.attemptedProblems
        : [...prev.attemptedProblems, problemId];

      const newXp = alreadyCleared ? prev.xp : prev.xp + earnedXp;

      const newRank = getRankForXp(newXp);
      const unlocked = MODULES
        .filter(m => newRank.level >= m.minLevelToUnlock || newXp >= m.minXpToUnlock)
        .map(m => m.id);

      return {
        ...prev,
        xp: newXp,
        clearedProblems: newCleared,
        attemptedProblems: newAttempted,
        unlockedSectors: Array.from(new Set([...prev.unlockedSectors, ...unlocked]))
      };
    });
  };

  const handleProblemAttempted = (problemId) => {
    setUserProgress(prev => {
      if (prev.attemptedProblems.includes(problemId)) return prev;
      return {
        ...prev,
        attemptedProblems: [...prev.attemptedProblems, problemId]
      };
    });
  };

  // Process queued achievements one by one
  useEffect(() => {
    if (!activeAchievement && achievementQueue.length > 0) {
      const [nextAchievement, ...remaining] = achievementQueue;
      setActiveAchievement(nextAchievement);
      setAchievementQueue(remaining);
    }
  }, [activeAchievement, achievementQueue]);

  // Check achievements when progress updates
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;
    const currentRank = getRankForXp(userProgress.xp);
    const newlyEligible = checkEligibleAchievements(userProgress, currentRank);
    if (newlyEligible.length > 0) {
      const newIds = newlyEligible.map(a => a.id);
      const bonusXp = newlyEligible.reduce((acc, a) => acc + a.xpReward, 0);

      setUserProgress(prev => ({
        ...prev,
        xp: prev.xp + bonusXp,
        unlockedAchievements: Array.from(new Set([...(prev.unlockedAchievements || []), ...newIds]))
      }));

      setAchievementQueue(prev => [...prev, ...newlyEligible]);
    }
  }, [userProgress.clearedProblems, userProgress.attemptedProblems, userProgress.xp, userProgress.unlockedSectors]);

  const handleDeductXp = (amount) => {
    setUserProgress(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - amount)
    }));
  };

  const handleSelectProblem = (problem) => {
    setCurrentProblem(problem);
    setCurrentSectorId(problem.moduleId);
    setActiveView('workspace');
  };

  // Previous & Next Problem Navigation Logic
  const currentProblemIndex = PROBLEMS.findIndex(p => p.id === currentProblem.id);
  const hasNextProblem = currentProblemIndex < PROBLEMS.length - 1;
  const hasPrevProblem = currentProblemIndex > 0;

  const handleNextProblem = () => {
    if (hasNextProblem) {
      const nextProb = PROBLEMS[currentProblemIndex + 1];
      setCurrentProblem(nextProb);
      setCurrentSectorId(nextProb.moduleId);
    }
  };

  const handlePrevProblem = () => {
    if (hasPrevProblem) {
      const prevProb = PROBLEMS[currentProblemIndex - 1];
      setCurrentProblem(prevProb);
      setCurrentSectorId(prevProb.moduleId);
    }
  };

  const handleResetProgress = () => {
    setUserProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
    setShowProfileModal(false);
  };

  return (
    <div className="relative min-h-screen bg-charcoal-950 text-slate-100 flex flex-col font-retro overflow-x-hidden">
      
      {/* 60fps Deep-Space Background with Selectable Modes (Stargazing / Nebula / Meteor / Minimal) */}
      <CosmicBackground 
        activeSector={currentSectorId}
        bgMode={bgMode}
      />

      {/* Floating Animated Achievement Announcement Toast */}
      {activeAchievement && (
        <AchievementToast
          achievement={activeAchievement}
          onDismiss={() => setActiveAchievement(null)}
        />
      )}

      {/* If Not Authenticated: Render Animated Dual-Role Login Gateway */}
      {!currentUser ? (
        <Login onLogin={handleLogin} />
      ) : (
        /* Authenticated Space Operating Environment */
        <>
          {/* Live HUD Cockpit Dashboard */}
          <HUD
            currentUser={currentUser}
            userProgress={userProgress}
            activeView={activeView}
            setActiveView={setActiveView}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            onOpenProfile={() => {
              soundFx.playClick();
              setShowProfileModal(true);
            }}
            onLogout={handleLogout}
            bgMode={bgMode}
            setBgMode={setBgMode}
          />

          {/* Main View Area */}
          <main className="relative flex-1 z-10">
            {activeView === 'map' && (
              <SpaceMap
                userProgress={userProgress}
                onSelectProblem={handleSelectProblem}
                currentSectorId={currentSectorId}
                setCurrentSectorId={setCurrentSectorId}
              />
            )}

            {activeView === 'workspace' && (
              <Workspace
                problem={currentProblem}
                userProgress={userProgress}
                onProblemSolved={handleProblemSolved}
                onProblemAttempted={handleProblemAttempted}
                onBackToMap={() => {
                  soundFx.playClick();
                  setActiveView('map');
                }}
                onDeductXp={handleDeductXp}
                onNextProblem={handleNextProblem}
                onPrevProblem={handlePrevProblem}
                hasNextProblem={hasNextProblem}
                hasPrevProblem={hasPrevProblem}
                problemIndex={currentProblemIndex >= 0 ? currentProblemIndex : 0}
                totalProblems={PROBLEMS.length}
              />
            )}

            {activeView === 'admin' && (
              <AdminDashboard
                userProgress={userProgress}
                onUpdateProblemTestCases={() => {}}
              />
            )}
          </main>

          {/* Astronaut Flight Log Modal */}
          {showProfileModal && (
            <ProfileModal
              currentUser={currentUser}
              userProgress={userProgress}
              onClose={() => setShowProfileModal(false)}
              onResetProgress={handleResetProgress}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
          )}
        </>
      )}

    </div>
  );
}
