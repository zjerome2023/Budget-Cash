import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}
