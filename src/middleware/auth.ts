import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service';
import { AppError } from './errorHandler';
import { ErrorCodes } from "../constants/errorCodes";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authorization header missing or invalid', ErrorCodes.Unauthorized));
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, email: payload.email, role: payload.role as 'USER' | 'ADMIN' };
    next();
  } catch (e) {
    next(e);
  }
}
