import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginValidation, acceptInviteValidation } from '../utils/validators.js';
import { body } from 'express-validator';

const router = express.Router();

// ✅ LOGIN — only allow if tenant exists (or localhost)
router.post('/login', loginValidation, validate, async (req, res, next) => {
  try {
    if (!req.tenant && !req.hostname.includes('localhost')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tenant — subdomain not recognized or inactive.',
      });
    }

    // Proceed with login
    await authController.login(req, res, next);
  } catch (err) {
    next(err);
  }
});

// ✅ REFRESH — same rule, must belong to a valid tenant
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  async (req, res, next) => {
    try {
      if (!req.tenant && !req.hostname.includes('localhost')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tenant — subdomain not recognized or inactive.',
        });
      }

      await authController.refresh(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

router.post('/logout', authController.logout);
router.post('/accept-invite', acceptInviteValidation, validate, authController.acceptInvite);
router.get('/me', authenticate, authController.me);

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  validate,
  authController.changePassword
);

router.post(
  '/change-name',
  authenticate,
  [body('newName').notEmpty().withMessage('New name is required')],
  validate,
  authController.changeName
);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

export default router;
