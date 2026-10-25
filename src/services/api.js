// ASTROBIT Central API Client for MongoDB Atlas Backend

/**
 * Dynamically resolves the API Base URL:
 * 1. Checks VITE_API_URL or VITE_API_BASE_URL (for separate frontend & backend deployments e.g., Vercel + Render/Railway)
 * 2. Checks localStorage override or window.__ASTROBIT_API_URL__ (for runtime injection / debugging)
 * 3. In browser production environments (any domain/host other than localhost / 127.0.0.1), defaults to relative '/api'
 *    which automatically routes to the hosting domain (preventing Mixed Content HTTPS issues & CORS issues)
 * 4. In local development, falls back to direct http://localhost:3001/api or /api
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    if (window.__ASTROBIT_API_URL__) {
      const cleanUrl = String(window.__ASTROBIT_API_URL__).trim().replace(/\/+$/, '');
      return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
    }
    
    try {
      const localOverride = localStorage.getItem('astrobit_api_base');
      if (localOverride) {
        const cleanUrl = localOverride.trim().replace(/\/+$/, '');
        return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
      }
    } catch (e) {
      // Ignore localStorage errors (e.g. private browsing restrictions)
    }

    const { hostname } = window.location;
    // Production domain / external host: use relative /api
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api';
    }
  }

  // Development default for local machine
  return 'http://localhost:3001/api';
}

const API_BASE = getApiBaseUrl();

/**
 * Register / Sign Up a new Student Cadet or Faculty Admin
 */
export async function authRegister({ role, mobileNo, rollNo, facultyId, name, password, passkey, avatar }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        role, 
        mobileNo: mobileNo || rollNo, 
        facultyId, 
        name, 
        password, 
        passkey, 
        avatar 
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[API] Register offline/network error, fallback mode:', err.message);
    const isNetwork = !err.response && (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Load failed'));
    return {
      success: false,
      error: isNetwork
        ? 'Unable to reach ASTROBIT backend server. Please verify network connection or server status.'
        : (err.message || 'Registration failed due to a server connection issue.')
    };
  }
}

/**
 * Log In an existing Student Cadet or Faculty Admin
 */
export async function authLogin({ role, mobileNo, rollNo, facultyId, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        role, 
        mobileNo: mobileNo || rollNo, 
        facultyId, 
        password 
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[API] Login offline/network error:', err.message);
    const isNetwork = !err.response && (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('Load failed'));
    return {
      success: false,
      error: isNetwork
        ? 'Unable to reach ASTROBIT backend server. Please verify network connection or server status.'
        : (err.message || 'Login failed due to a server connection issue.')
    };
  }
}

/**
 * Sync user progression (XP, clearedProblems, unlockedAchievements, etc.) with MongoDB
 */
export async function syncUserProgress({ mobileNo, rollNo, facultyId, progress, avatar }) {
  try {
    const res = await fetch(`${API_BASE}/user/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mobileNo: mobileNo || rollNo, 
        facultyId, 
        progress, 
        avatar 
      })
    });
    return await res.json();
  } catch (err) {
    console.warn('[API] Progress sync offline:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all curriculum problems from MongoDB Atlas
 */
export async function fetchProblemsFromDB() {
  try {
    const res = await fetch(`${API_BASE}/problems`);
    const data = await res.json();
    if (data.success && Array.isArray(data.problems)) {
      return data.problems;
    }
    return null;
  } catch (err) {
    console.warn('[API] Failed to fetch problems from MongoDB:', err.message);
    return null;
  }
}

/**
 * Admin: Insert a new question into MongoDB Atlas
 */
export async function createProblemInDB(problemData) {
  try {
    const res = await fetch(`${API_BASE}/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData)
    });
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to insert problem into MongoDB:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Admin: Delete a custom question from MongoDB Atlas
 */
export async function deleteProblemFromDB(problemId) {
  try {
    const res = await fetch(`${API_BASE}/problems/${problemId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to delete problem from MongoDB:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Admin: Add a test case to an existing question in MongoDB Atlas
 */
export async function addTestCaseToDB(problemId, testCaseData) {
  try {
    const res = await fetch(`${API_BASE}/problems/${problemId}/testcases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCaseData)
    });
    return await res.json();
  } catch (err) {
    console.error('[API] Failed to add test case to MongoDB:', err.message);
    return { success: false, error: err.message };
  }
}
