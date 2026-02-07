import { body } from 'express-validator';

const PASSWORD_MIN = 8;
const passwordRules = [
  body('password')
    .isLength({ min: PASSWORD_MIN })
    .withMessage(`Password must be at least ${PASSWORD_MIN} characters`)
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter'),
];

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  ...passwordRules,
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Name is required (max 255 chars)'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];
