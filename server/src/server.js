import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } else {
      console.warn('⚠️ MONGO_URI not found. Database connection skipped.');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Handle process-level crashes
    process.on('unhandledRejection', (reason, promise) => {
      console.error('😱 Unhandled Rejection at:', promise, 'reason:', reason);
      // Keep server running but log the error
    });

    process.on('uncaughtException', (error) => {
      console.error('💀 Uncaught Exception:', error);
      // Optional: process.exit(1) if you want to restart, but user asked NOT to crash
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
