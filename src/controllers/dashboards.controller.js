// import { DashboardService } from '../services/dashboard.service.js';
// import { asyncHandler } from '../utils/helpers.js';

// // export const createDashboard = asyncHandler(async (req, res) => {
// //   const dashboard = await DashboardService.createDashboard(req.user._id, req.body);

// //   res.status(201).json({
// //     success: true,
// //     message: 'Dashboard created successfully',
// //     data: { dashboard }
// //   });
// // });

// export const createDashboard = asyncHandler(async (req, res) => {
//   const dashboard = await DashboardService.createDashboard(req.user._id, req.body, req.app);

//   res.status(201).json({
//     success: true,
//     message: 'Dashboard created successfully',
//     data: { dashboard }
//   });
// });



// export const getDashboards = asyncHandler(async (req, res) => {
//   const dashboards = await DashboardService.getDashboards(req.user);

//   res.json({
//     success: true,
//     data: { dashboards }
//   });
// });

// export const getDashboardById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const dashboard = await DashboardService.getDashboardById(id, req.user);

//   res.json({
//     success: true,
//     data: { dashboard }
//   });
// });

// export const updateDashboard = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const dashboard = await DashboardService.updateDashboard(id, req.body, req.user);

//   res.json({
//     success: true,
//     message: 'Dashboard updated successfully',
//     data: { dashboard }
//   });
// });

// export const deleteDashboard = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   await DashboardService.deleteDashboard(id, req.user);

//   res.json({
//     success: true,
//     message: 'Dashboard deleted successfully'
//   });
// });

// export const assignDashboard = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { userIds  } = req.body;

//   const dashboard = await DashboardService.assignDashboard(id, userIds, req.user);

//   res.json({
//     success: true,
//     message: 'Dashboard assigned successfully',
//     data: { dashboard }
//   });
// });

// export const unassignDashboard = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { userIds } = req.body;

//   const dashboard = await DashboardService.unassignDashboard(id, userIds, req.user);

//   res.json({
//     success: true,
//     message: 'Users unassigned successfully',
//     data: { dashboard }
//   });
// });
 

// export const getDashboardsByDepartment=asyncHandler(
//   async(req,res)=>{
//     const {department}=req.params;
//     const requestingUser=req.user
//     const dashboard=await DashboardService.getDashboardsByDepartment(department,requestingUser);
//     res.json({
//       success:true,
//       message:'All Dashboards by department',
//       data:{dashboard}
//     })
//   }
// )




// export const assignByDepartment = asyncHandler(async (req, res) => {
//   const { department, userIds,selectedDashboardIds } = req.body;

//   const dashboards = await DashboardService.assignByDepartment(department, userIds, req.user,selectedDashboardIds);

//   res.json({
//     success: true,
//     message: `Users assigned to ${department} dashboards`,
//     data: { dashboards }
//   });
// });

import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/helpers.js';

export const createDashboard = asyncHandler(async (req, res) => {
  const dashboard = await DashboardService.createDashboard(req.user._id, req.body, req.app);

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
  const { userIds  } = req.body;

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
 

export const getDashboardsByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;
  const requestingUser = req.user;
  
  const dashboard = await DashboardService.getDashboardsByDepartment(department, requestingUser);
  
  res.json({
    success: true,
    message: 'All Dashboards by department',
    data: { dashboard }
  });
});

export const assignByDepartment = asyncHandler(async (req, res) => {
  const { department, userIds, selectedDashboardIds } = req.body;

  const dashboards = await DashboardService.assignByDepartment(department, userIds, req.user, selectedDashboardIds, req.app);

  res.json({
    success: true,
    message: `Users assigned to ${department} dashboards`,
    data: { dashboards }
  });
});

// ====================== FAVORITE FUNCTIONS ====================== //

/**
 * Add a dashboard to user's favorites
 */
export const addFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await DashboardService.addFavorite(id, req.user._id);

  res.json({
    success: true,
    message: result.message,
    data: { dashboard: result.dashboard }
  });
});

/**
 * Remove a dashboard from user's favorites
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await DashboardService.removeFavorite(id, req.user._id);

  res.json({
    success: true,
    message: result.message,
    data: { dashboardId: result.dashboardId }
  });
});

/**
 * Toggle favorite status of a dashboard
 */
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await DashboardService.toggleFavorite(id, req.user._id);

  res.json({
    success: true,
    message: result.message,
    data: { 
      dashboardId: id,
      isFavorite: result.isFavorite 
    }
  });
});

/**
 * Get user's favorite dashboards
 */
export const getFavoriteDashboards = asyncHandler(async (req, res) => {
  const favorites = await DashboardService.getFavoriteDashboards(req.user._id);

  res.json({
    success: true,
    data: { favorites }
  });
});

/**
 * Get dashboards with favorite status included
 */
export const getDashboardsWithFavoriteStatus = asyncHandler(async (req, res) => {
  const dashboards = await DashboardService.getDashboardsWithFavoriteStatus(req.user);

  res.json({
    success: true,
    data: { dashboards }
  });
});

/**
 * Reorder favorite dashboards
 */
export const reorderFavorites = asyncHandler(async (req, res) => {
  const { dashboardIdsOrder } = req.body;

  if (!Array.isArray(dashboardIdsOrder)) {
    return res.status(400).json({
      success: false,
      message: 'dashboardIdsOrder must be an array'
    });
  }

  const result = await DashboardService.reorderFavorites(req.user._id, dashboardIdsOrder);

  res.json({
    success: true,
    message: result.message,
    data: { order: result.order }
  });
});

/**
 * Add tags to a favorite dashboard
 */
export const tagFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  if (!tags) {
    return res.status(400).json({
      success: false,
      message: 'Tags are required'
    });
  }

  const result = await DashboardService.tagFavorite(id, req.user._id, tags);

  res.json({
    success: true,
    message: result.message,
    data: { 
      dashboardId: result.dashboardId,
      tags: result.tags 
    }
  });
});

/**
 * Remove tags from a favorite dashboard
 */
export const untagFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  if (!tags) {
    return res.status(400).json({
      success: false,
      message: 'Tags are required'
    });
  }

  const result = await DashboardService.untagFavorite(id, req.user._id, tags);

  res.json({
    success: true,
    message: result.message,
    data: { 
      dashboardId: result.dashboardId,
      tags: result.tags 
    }
  });
});

/**
 * Check if a dashboard is favorited by user
 */
export const checkIfFavorited = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await DashboardService.checkIfFavorited(id, req.user._id);

  res.json({
    success: true,
    data: { 
      dashboardId: id,
      isFavorited: result.isFavorited,
      addedAt: result.addedAt,
      tags: result.tags,
      order: result.order
    }
  });
});

/**
 * Get most favorited dashboards (admin only)
 */
export const getMostFavoritedDashboards = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const dashboards = await DashboardService.getMostFavoritedDashboards(req.user, parseInt(limit));

  res.json({
    success: true,
    data: { dashboards }
  });
});

// ====================== COMMENT FUNCTIONS ====================== //
// (These should already exist, but adding them for completeness)

export const getComments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comments = await DashboardService.getComments(id, req.user);

  res.json({
    success: true,
    data: { comments }
  });
});

export const createComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, parentId } = req.body;

  const comment = await DashboardService.createComment(id, req.user._id, message, parentId, req.app);

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: { comment }
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { message } = req.body;

  const comment = await DashboardService.updateComment(commentId, req.user._id, message, req.user);

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment }
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  await DashboardService.deleteComment(commentId, req.user);

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});