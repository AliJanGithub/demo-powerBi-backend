import { Dashboard } from '../models/dashboard.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';
import { createApiError } from '../utils/helpers.js';
import { Notification } from '../models/notification.model.js';

export class DashboardService {
  // static async createDashboard(creatorId, dashboardData) {
  //   const creator = await User.findById(creatorId);

  //   if (creator.role !== 'ADMIN') {
  //     throw createApiError('Only admins can create dashboards', 403);
  //   }

  //   const dashboard = await Dashboard.create({
  //     ...dashboardData,
  //     createdBy: creatorId,
  //     company: creator.company
  //   });

  //   await dashboard.populate('createdBy', 'name email');
  //   await dashboard.populate('company', 'name');

  //   return dashboard;
  // }

static async createDashboard(adminId, dashboardData) {
  const admin = await User.findById(adminId);

  if (!admin || admin.role !== 'ADMIN') {
    throw createApiError('Only admins can create dashboards', 403);
  }

  const { title, embedUrl, description, department, tags } = dashboardData;

  if (!department || !['FINANCE', 'SALES', 'MARKETING', 'GENERAL', 'OTHER', 'HR'].includes(department)) {
    throw createApiError('Invalid or missing department', 400);
  }

  const dashboard = await Dashboard.create({
    title,
    embedUrl,
    description,
    department,
    tags,
    createdBy: admin._id,
    company: admin.company
  });

  return dashboard;
}



// static async assignByDepartment(department, userIds, requestingUser) {
//   if (requestingUser.role !== 'ADMIN') {
//     throw createApiError('Only admins can assign dashboards', 403);
//   }

//   const dashboards = await Dashboard.find({
//     company: requestingUser.company,
//     department
//   });

//   if (!dashboards.length) {
//     throw createApiError('No dashboards found for this department', 404);
//   }
//  for (const userId of userIds) {
//     const notification = await Notification.create({
//       recipient: userId,
//       sender: requestingUser._id,
//       type: 'NEW_DASHBOARD',
//       message: `A new dashboard from ${department} department has been assigned to you.`,
//     });

//     // Emit socket notification
//     const notificationSocket = req.app.get('notificationSocket');
//     if (notificationSocket) {
//       notificationSocket.sendToUser(userId, notification);
//     }
//   }
//   const dashboardIds = dashboards.map(d => d._id);

//   await Dashboard.updateMany(
//     { _id: { $in: dashboardIds } },
//     { $addToSet: { accessUsers: { $each: userIds } } }
//   );

//   return dashboards;
// }

// Get all dashboards of a specific department
static async getDashboardsByDepartment(department, requestingUser) {
  try {
   // assuming you use auth middleware

    // Validate role
    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      throw createApiError('Only admins can view department dashboards', 403);
    }

    // Validate department
    const validDepartments = ['FINANCE', 'SALES', 'MARKETING', 'HR', 'GENERAL', 'OTHER'];
    if (!department || !validDepartments.includes(department)) {
      throw createApiError('Invalid or missing department', 400);
    }

    // Fetch dashboards for this department and company
    const dashboards = await Dashboard.find({
      company: requestingUser.company,
      department
    }).sort({ createdAt: -1 });

    if (!dashboards.length) {
      return createApiError("no dashboard found",401)
    }
return dashboards
    // res.status(200).json({
    //   success: true,
    //   message: `Dashboards for ${department} department fetched successfully`,
    //   data: dashboards
    // });

  } catch (error) {
   throw createApiError("Invalid errors",401)
  }
}


static async assignByDepartment(department, userIds, requestingUser, selectedDashboardIds = []) {
  if (requestingUser.role !== 'ADMIN') {
    throw createApiError('Only admins can assign dashboards', 403);
  }

  // ✅ Determine which dashboards to assign
  let dashboards;

  if (selectedDashboardIds.length > 0) {
    // Assign only selected dashboards
    dashboards = await Dashboard.find({
      _id: { $in: selectedDashboardIds },
      company: requestingUser.company,
      department
    });
  } else {
    // Assign all dashboards from that department
    dashboards = await Dashboard.find({
      company: requestingUser.company,
      department
    });
  }

  if (!dashboards.length) {
    throw createApiError('No dashboards found to assign', 404);
  }

  // ✅ Notify each user
  for (const userId of userIds) {
    const notification = await Notification.create({
      recipient: userId,
      sender: requestingUser._id,
      type: 'NEW_DASHBOARD',
      message: `New ${department} dashboard(s) have been assigned to you.`,
    });

    // If using socket notifications
    if (requestingUser.req?.app) {
      const notificationSocket = requestingUser.req.app.get('notificationSocket');
      if (notificationSocket) {
        notificationSocket.sendToUser(userId, notification);
      }
    }
  }

  // ✅ Assign dashboards to users
  const dashboardIds = dashboards.map(d => d._id);

  await Dashboard.updateMany(
    { _id: { $in: dashboardIds } },
    { $addToSet: { accessUsers: { $each: userIds } } }
  );

  return dashboards;
}


  static async getDashboards(requestingUser) {
    let query = {};

    if (requestingUser.role === 'SUPER_ADMIN') {
      // Super admin can see all dashboards
    } else if (requestingUser.role === 'ADMIN') {
      query.createdBy = requestingUser._id;
    } else if (requestingUser.role === 'USER') {
      query.accessUsers = requestingUser._id;
    }

    const dashboards = await Dashboard.find(query)
      .populate('createdBy', 'name email')
      .populate('company', 'name')
      .populate('accessUsers', 'name email')
      .sort({ createdAt: -1 });

    return dashboards;
  }

  static async getDashboardById(dashboardId, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId)
      .populate('createdBy', 'name email')
      .populate('company', 'name')
      .populate('accessUsers', 'name email');

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    const hasAccess = this.checkDashboardAccess(dashboard, requestingUser);

    if (!hasAccess) {
      throw createApiError('Access denied', 403);
    }

    return dashboard;
  }

  static async updateDashboard(dashboardId, updateData, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    if (requestingUser.role !== 'SUPER_ADMIN' &&
        dashboard.createdBy.toString() !== requestingUser._id.toString()) {
      throw createApiError('Only the creator can update this dashboard', 403);
    }

    const allowedUpdates = ['title', 'embedUrl', 'description', 'tags'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        dashboard[key] = updateData[key];
      }
    });

    await dashboard.save();
    await dashboard.populate('createdBy', 'name email');
    await dashboard.populate('company', 'name');
    await dashboard.populate('accessUsers', 'name email');

    return dashboard;
  }

  static async deleteDashboard(dashboardId, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    if (requestingUser.role !== 'SUPER_ADMIN' &&
        dashboard.createdBy.toString() !== requestingUser._id.toString()) {
      throw createApiError('Only the creator can delete this dashboard', 403);
    }

    await Comment.deleteMany({ dashboard: dashboardId });
    await Dashboard.findByIdAndDelete(dashboardId);
  }

  static async assignDashboard(dashboardId, userIds, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    if (requestingUser.role !== 'ADMIN' &&
        dashboard.createdBy.toString() !== requestingUser._id.toString()) {
      throw createApiError('Only the creator can assign this dashboard', 403);
    }

    const users = await User.find({
      _id: { $in: userIds },
      company: dashboard.company,
      role: 'USER'
    });

    if (users.length !== userIds.length) {
      throw createApiError('Some users are invalid or not in the same company', 400);
    }

    dashboard.accessUsers = [...new Set([...dashboard.accessUsers, ...userIds])];
    await dashboard.save();
    await dashboard.populate('accessUsers', 'name email');

    return dashboard;
  }

  static async unassignDashboard(dashboardId, userIds, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    if (requestingUser.role !== 'SUPER_ADMIN' &&
        dashboard.createdBy.toString() !== requestingUser._id.toString()) {
      throw createApiError('Only the creator can unassign this dashboard', 403);
    }

    dashboard.accessUsers = dashboard.accessUsers.filter(
      userId => !userIds.includes(userId.toString())
    );

    await dashboard.save();
    await dashboard.populate('accessUsers', 'name email');

    return dashboard;
  }

  // static checkDashboardAccess(dashboard, user) {
  //   if (user.role === 'SUPER_ADMIN') {
  //     return true;
  //   }

  //   if (user.role === 'ADMIN' && dashboard.createdBy.toString() === user._id.toString()) {
  //     return true;
  //   }

  //   if (user.role === 'USER' && dashboard.accessUsers.some(u => u.toString() === user._id.toString())) {
  //     return true;
  //   }

  //   return false;
  // }
  static checkDashboardAccess(dashboard, user) {
    if (!dashboard || !user) return false;

    // Super admin can see everything
    if (user.role === 'SUPER_ADMIN') return true;

    // Admin can see their own dashboards
    if (
      user.role === 'ADMIN' &&
      dashboard.createdBy?._id?.toString() === user._id.toString()
    ) {
      return true;
    }

    // User can see dashboards they have access to
    if (
      user.role === 'USER' &&
      Array.isArray(dashboard.accessUsers) &&
      dashboard.accessUsers.some(u => u._id?.toString() === user._id.toString())
    ) {
      return true;
    }

    return false;
  }

  static async getComments(dashboardId, requestingUser) {
    const dashboard = await Dashboard.findById(dashboardId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    const hasAccess = this.checkDashboardAccess(dashboard, requestingUser);

    if (!hasAccess) {
      throw createApiError('Access denied', 403);
    }

    // const comments = await Comment.find({ dashboard: dashboardId, parent: null })
    //   .populate('user', 'name email')
    //   .populate({
    //     path: 'replies',
    //     populate: { path: 'user', select: 'name email' }
    //   })
    //   .sort({ createdAt: -1 });
// dashboard.service.js (inside getComments)

    const comments = await Comment.find({ dashboard: dashboardId, parent: null })
      .populate('user', 'name email')
      .populate({
        path: 'replies', // ✅ This is now a valid virtual field!
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    
    return comments;
  }

  static async createComment(dashboardId, userId, message, parentId = null,app) {
    const dashboard = await Dashboard.findById(dashboardId);
    const user = await User.findById(userId);

    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    const hasAccess = this.checkDashboardAccess(dashboard, user);

    if (!hasAccess) {
      throw createApiError('Access denied', 403);
    }

    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.dashboard.toString() !== dashboardId) {
        throw createApiError('Invalid parent comment', 400);
      }
    }

    const comment = await Comment.create({
      dashboard: dashboardId,
      user: userId,
      message,
      parent: parentId
    });





    await comment.populate('user', 'name email');

 const allRecipients = [
    dashboard.createdBy.toString(), // Convert to string early
    ...dashboard.accessUsers.map(u => u.toString()) // Convert all to strings
];
const uniqueRecipients = new Set(allRecipients);
console.log("USERS TO CHECK:", Array.from(uniqueRecipients)); // Should show Admin and User IDs
const recipientsToSend = Array.from(uniqueRecipients).filter(
    (recipientId) => recipientId !== userId.toString()
)
console.log("RECIPIENTS TO SEND:", recipientsToSend); // Should show only the other user's ID
// send notifications
 const notificationSocket = app.get('notificationSocket');
for (const recipient of recipientsToSend) {
  const notification = await Notification.create({
    recipient,
    sender: userId,
    type: 'COMMENT',
    dashboard: dashboardId,
    message: `${user.name} commented on the ${dashboard.title} dashboard.`
  });

 
  if (notificationSocket) {
    
    notificationSocket.sendToUser(recipient, notification);
  }
}


    return comment;
  }

  static async updateComment(commentId, userId, message, requestingUser) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw createApiError('Comment not found', 404);
    }

    if (comment.user.toString() !== userId) {
      throw createApiError('You can only edit your own comments', 403);
    }

    comment.message = message;
    comment.edited = true;
    await comment.save();
    await comment.populate('user', 'name email');

    return comment;
  }

  static async deleteComment(commentId, requestingUser) {
    const comment = await Comment.findById(commentId).populate('dashboard');

    if (!comment) {
      throw createApiError('Comment not found', 404);
    }

    const isOwner = comment.user.toString() === requestingUser._id.toString();
    const isAdminOfCompany = requestingUser.role === 'ADMIN' &&
      comment.dashboard.company.toString() === requestingUser.company.toString();
    const isSuperAdmin = requestingUser.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdminOfCompany && !isSuperAdmin) {
      throw createApiError('Access denied', 403);
    }

    await Comment.deleteMany({ parent: commentId });
    await Comment.findByIdAndDelete(commentId);
  }
}
