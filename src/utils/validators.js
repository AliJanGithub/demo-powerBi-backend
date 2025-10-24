import { body, param, query } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

export const inviteAdminValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('companyName')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

export const inviteUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

export const acceptInviteValidation = [
  body('token')
    .notEmpty()
    .withMessage('Invite token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

export const createDashboardValidation = [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('embedUrl')
    .trim()
    .notEmpty()
    .isURL()
    .withMessage('Valid embed URL is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

export const updateDashboardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid dashboard ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('embedUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid embed URL is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

export const assignDashboardValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid dashboard ID is required'),
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('At least one user ID is required'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Valid user IDs are required')
];

export const createCommentValidation = [
    param('id')
        .isMongoId()
        .withMessage('Valid dashboard ID is required'),
    body('message')
        .trim()
        .notEmpty()
        .isLength({ min: 1, max: 2000 })
        .withMessage('Message must be between 1 and 2000 characters'),
    body('parentId')
        .optional({ nullable: true }) // <-- CRITICAL FIX: Allows the field to be null
        .isMongoId() 
        .withMessage('Valid parent comment ID required')
];

export const updateCommentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid comment ID is required'),
  body('message')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
];

export const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required')
];
