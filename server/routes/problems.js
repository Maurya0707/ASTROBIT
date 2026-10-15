import express from 'express';
import Problem from '../models/Problem.js';

const router = express.Router();

// ================= GET ALL PROBLEMS FROM MONGODB =================
router.get('/', async (req, res) => {
  try {
    const { moduleId } = req.query;
    const filter = {};
    if (moduleId) {
      filter.moduleId = Number(moduleId);
    }

    const problems = await Problem.find(filter).sort({ moduleId: 1, id: 1 }).lean();
    return res.json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (error) {
    console.error('[Get Problems Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================= GET SINGLE PROBLEM BY ID =================
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id.toLowerCase() }).lean();
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }
    return res.json({ success: true, problem });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================= ADMIN: INSERT NEW PROBLEM INTO MONGODB =================
router.post('/', async (req, res) => {
  try {
    const {
      id,
      moduleId,
      title,
      syllabusRef,
      difficulty = 'Cadet',
      xpReward = 120,
      description,
      inputFormat = '',
      outputFormat = '',
      constraints = '',
      sampleInput = '',
      sampleOutput = '',
      hints = [],
      starterCode = '',
      solutionCode = '',
      testCases = [],
      isCustom = true
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Question title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Problem description is required.' });
    }
    if (!moduleId || moduleId < 1 || moduleId > 6) {
      return res.status(400).json({ success: false, error: 'Valid Module ID (1-6) is required.' });
    }

    // Format Problem ID
    const cleanId = (id || `p${moduleId}_q${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const existing = await Problem.findOne({ id: cleanId });
    if (existing) {
      return res.status(400).json({ success: false, error: `Problem ID "${cleanId}" already exists. Please choose a unique ID.` });
    }

    // Ensure valid test cases
    const formattedTestCases = (testCases || []).map((tc, idx) => ({
      id: tc.id || `tc_${idx + 1}`,
      input: tc.input || '',
      expectedOutput: tc.expectedOutput || '',
      hidden: !!tc.hidden,
      desc: tc.desc || `Test Case #${idx + 1}`
    }));

    if (formattedTestCases.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one test case is required.' });
    }

    const newProblem = await Problem.create({
      id: cleanId,
      moduleId: Number(moduleId),
      title: title.trim(),
      syllabusRef: syllabusRef || `Module ${moduleId}`,
      difficulty,
      xpReward: Number(xpReward) || 120,
      description: description.trim(),
      inputFormat: inputFormat.trim(),
      outputFormat: outputFormat.trim(),
      constraints: constraints.trim(),
      sampleInput: sampleInput || formattedTestCases[0]?.input || '',
      sampleOutput: sampleOutput || formattedTestCases[0]?.expectedOutput || '',
      hints,
      starterCode: starterCode.trim(),
      solutionCode: solutionCode.trim(),
      testCases: formattedTestCases,
      isCustom: true
    });

    console.log(`[Admin] Question inserted into MongoDB: "${newProblem.title}" (ID: ${newProblem.id}) in Module ${newProblem.moduleId}`);

    return res.status(201).json({
      success: true,
      message: 'Question added to MongoDB curriculum successfully!',
      problem: newProblem
    });
  } catch (error) {
    console.error('[Insert Problem Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================= ADMIN: DELETE CUSTOM PROBLEM FROM MONGODB =================
router.delete('/:id', async (req, res) => {
  try {
    const cleanId = req.params.id.toLowerCase();
    const problem = await Problem.findOne({ id: cleanId });

    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found in database.' });
    }

    await Problem.deleteOne({ id: cleanId });
    console.log(`[Admin] Question deleted from MongoDB: ID ${cleanId}`);

    return res.json({
      success: true,
      message: `Problem "${cleanId}" removed from MongoDB.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ================= ADMIN: ADD TEST CASE TO PROBLEM =================
router.post('/:id/testcases', async (req, res) => {
  try {
    const cleanId = req.params.id.toLowerCase();
    const { input = '', expectedOutput, hidden = true, desc } = req.body;

    if (!expectedOutput || !expectedOutput.trim()) {
      return res.status(400).json({ success: false, error: 'Expected output is required.' });
    }

    const problem = await Problem.findOne({ id: cleanId });
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found.' });
    }

    const newTestCase = {
      id: `tc_${Date.now()}`,
      input,
      expectedOutput: expectedOutput.trim(),
      hidden: !!hidden,
      desc: desc || `Test Case #${problem.testCases.length + 1}`
    };

    problem.testCases.push(newTestCase);
    await problem.save();

    console.log(`[Admin] Added test case to problem ${cleanId}: ${newTestCase.desc}`);

    return res.status(201).json({
      success: true,
      message: 'Test case added to problem in database!',
      testCase: newTestCase,
      testCases: problem.testCases
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
