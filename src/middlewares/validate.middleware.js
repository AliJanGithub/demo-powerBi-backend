import { validationResult } from 'express-validator';
import { createApiError } from '../utils/helpers.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    throw createApiError('Validation failed', 400, extractedErrors);
  }

  next();
};
