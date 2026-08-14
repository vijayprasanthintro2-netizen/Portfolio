import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  if (!env.mongoUri) {
    console.warn(
      '[db] MONGO_URI is not set. Contact messages will NOT be persisted. ' +
        'Add a MONGO_URI to backend/.env to enable MongoDB storage.'
    );
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[db] MongoDB connection failed:', error.message);
    console.warn('[db] Server will keep running, but contact storage is disabled.');
    return null;
  }
}
