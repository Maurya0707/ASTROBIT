// ASTROBIT Central API Client for MongoDB Atlas Backend

const API_BASE = 'http://localhost:3001/api';

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
    return {
      success: false,
      error: 'Unable to reach backend server. Please verify the server is running on port 3001.'
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
    return {
      success: false,
      error: 'Unable to connect to ASTROBIT server. Please check port 3001.'
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
