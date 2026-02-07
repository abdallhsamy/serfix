import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function env(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: env('DATABASE_URL'),
  jwt: {
    secret: env('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? ['http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: process.env.NODE_ENV === 'test' ? 10000 : parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    authMax: process.env.NODE_ENV === 'test' ? 10000 : parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '10', 10),
  },
} as const;

if (config.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}
