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





router.get('/favorites/mine', dashboardsController.getFavoriteDashboards);

// Get dashboards with favorite status (all users)
router.get('/with-favorites/status', dashboardsController.getDashboardsWithFavoriteStatus);

// Get most favorited dashboards analytics (admin only)
router.get(
  '/analytics/most-favorited',
  requireAdminOrSuperAdmin,
  dashboardsController.getMostFavoritedDashboards
);

// Check if a specific dashboard is favorited (all users)
router.get(
  '/:id/favorite/status',
  mongoIdValidation,
  validate,
  dashboardsController.checkIfFavorited
);

// Toggle favorite status (all users)
router.post(
  '/:id/favorite/toggle',
  mongoIdValidation,
  validate,
  dashboardsController.toggleFavorite
);

// Add to favorites (alternative to toggle)
router.post(
  '/:id/favorite/add',
  mongoIdValidation,
  validate,
  dashboardsController.addFavorite
);

// Remove from favorites (alternative to toggle)
router.post(
  '/:id/favorite/remove',
  mongoIdValidation,
  validate,
  dashboardsController.removeFavorite
);

// Reorder favorite dashboards (all users)
router.put(
  '/favorites/reorder',
  dashboardsController.reorderFavorites
);

// Add tags to a favorite dashboard (all users)
router.post(
  '/:id/favorite/tag',
  mongoIdValidation,
  validate,
  dashboardsController.tagFavorite
);

// Remove tags from a favorite dashboard (all users)
router.post(
  '/:id/favorite/untag',
  mongoIdValidation,
  validate,
  dashboardsController.untagFavorite
);

// =============== COMMENT ROUTES (if not already included) =============== //
// Note: If you already have comment routes elsewhere, you can skip these

// Get comments for a dashboard (users with dashboard access)
router.get(
  '/:id/comments',
  mongoIdValidation,
  validate,
  dashboardsController.getComments
);

// Create a comment on a dashboard (users with dashboard access)
router.post(
  '/:id/comments',
  mongoIdValidation,
  validate,
  dashboardsController.createComment
);

// Update a comment (comment owner)
router.put(
  '/comments/:commentId',
  mongoIdValidation,
  validate,
  dashboardsController.updateComment
);

// Delete a comment (comment owner or admin)
router.delete(
  '/comments/:commentId',
  mongoIdValidation,
  validate,
  dashboardsController.deleteComment
);






export default router;
