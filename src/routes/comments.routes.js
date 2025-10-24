import express from 'express';
import * as commentsController from '../controllers/comments.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCommentValidation,
  updateCommentValidation,
  mongoIdValidation
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard/:id', mongoIdValidation, validate, commentsController.getComments);

router.post(
  '/dashboard/:id',
  createCommentValidation,
  validate,
  commentsController.createComment
);

router.put('/:id', updateCommentValidation, validate, commentsController.updateComment);

router.delete('/:id', mongoIdValidation, validate, commentsController.deleteComment);

export default router;
