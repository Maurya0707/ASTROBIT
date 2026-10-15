import { PROBLEMS } from './curriculum';

// Curriculum and Progression Achievements for ASTROBIT
// Strictly awarded when questions and modules are completed correctly
export const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: 'FIRST BLOOD',
    category: 'cadet',
    description: 'Passed all unit test cases for your very first C programming lab!',
    icon: 'Zap',
    xpReward: 100,
    badgeColor: '#10b981'
  },
  {
    id: 'cadet_five',
    title: 'PENTASTAR CODER',
    category: 'cadet',
    description: 'Successfully cleared 5 C programming questions with all test cases passed!',
    icon: 'Sparkles',
    xpReward: 150,
    badgeColor: '#00f0ff'
  },
  {
    id: 'cadet_ten',
    title: 'DECATHLON OF C',
    category: 'cadet',
    description: 'Demonstrated deep mastery by solving 10 questions correctly across the syllabus!',
    icon: 'Shield',
    xpReward: 300,
    badgeColor: '#a855f7'
  },
  {
    id: 'mod1_clear',
    title: 'LOOP MASTER',
    category: 'sector',
    description: 'Conquered Module 1: Basic Operations & Loops! All questions completed correctly.',
    icon: 'RotateCw',
    xpReward: 200,
    badgeColor: '#22c55e'
  },
  {
    id: 'mod2_clear',
    title: 'LOGIC ARCHITECT',
    category: 'sector',
    description: 'Mastered Module 2: Conditional Statements & Branching Logic! All questions completed correctly.',
    icon: 'GitBranch',
    xpReward: 200,
    badgeColor: '#eab308'
  },
  {
    id: 'mod3_clear',
    title: 'RECURSION TIME LORD',
    category: 'sector',
    description: 'Conquered Module 3: Loops & Iteration! Volcanic core fully cleared.',
    icon: 'Repeat',
    xpReward: 250,
    badgeColor: '#ef4444'
  },
  {
    id: 'mod4_clear',
    title: 'CRYSTALLINE CODER',
    category: 'sector',
    description: 'Mastered Module 4: Functions & Recursion! Procedural abstraction mastered.',
    icon: 'RefreshCw',
    xpReward: 250,
    badgeColor: '#06b6d4'
  },
  {
    id: 'mod5_clear',
    title: 'MATRIX CONQUEROR',
    category: 'sector',
    description: 'Dominated Module 5: Arrays & Matrices! Contiguous memory ring mastered.',
    icon: 'Grid',
    xpReward: 300,
    badgeColor: '#a855f7'
  },
  {
    id: 'mod6_clear',
    title: 'GRAND MASTER OF C',
    category: 'sector',
    description: 'Conquered Module 6: Pointers & Low-Level Memory! Complete Syllabus Mastered!',
    icon: 'Award',
    xpReward: 500,
    badgeColor: '#10b981'
  },
  {
    id: 'all_clear',
    title: 'ALL SYSTEMS GO',
    category: 'sector',
    description: 'Conquered every single question across all sectors! Apex Singularity achieved.',
    icon: 'Award',
    xpReward: 500,
    badgeColor: '#ffd700'
  }
];

/**
 * Checks and returns newly eligible achievements strictly upon a correct question solve or module completion.
 * @param {string[]} clearedProblems - All problem IDs cleared by user (including the new one)
 * @param {string|null} solvedProblemId - The ID of the problem just correctly solved
 * @param {string[]} alreadyUnlockedIds - IDs of achievements already unlocked
 * @returns {Array} List of achievement objects that were newly earned
 */
export function checkNewlyUnlockedAchievements(clearedProblems = [], solvedProblemId = null, alreadyUnlockedIds = []) {
  const newlyUnlocked = [];

  // Find the module of the newly solved problem
  const solvedProblem = PROBLEMS.find(p => p.id === solvedProblemId);
  const moduleId = solvedProblem?.moduleId;

  // 1. First Blood: First question ever correctly cleared
  if (clearedProblems.length >= 1 && !alreadyUnlockedIds.includes('first_blood')) {
    newlyUnlocked.push('first_blood');
  }

  // 2. 5 Questions Solved milestone
  if (clearedProblems.length >= 5 && !alreadyUnlockedIds.includes('cadet_five')) {
    newlyUnlocked.push('cadet_five');
  }

  // 3. 10 Questions Solved milestone
  if (clearedProblems.length >= 10 && !alreadyUnlockedIds.includes('cadet_ten')) {
    newlyUnlocked.push('cadet_ten');
  }

  // 4. Respective Module Completion Check:
  // Dynamically inspects all problems in the module of the recently solved question
  if (moduleId) {
    const modProblems = PROBLEMS.filter(p => p.moduleId === moduleId);
    const allModCleared = modProblems.length > 0 && modProblems.every(p => clearedProblems.includes(p.id));
    const modAchievementId = `mod${moduleId}_clear`;
    
    if (allModCleared && !alreadyUnlockedIds.includes(modAchievementId)) {
      newlyUnlocked.push(modAchievementId);
    }
  }

  // Check any other module that may be 100% completed
  for (let m = 1; m <= 6; m++) {
    const modProblems = PROBLEMS.filter(p => p.moduleId === m);
    if (modProblems.length > 0 && modProblems.every(p => clearedProblems.includes(p.id))) {
      const modAchievementId = `mod${m}_clear`;
      if (!alreadyUnlockedIds.includes(modAchievementId) && !newlyUnlocked.includes(modAchievementId)) {
        newlyUnlocked.push(modAchievementId);
      }
    }
  }

  // 5. Complete Curriculum Solved:
  if (PROBLEMS.length > 0 && PROBLEMS.every(p => clearedProblems.includes(p.id)) && !alreadyUnlockedIds.includes('all_clear')) {
    newlyUnlocked.push('all_clear');
  }

  return newlyUnlocked.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
}

// Backward compatible export
export const checkEligibleAchievements = (userProgress = {}) => {
  return checkNewlyUnlockedAchievements(
    userProgress?.clearedProblems || [],
    null,
    userProgress?.unlockedAchievements || []
  );
};
