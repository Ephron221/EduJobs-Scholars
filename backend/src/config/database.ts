import mongoose from 'mongoose';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('❌ MONGODB_URI is not defined in environment variables');
    }
    
    // For Vercel/Serverless, we check if we already have a connection
    if (mongoose.connection.readyState >= 1) {
      return mongoose;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is down (5s)
      socketTimeoutMS: 45000, // Close sockets after 45s
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error; // Let the caller handle it (crucial for Vercel)
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});
