import React, { useState, useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import LandingPage from './components/LandingPage';
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

  // Check achievements on progress change
  useEffect(() => {
    const currentRank = getRankForXp(userProgress.xp || 0);
    const newlyEligible = checkEligibleAchievements(userProgress, currentRank);
    if (newlyEligible.length > 0) {
      const newIds = newlyEligible.map(a => a.id);
      setUserProgress(prev => ({
        ...prev,
        unlockedAchievements: Array.from(new Set([...prev.unlockedAchievements, ...newIds]))
      }));
      setAchievementQueue(prev => [...prev, ...newlyEligible]);
    }
  }, [userProgress.clearedProblems, userProgress.xp, userProgress.unlockedSectors]);

  // Process achievement queue
  useEffect(() => {
    if (!activeAchievement && achievementQueue.length > 0) {
      const next = achievementQueue[0];
      setActiveAchievement(next);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [activeAchievement, achievementQueue]);

  // Handle hint penalty
  const handleDeductXp = (amount) => {
    setUserProgress(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - amount)
    }));
  };

  // Navigate to problem in workspace
  const handleSelectProblem = (problem) => {
    setCurrentProblem(problem);
    setCurrentSectorId(problem.moduleId);
    setActiveView('workspace');
  };

  // Next problem sequential navigation
  const currentProblemIndex = PROBLEMS.findIndex(p => p.id === currentProblem?.id);
  const hasNextProblem = currentProblemIndex >= 0 && currentProblemIndex < PROBLEMS.length - 1;
  const hasPrevProblem = currentProblemIndex > 0;

  const handleNextProblem = () => {
    if (hasNextProblem) {
      soundFx.playClick();
      const nextProb = PROBLEMS[currentProblemIndex + 1];
      setCurrentProblem(nextProb);
      setCurrentSectorId(nextProb.moduleId);
    }
  };

  const handlePrevProblem = () => {
    if (hasPrevProblem) {
      soundFx.playClick();
      const prevProb = PROBLEMS[currentProblemIndex - 1];
      setCurrentProblem(prevProb);
      setCurrentSectorId(prevProb.moduleId);
    }
  };

  // Reset progress
  const handleResetProgress = () => {
    setUserProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
    soundFx.playFail();
  };

  return (
    <div className="relative min-h-screen bg-black text-slate-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Mathematically Sharp Deep-Space Canvas Background (Midnight Blue to Pitch-Black) */}
      <CosmicBackground />

      {/* Floating Animated Achievement Announcement Toast */}
      {activeAchievement && (
        <AchievementToast
          achievement={activeAchievement}
          onDismiss={() => setActiveAchievement(null)}
        />
      )}

      {/* If Not Authenticated: Render Premium Dark-Mode Bento-Grid Landing Page */}
      {!currentUser ? (
        <LandingPage onLogin={handleLogin} />
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
