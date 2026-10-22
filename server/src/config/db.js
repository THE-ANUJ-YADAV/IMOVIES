import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    
    // First try configured URI with a short timeout
    logger.info(`Attempting to connect to MongoDB at: ${config.mongoUri}`);
    
    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      logger.info('MongoDB connected successfully via URI');
      return;
    } catch (uriError) {
      logger.warn(`Could not connect to external MongoDB: ${uriError.message}`);
      
      // Fallback to in-memory MongoDB in dev/test mode
      if (config.env !== 'production') {
        logger.info('Starting embedded in-memory MongoDB instance for development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        await mongoose.connect(memoryUri);
        logger.info(`Embedded in-memory MongoDB connected successfully at ${memoryUri}`);
        return;
      }
      throw uriError;
    }
  } catch (err) {
    logger.error('Database connection failed', err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error disconnecting MongoDB', err);
  }
};
