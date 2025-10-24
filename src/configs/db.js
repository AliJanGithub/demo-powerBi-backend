// import mongoose from 'mongoose';
// import { config } from './secrets.js';
// import { logger } from './logger.js';

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(config.mongodb.uri, {
//       serverSelectionTimeoutMS: 5000,
//     });

//     logger.info(`MongoDB Connected: ${conn.connection.host}`);

//     mongoose.connection.on('error', (err) => {
//       logger.error('MongoDB connection error:');
//     });

//     mongoose.connection.on('disconnected', () => {
//       logger.warn('MongoDB disconnected');
//     });

//     return conn;
//   } catch (error) {
//     logger.error('Error connecting to MongoDB:', error);
//     process.exit(1);
//   }
// };
import mongoose from 'mongoose'
import { config } from './secrets.js';
import { logger } from './logger.js';
export const connectDB = async () => {
  try {
    const mongoUri = config.mongodb.uri

    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Listeners for connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('♻️ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected — retrying in 5 seconds...');
      setTimeout(connectDB, 5000); // retry automatically
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};


