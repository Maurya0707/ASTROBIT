import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, Problem, User, MONGODB_URI } from './db.js';
import { PROBLEMS } from '../src/data/curriculum.js';

export async function seedDatabase() {
  console.log('[Seed] Checking MongoDB Atlas data integrity...');

  try {
    // 1. Seed or update all curriculum problems (questions, solutions, test cases)
    const existingProblemCount = await Problem.countDocuments();
    console.log(`[Seed] Currently found ${existingProblemCount} problems in MongoDB.`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const prob of PROBLEMS) {
      const existing = await Problem.findOne({ id: prob.id.toLowerCase() });
      if (!existing) {
        await Problem.create({
          id: prob.id.toLowerCase(),
          moduleId: prob.moduleId,
          title: prob.title,
          syllabusRef: prob.syllabusRef || `Module ${prob.moduleId}`,
          difficulty: prob.difficulty || 'Cadet',
          xpReward: prob.xpReward || 100,
          description: prob.description,
          inputFormat: prob.inputFormat || '',
          outputFormat: prob.outputFormat || '',
          constraints: prob.constraints || '',
          sampleInput: prob.sampleInput || '',
          sampleOutput: prob.sampleOutput || '',
          hints: prob.hints || [],
          starterCode: prob.starterCode || '',
          solutionCode: prob.solutionCode || '',
          testCases: (prob.testCases || []).map((tc, idx) => ({
            id: tc.id || `tc_${idx + 1}`,
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            hidden: !!tc.hidden,
            desc: tc.desc || `Test Case #${idx + 1}`
          })),
          isCustom: false
        });
        insertedCount++;
      } else {
        // Ensure solutions and test cases are updated if needed
        let changed = false;
        if (!existing.solutionCode && prob.solutionCode) {
          existing.solutionCode = prob.solutionCode;
          changed = true;
        }
        if ((!existing.testCases || existing.testCases.length === 0) && prob.testCases) {
          existing.testCases = prob.testCases;
          changed = true;
        }
        if (changed) {
          await existing.save();
          updatedCount++;
        }
      }
    }

    console.log(`[Seed] Curriculum questions seeded: ${insertedCount} new added, ${updatedCount} updated.`);

    // Clean up any legacy demo accounts from MongoDB Atlas
    await User.deleteMany({
      $or: [
        { rollNo: '24CSE042' },
        { facultyId: 'PROF_ADMIN' }
      ]
    });
    console.log('[Seed] Removed legacy hardcoded demo accounts from database.');

    console.log('[Seed] Database initialization and seeding complete!');
  } catch (err) {
    console.error('[Seed] Error during database seed:', err.message);
  }
}

// Standalone runner if executed directly: node server/seed.js
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await mongoose.disconnect();
      console.log('[Seed] Disconnected from MongoDB Atlas.');
      process.exit(0);
    } catch (e) {
      console.error('[Seed] Execution error:', e);
      process.exit(1);
    }
  })();
}
