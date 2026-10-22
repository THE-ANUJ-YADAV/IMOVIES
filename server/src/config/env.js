import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies',
  jwtSecret: process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_cinematic_experience',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'imovies_cookie_secret_key_secure',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_imoviesDemoKey123',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'imoviesTestSecretKeyDemo987',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'imoviesWebhookSecret999'
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@imovies.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    name: 'IMovies Chief Administrator'
  },
  seatHoldDurationSeconds: parseInt(process.env.SEAT_HOLD_DURATION_SECONDS, 10) || 600 // 10 minutes
};
