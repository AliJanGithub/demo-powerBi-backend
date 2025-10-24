import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireAdminOrSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { mongoIdValidation } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdminOrSuperAdmin);

router.get('/', usersController.getAllUsers);
router.put('/update/name', validate,usersController.updateUserName);

router.get('/:id', mongoIdValidation, validate, usersController.getUserById);

router.put('/:id', mongoIdValidation, validate, usersController.updateUser);

router.delete('/:id', mongoIdValidation, validate, usersController.deleteUser);

export default router;
