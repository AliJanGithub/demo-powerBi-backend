import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { inviteUserValidation } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.post('/invite-user', inviteUserValidation, validate, adminController.inviteUser);

export default router;
