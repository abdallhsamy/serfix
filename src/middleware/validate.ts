import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';
import { ErrorCodes } from "../constants/errorCodes";

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const messages = errors.array().map((e) => (e.type === 'field' ? `${e.path}: ${e.msg}` : e.msg));
    next(new AppError(400, messages.join('; '), ErrorCodes.ValidationError));
  };
}
