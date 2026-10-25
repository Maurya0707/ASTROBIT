import app from './app.js';
import { connectDB } from './db.js';
import { seedDatabase } from './seed.js';

const PORT = process.env.PORT || 3001;

// Connect to MongoDB Atlas, auto-seed database, and start standalone server
async function startServer() {
  try {
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.error('[Server] Notice: Database connection error on boot, retrying in background:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ASTROBIT] Backend & API Server active on port ${PORT}`);
  });
}

startServer();
