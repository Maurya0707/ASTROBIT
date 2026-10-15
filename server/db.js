import mongoose from 'mongoose';
import User from './models/User.js';
import Problem from './models/Problem.js';

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://astrobit:129astro6@astrobitapi.7qgrj7c.mongodb.net/astrobit?retryWrites=true&w=majority&appName=astrobitapi";

export async function connectDB() {
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
