import { createApiError } from '../utils/helpers.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createApiError('Authentication required', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw createApiError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN');
export const requireAdmin = requireRole('ADMIN');
export const requireAdminOrSuperAdmin = requireRole('SUPER_ADMIN', 'ADMIN');
export const requireUser = requireRole('USER');
export const requireAnyRole = requireRole('SUPER_ADMIN', 'ADMIN', 'USER');
