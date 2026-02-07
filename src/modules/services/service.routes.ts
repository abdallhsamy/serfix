import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { validate } from '../../middleware/validate';
import { Role } from '@prisma/client';
import {
  listServicesValidation,
  getServiceValidation,
  createServiceValidation,
  updateServiceValidation,
  deleteServiceValidation,
} from './service.validation';
import * as serviceController from './service.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listServicesValidation), serviceController.list);
router.get('/:id', validate(getServiceValidation), serviceController.getById);

router.post('/', requireRole([Role.ADMIN]), validate(createServiceValidation), serviceController.create);
router.patch('/:id', requireRole([Role.ADMIN]), validate(updateServiceValidation), serviceController.update);
router.delete('/:id', requireRole([Role.ADMIN]), validate(deleteServiceValidation), serviceController.remove);

export default router;
