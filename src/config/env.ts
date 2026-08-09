import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!DATABASE_URL) {
  console.error('❌ FATAL ERROR: DATABASE_URL environment variable is missing.');
  console.error('Please define DATABASE_URL in your .env file before running the server.');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET environment variable is missing.');
  console.error('Please define JWT_SECRET in your .env file before running the server.');
  process.exit(1);
}

export const env = {
  PORT,
  DATABASE_URL,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
