import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginValidation, acceptInviteValidation } from '../utils/validators.js';
import { body } from 'express-validator';

const router = express.Router();
router.post('/login', loginValidation, validate, authController.login);

router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  validate,
  authController.refresh
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
  [
    body('newName').notEmpty().withMessage('New name is required')
  ],
  validate,
  authController.changeName
);

router.post('/forgot-password', authController.forgotPassword);

// 2. Route to submit the new password using the token (Step 2)
// The token is typically passed in the URL, hence the :token parameter.
router.post('/reset-password/:token', authController.resetPassword);

export default router;
