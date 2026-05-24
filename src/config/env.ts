import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://jaiswarkushagra047_db_user:0Xo2z9ofLXsJnKBc@cluster0.oatpqv4.mongodb.net/ascendpath?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JITSI_DOMAIN: process.env.JITSI_DOMAIN || 'meet.jit.si',
  SESSION_MINIMUM_DURATION_MINUTES: Number(process.env.SESSION_MINIMUM_DURATION_MINUTES || 10),
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
