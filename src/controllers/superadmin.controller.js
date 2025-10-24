import { AuthService } from '../services/auth.service.js';
import { UserService } from '../services/user.service.js';
import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler, sanitizeUser } from '../utils/helpers.js';

export const inviteAdmin = asyncHandler(async (req, res) => {
  const { email, companyName, name } = req.body;

  const { admin, company } = await AuthService.inviteAdmin(
    req.user._id,
    email,
    companyName,
    name
  );

  res.status(201).json({
    success: true,
    message: 'Admin invited successfully',
    data: {
      admin: sanitizeUser(admin),
      company
    }
  });
});

export const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await UserService.getAllCompanies();

  res.json({
    success: true,
    data: { companies }
  });
});

export const getAllDashboards = asyncHandler(async (req, res) => {
  const dashboards = await DashboardService.getDashboards(req.user);

  res.json({
    success: true,
    data: { dashboards }
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers(req.user);

  res.json({
    success: true,
    data: { users }
  });
});
