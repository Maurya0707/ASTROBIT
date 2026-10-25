import mongoose from 'mongoose';
import User from './models/User.js';
import Problem from './models/Problem.js';

export const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!MONGODB_URI) {
    const msg = 'MONGODB_URI is not set. Please add it to your .env file or hosting Environment Variables.';
    console.error(`[MongoDB Atlas] Config Error: ${msg}`);
    throw new Error(msg);
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[MongoDB Atlas] Connected successfully to database: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Atlas] Connection failed:', error.message);
    throw error;
  }
}

export { User, Problem };
