import express from 'express';
import * as superadminController from '../controllers/superadmin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { inviteAdminValidation } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSuperAdmin);

router.post('/invite-admin', inviteAdminValidation, validate, superadminController.inviteAdmin);

router.get('/companies', superadminController.getAllCompanies);

router.get('/dashboards', superadminController.getAllDashboards);

router.get('/users', superadminController.getAllUsers);

export default router;
