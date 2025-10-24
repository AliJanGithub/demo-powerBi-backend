import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/helpers.js';

// export const createDashboard = asyncHandler(async (req, res) => {
//   const dashboard = await DashboardService.createDashboard(req.user._id, req.body);

//   res.status(201).json({
//     success: true,
//     message: 'Dashboard created successfully',
//     data: { dashboard }
//   });
// });

export const createDashboard = asyncHandler(async (req, res) => {
  const dashboard = await DashboardService.createDashboard(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Dashboard created successfully',
    data: { dashboard }
  });
});



export const getDashboards = asyncHandler(async (req, res) => {
  const dashboards = await DashboardService.getDashboards(req.user);

  res.json({
    success: true,
    data: { dashboards }
  });
});

export const getDashboardById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dashboard = await DashboardService.getDashboardById(id, req.user);

  res.json({
    success: true,
    data: { dashboard }
  });
});

export const updateDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const dashboard = await DashboardService.updateDashboard(id, req.body, req.user);

  res.json({
    success: true,
    message: 'Dashboard updated successfully',
    data: { dashboard }
  });
});

export const deleteDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await DashboardService.deleteDashboard(id, req.user);

  res.json({
    success: true,
    message: 'Dashboard deleted successfully'
  });
});

export const assignDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  const dashboard = await DashboardService.assignDashboard(id, userIds, req.user);

  res.json({
    success: true,
    message: 'Dashboard assigned successfully',
    data: { dashboard }
  });
});

export const unassignDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  const dashboard = await DashboardService.unassignDashboard(id, userIds, req.user);

  res.json({
    success: true,
    message: 'Users unassigned successfully',
    data: { dashboard }
  });
});

export const assignByDepartment = asyncHandler(async (req, res) => {
  const { department, userIds } = req.body;

  const dashboards = await DashboardService.assignByDepartment(department, userIds, req.user);

  res.json({
    success: true,
    message: `Users assigned to ${department} dashboards`,
    data: { dashboards }
  });
});
