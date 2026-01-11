import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { getTheme, updateTheme } from '../controllers/theme.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/theme - Get user's theme
router.get('/', getTheme);

// PUT /api/theme/change - Update user's theme
router.put('/change', updateTheme);

export default router;
