import dotenv from 'dotenv';
import path from 'path';

// Load .env.test first so test runs use test DB and secrets
dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), quiet: true });
// Fallback to .env if .env.test is not present
if (!process.env.DATABASE_URL) {
  dotenv.config({ quiet: true });
}

process.env.NODE_ENV = 'test';

// Ensure required env for app import (must be set before config is loaded)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'test-jwt-secret-min-32-characters-long';
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/serfix_test?schema=public';
}
