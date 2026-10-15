import { MODULES, PROBLEMS } from '../data/curriculum.js';

/**
 * Returns the cubic bezier control points connecting Sector (moduleId) to Sector (moduleId + 1).
 */
export function getModuleBezierPoints(moduleId) {
  const currentMod = MODULES.find(m => m.id === moduleId) || MODULES[0];
  
  if (moduleId < MODULES.length) {
    const nextMod = MODULES.find(m => m.id === moduleId + 1) || MODULES[moduleId];
    const p0 = currentMod.coordinates;
    const p3 = nextMod.coordinates;
    const midX = (p0.x + p3.x) / 2;
    const p1 = { x: midX, y: p0.y - 70 };
    const p2 = { x: midX, y: p3.y + 70 };
    return { p0, p1, p2, p3 };
  }

  // Final Sector (Sector 6 -> Apex Singularity Horizon)
  const p0 = currentMod.coordinates;
  const p3 = { x: currentMod.coordinates.x + 220, y: currentMod.coordinates.y };
  const p1 = { x: currentMod.coordinates.x + 70, y: currentMod.coordinates.y - 50 };
  const p2 = { x: currentMod.coordinates.x + 150, y: currentMod.coordinates.y + 50 };
  return { p0, p1, p2, p3 };
}

/**
 * Evaluates a point on a cubic bezier curve at parameter t in [0, 1].
 */
export function getPointOnCubicBezier(p0, p1, p2, p3, t) {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * clampedT;

  return {
    x: uuu * p0.x + 3 * uu * clampedT * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * clampedT * p1.y + 3 * u * tt * p2.y + ttt * p3.y
  };
}

/**
 * Calculates progress for a specific module based on user's cleared problems.
 */
export function getModuleProgress(moduleId, clearedProblems = []) {
  const modProblems = PROBLEMS.filter(p => p.moduleId === moduleId);
  const totalCount = modProblems.length;
  const solvedCount = modProblems.filter(p => clearedProblems.includes(p.id)).length;
  const ratio = totalCount > 0 ? solvedCount / totalCount : 0;
  const isCompleted = totalCount > 0 && solvedCount === totalCount;

  return {
    modProblems,
    totalCount,
    solvedCount,
    ratio,
    isCompleted
  };
}

/**
 * Returns waypoint coordinates along the hyperlane curve for each question in the module.
 */
export function getSectorWaypoints(moduleId, clearedProblems = []) {
  const { p0, p1, p2, p3 } = getModuleBezierPoints(moduleId);
  const { modProblems, totalCount } = getModuleProgress(moduleId, clearedProblems);

  if (totalCount === 0) return [];

  return modProblems.map((problem, idx) => {
    // Distribute waypoints along the curve safely between planets (from t=0.20 to t=0.80)
    // to prevent overlapping the starting planet or destination planet
    const t = totalCount === 1 
      ? 0.50 
      : 0.20 + (idx / (totalCount - 1)) * 0.60;
    const pt = getPointOnCubicBezier(p0, p1, p2, p3, t);
    const isCleared = clearedProblems.includes(problem.id);
    
    // The next pending question is the first uncleared problem
    const prevCleared = idx === 0 || clearedProblems.includes(modProblems[idx - 1].id);
    const isNext = !isCleared && prevCleared;

    return {
      problem,
      index: idx,
      labNumber: `${moduleId}.${idx + 1}`,
      t,
      x: Math.round(pt.x),
      y: Math.round(pt.y),
      isCleared,
      isNext
    };
  });
}

/**
 * Returns the exact (x, y) coordinates for the astronaut in a given sector based on cleared problems.
 */
export function getAstronautCoordinatesForSector(moduleId, clearedProblems = []) {
  const { p0, p1, p2, p3 } = getModuleBezierPoints(moduleId);
  const { totalCount, solvedCount } = getModuleProgress(moduleId, clearedProblems);
  
  if (solvedCount === 0) {
    // Station astronaut directly on the sector planet
    return { x: p0.x, y: p0.y };
  }
  
  if (solvedCount >= totalCount) {
    // Sector completed: stationed on the destination planet
    return { x: p3.x, y: p3.y };
  }

  // Position astronaut exactly at the last cleared question milestone
  const t = totalCount === 1 
    ? 0.50 
    : 0.20 + ((solvedCount - 1) / (totalCount - 1)) * 0.60;
  return getPointOnCubicBezier(p0, p1, p2, p3, t);
}

/**
 * Determines the primary active campaign sector:
 * The earliest unlocked sector that is not yet fully completed, or sector 1.
 */
export function getActiveCampaignSectorId(clearedProblems = []) {
  for (const mod of MODULES) {
    const { isCompleted } = getModuleProgress(mod.id, clearedProblems);
    if (!isCompleted) {
      return mod.id;
    }
  }
  return MODULES[MODULES.length - 1].id;
}
