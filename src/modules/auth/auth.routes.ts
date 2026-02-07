import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { registerValidation, loginValidation } from './auth.validation';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);

export default router;
