import { body, query, param } from 'express-validator';

export const listServicesValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('isActive').optional().isBoolean().toBoolean(),
];

export const getServiceValidation = [param('id').trim().notEmpty().withMessage('Service id is required')];

export const createServiceValidation = [
  body('name').trim().notEmpty().isLength({ max: 255 }).withMessage('Name is required (max 255 chars)'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('slug').trim().notEmpty().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug must be URL-safe (e.g. my-service)'),
  body('isActive').optional().isBoolean(),
  body('metadata').optional().isObject(),
];

export const updateServiceValidation = [
  param('id').trim().notEmpty().withMessage('Service id is required'),
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('slug').optional().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  body('isActive').optional().isBoolean(),
  body('metadata').optional().isObject(),
];

export const deleteServiceValidation = [param('id').trim().notEmpty().withMessage('Service id is required')];
