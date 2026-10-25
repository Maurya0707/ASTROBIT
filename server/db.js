import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Problem from './models/Problem.js';

export const MONGODB_URI = process.env.MONGODB_URI;

// Global cache for Serverless / Vercel lambdas to reuse connection
let cachedPromise = null;

export async function connectDB() {
  // If already connected, reuse existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If already connecting, await ongoing promise
  if (cachedPromise) {
    return await cachedPromise;
  }

  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    const msg = 'MONGODB_URI is not set. Please configure MONGODB_URI in your Vercel Project Environment Variables or .env file.';
    console.error(`[MongoDB Atlas] Config Error: ${msg}`);
    throw new Error(msg);
  }

  cachedPromise = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  }).then((conn) => {
    console.log(`[MongoDB Atlas] Connected successfully to database: "${conn.connection.name}"`);
    return conn.connection;
  }).catch((error) => {
    cachedPromise = null;
    console.error('[MongoDB Atlas] Connection failed:', error.message);
    throw error;
  });

  return await cachedPromise;
}

export { User, Problem };
