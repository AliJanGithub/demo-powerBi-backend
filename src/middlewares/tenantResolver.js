// src/middlewares/tenantResolver.js
import { Company } from '../models/company.model.js';
import { createApiError } from '../utils/helpers.js';

export const tenantResolver = async (req, res, next) => {
  try {
    const host = req.hostname; // e.g., mario.lvh.me, softlyfy.lvh.me, localhost

    // 🧩 Step 1: Handle local development or API requests without subdomain
    // -----------------------------------------------------------
    // `lvh.me` resolves to 127.0.0.1 — so subdomains work locally.
    // Example: mario.lvh.me → subdomain = 'mario'
    console.log(host)
    if (host.includes('localhost')) {
      // no tenant enforcement during localhost dev
      req.tenant = null;
      return next();
    }

    // 🧩 Step 2: Extract subdomain for lvh.me or production domains
    // -----------------------------------------------------------
    const parts = host.split('.');
    const subdomain = parts.length > 2 ? parts[0] : parts[0]; // e.g. mario.lvh.me → 'mario'
console.log(subdomain)
    // Safety check
    if (!subdomain || ['www'].includes(subdomain)) {
      req.tenant = null;
      return next();
    }

    // 🧩 Step 3: Find tenant (Company) in database
    // -----------------------------------------------------------
    const tenant = await Company.findOne({ name:subdomain, isActive: true });
console.log(tenant)
    if (!tenant) {
      // 🚫 Stop the request if subdomain not found
      return next(createApiError(`Invalid tenant — subdomain "${subdomain}" not recognized or inactive.`, 404));
    }

    // 🧩 Step 4: Attach tenant to request
    req.tenant = tenant.name;

    next();
  } catch (error) {
    next(error);
  }
};
