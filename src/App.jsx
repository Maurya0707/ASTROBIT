import React, { useState, useEffect } from 'react';
import CosmicBackground from './components/CosmicBackground';
import Login from './components/Login';
import HUD from './components/HUD';
import SpaceMap from './components/SpaceMap';
import Workspace from './components/Workspace';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import Footer from './components/Footer';
import { MODULES, PROBLEMS, getRankForXp, saveCustomProblem, removeCustomProblem, syncCurriculumFromDB } from './data/curriculum';
import { soundFx } from './services/soundFx';
import AchievementToast from './components/AchievementToast';
import { checkNewlyUnlockedAchievements } from './data/achievements';
import { fetchProblemsFromDB, syncUserProgress } from './services/api';

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
      if (saved) {
        const u = JSON.parse(saved);
        if (u) {
          if (!u.avatar || !u.avatar.startsWith('/sprites/')) {
            u.avatar = u.role === 'admin' ? '/sprites/astronaut_typing.png' : '/sprites/astronaut_idle.png';
          }
          return u;
        }
      }
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

  const [activeView, setActiveView] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.role === 'admin') return 'admin';
      }
    } catch (e) {}
    return 'map';
  });
  const [currentSectorId, setCurrentSectorId] = useState(1);
  const [currentProblem, setCurrentProblem] = useState(PROBLEMS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_SESSION_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.avatar && u.avatar.startsWith('/sprites/')) return u.avatar;
      }
    } catch (e) {}
    return '/sprites/astronaut_idle.png';
  });
  const [curriculumVersion, setCurriculumVersion] = useState(0);

  // Hydrate curriculum problems from MongoDB Atlas on mount
  useEffect(() => {
    let isMounted = true;
    async function loadProblems() {
      try {
        const dbProbs = await fetchProblemsFromDB();
        if (isMounted && dbProbs && Array.isArray(dbProbs) && dbProbs.length > 0) {
          syncCurriculumFromDB(dbProbs);
          setCurriculumVersion(v => v + 1);
        }
      } catch (err) {
        console.warn('[App] Could not hydrate curriculum from DB:', err);
      }
    }
    loadProblems();
    return () => { isMounted = false; };
  }, []);

  const handleSelectAvatar = (newAvatar) => {
    setSelectedAvatar(newAvatar);
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: newAvatar };
      try {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
      } catch (e) {}
      if (updated.mobileNo || updated.rollNo || updated.facultyId) {
        syncUserProgress({
          mobileNo: updated.mobileNo || updated.rollNo,
          facultyId: updated.facultyId,
          progress: userProgress,
          avatar: newAvatar
        });
      }
      return updated;
    });
  };

  // Dynamic admin curriculum mutation handlers
  const handleAddProblem = (newProblem) => {
    saveCustomProblem(newProblem);
    setCurriculumVersion(v => v + 1);
  };

  const handleDeleteProblem = (problemId) => {
    removeCustomProblem(problemId);
    setCurriculumVersion(v => v + 1);
  };

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

  // Handle Login with MongoDB progress hydration
  const handleLogin = (user) => {
    const validAvatar = user?.avatar?.startsWith('/sprites/')
      ? user.avatar
      : (user?.role === 'admin' ? '/sprites/astronaut_typing.png' : '/sprites/astronaut_idle.png');
    const enrichedUser = { ...user, avatar: validAvatar };
    setCurrentUser(enrichedUser);
    setSelectedAvatar(validAvatar);
    if (user?.progress) {
      setUserProgress(prev => ({
        ...prev,
        ...user.progress,
        selectedAvatar: validAvatar
      }));
    }
    if (enrichedUser.role === 'admin') {
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

  // Handle problem solved callback - ONLY executed when test cases PASS correctly
  const handleProblemSolved = (problemId, earnedXp) => {
    setUserProgress(prev => {
      const alreadyCleared = prev.clearedProblems.includes(problemId);
      const newCleared = alreadyCleared ? prev.clearedProblems : [...prev.clearedProblems, problemId];
      const newAttempted = prev.attemptedProblems.includes(problemId)
        ? prev.attemptedProblems
        : [...prev.attemptedProblems, problemId];

      const baseNewXp = alreadyCleared ? prev.xp : prev.xp + earnedXp;

      // STRICT ACHIEVEMENT NOTIFICATION TRIGGER:
      // Awarded ONLY upon completing a question correctly or completing the respective module
      const currentUnlocked = prev.unlockedAchievements || [];
      const newlyEarned = checkNewlyUnlockedAchievements(newCleared, problemId, currentUnlocked);
      const newAchievementIds = newlyEarned.map(a => a.id);
      const bonusXp = newlyEarned.reduce((acc, a) => acc + a.xpReward, 0);

      if (newlyEarned.length > 0) {
        setAchievementQueue(prevQueue => [...prevQueue, ...newlyEarned]);
      }

      const totalXp = baseNewXp + bonusXp;
      const newRank = getRankForXp(totalXp);
      const unlocked = MODULES
        .filter(m => {
          if (m.id === 1) return true;
          const prevMod = MODULES.find(prev => prev.id === m.id - 1);
          if (prevMod) {
            const prevProblems = PROBLEMS.filter(p => p.moduleId === prevMod.id);
            const prevCleared = prevProblems.filter(p => newCleared.includes(p.id));
            if (prevProblems.length > 0 && prevCleared.length === prevProblems.length) {
              return true;
            }
          }
          return newRank.level >= m.minLevelToUnlock || totalXp >= m.minXpToUnlock;
        })
        .map(m => m.id);

      try {
        sessionStorage.setItem('GCPP_LAST_SOLVED_PROBLEM', problemId);
        sessionStorage.setItem('GCPP_NEW_SOLVE_TRIGGERED', 'true');
      } catch (e) {}

      const updatedProgress = {
        ...prev,
        xp: totalXp,
        clearedProblems: newCleared,
        attemptedProblems: newAttempted,
        unlockedAchievements: Array.from(new Set([...currentUnlocked, ...newAchievementIds])),
        unlockedSectors: Array.from(new Set([...prev.unlockedSectors, ...unlocked]))
      };

      if (currentUser?.mobileNo || currentUser?.rollNo || currentUser?.facultyId) {
        syncUserProgress({
          mobileNo: currentUser?.mobileNo || currentUser?.rollNo,
          facultyId: currentUser?.facultyId,
          progress: updatedProgress,
          avatar: selectedAvatar
        });
      }

      return updatedProgress;
    });
  };

  const handleProblemAttempted = (problemId) => {
    setUserProgress(prev => {
      if (prev.attemptedProblems.includes(problemId)) return prev;
      const updated = {
        ...prev,
        attemptedProblems: [...prev.attemptedProblems, problemId]
      };
      if (currentUser?.mobileNo || currentUser?.rollNo || currentUser?.facultyId) {
        syncUserProgress({
          mobileNo: currentUser?.mobileNo || currentUser?.rollNo,
          facultyId: currentUser?.facultyId,
          progress: updated,
          avatar: selectedAvatar
        });
      }
      return updated;
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
    if (currentUser?.mobileNo || currentUser?.rollNo || currentUser?.facultyId) {
      syncUserProgress({
        mobileNo: currentUser?.mobileNo || currentUser?.rollNo,
        facultyId: currentUser?.facultyId,
        progress: DEFAULT_PROGRESS,
        avatar: selectedAvatar
      });
    }
    setShowProfileModal(false);
  };

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 flex flex-col font-retro overflow-x-hidden">
      
      {/* 60fps Deep-Space Background */}
      <CosmicBackground 
        activeSector={currentSectorId}
        showFloatingAstronaut={!currentUser}
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
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <Login onLogin={handleLogin} />
          </div>
          <Footer />
        </div>
      ) : (
        /* Authenticated Space Operating Environment */
        <>
          {/* Live HUD Cockpit Dashboard */}
          <HUD
            currentUser={currentUser}
            userProgress={userProgress}
            selectedAvatar={selectedAvatar}
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
          <main className="relative flex-1 z-10 flex flex-col">
            {activeView === 'map' && (
              <SpaceMap
                key={`map-${curriculumVersion}`}
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
                onAddProblem={handleAddProblem}
                onDeleteProblem={handleDeleteProblem}
                curriculumVersion={curriculumVersion}
              />
            )}
          </main>

          {/* Global Cosmic Footer with Developer attribution to Aditya Maurya */}
          {activeView !== 'workspace' && (
            <Footer 
              onNavigateSector={(sectorId) => {
                setCurrentSectorId(sectorId);
                setActiveView('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {/* Astronaut Flight Log Modal */}
          {showProfileModal && (
            <ProfileModal
              currentUser={currentUser}
              userProgress={userProgress}
              onClose={() => setShowProfileModal(false)}
              onResetProgress={handleResetProgress}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={handleSelectAvatar}
            />
          )}
        </>
      )}

    </div>
  );
}
