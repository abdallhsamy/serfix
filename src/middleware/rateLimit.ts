import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

const jsonHandler = (body: { error: string; code: string }) => (req: import('express').Request, res: import('express').Response) => {
  res.status(429).json(body);
};

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler({ error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }),
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler({ error: 'Too many authentication attempts', code: 'RATE_LIMIT_EXCEEDED' }),
});
