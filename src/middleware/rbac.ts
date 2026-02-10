import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from './errorHandler';
import { ErrorCodes } from "../constants/errorCodes";

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', ErrorCodes.Unauthorized));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions', ErrorCodes.Forbidden));
    }
    next();
  };
}
