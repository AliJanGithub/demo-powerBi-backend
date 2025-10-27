import express from 'express';
import * as dashboardsController from '../controllers/dashboards.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdminOrSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createDashboardValidation,
  updateDashboardValidation,
  assignDashboardValidation,
  mongoIdValidation
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  requireAdminOrSuperAdmin,
  createDashboardValidation,
  validate,
  dashboardsController.createDashboard
);
router.post('/assign-by-department',requireAdminOrSuperAdmin, validate, dashboardsController.assignByDepartment);
router.get('/department/:department',requireAdminOrSuperAdmin,dashboardsController.getDashboardsByDepartment)

router.get('/', dashboardsController.getDashboards);

router.get('/:id', mongoIdValidation, validate, dashboardsController.getDashboardById);

router.put(
  '/:id',
  requireAdminOrSuperAdmin,
  updateDashboardValidation,
  validate,
  dashboardsController.updateDashboard
);

router.delete(
  '/:id',
  requireAdminOrSuperAdmin,
  mongoIdValidation,
  validate,
  dashboardsController.deleteDashboard
);

router.post(
  '/:id/assign',
  requireAdminOrSuperAdmin,
  assignDashboardValidation,
  validate,
  dashboardsController.assignDashboard
);

router.post(
  '/:id/unassign',
  requireAdminOrSuperAdmin,
  assignDashboardValidation,
  validate,
  dashboardsController.unassignDashboard
);

export default router;
