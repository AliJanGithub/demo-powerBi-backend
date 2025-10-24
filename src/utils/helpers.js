import crypto from 'crypto';

export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const parseTimeToMs = (timeStr) => {
  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;

  const [, value, unit] = match;
  return parseInt(value) * (units[unit] || 1000);
};

export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.passwordHash;
  delete userObj.inviteTokenHash;
  delete userObj.__v;
  return userObj;
};

export const createApiError = (message, statusCode = 500, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
};
