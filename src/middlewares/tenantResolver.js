// src/middlewares/tenantResolver.js
import { Company } from '../models/company.model.js';
import { createApiError } from '../utils/helpers.js';

export const tenantResolver = async (req, res, next) => {
  try {
    const host = req.hostname;

    // Localhost bypass
    if (host.includes('localhost')) {
      req.tenant = null;
      return next();
    }

    // Handle root domain (e.g., biportal365.com)
    if (host === 'biportal365.com') {
      req.tenant = 'superadmin'; // or null if you don't need tenant enforcement
      return next();
    }

    // Extract subdomain (e.g., softlyfy.biportal365.com → 'softlyfy')
    const parts = host.split('.');
    const subdomain = parts.length > 2 ? parts[0] : null;

    if (!subdomain || ['www'].includes(subdomain)) {
      req.tenant = null;
      return next();
    }

    const tenant = await Company.findOne({ name: subdomain, isActive: true });

    if (!tenant) {
      return next(createApiError(`Invalid tenant — subdomain "${subdomain}" not recognized or inactive.`, 404));
    }

    req.tenant = tenant.name;
    next();
  } catch (error) {
    next(error);
  }
};
