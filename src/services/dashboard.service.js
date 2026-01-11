import { Dashboard } from '../models/dashboard.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';
import { createApiError } from '../utils/helpers.js';
import { notificationService } from './notification.service.js';

export class DashboardService {
  static async createDashboard(adminId, dashboardData, app) {
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

    // Send notifications to all users invited by this admin (non-blocking)
    try {
      await notificationService.sendDashboardCreatedNotification(dashboard, admin, app);
    } catch (error) {
      // Log error but don't block dashboard creation
      console.error('Failed to send dashboard creation notifications:', error);
    }

    return dashboard;
  }

  static async getDashboardsByDepartment(department, requestingUser) {
    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      throw createApiError('Only admins can view department dashboards', 403);
    }

    const validDepartments = ['FINANCE', 'SALES', 'MARKETING', 'HR', 'GENERAL', 'OTHER'];
    if (!department || !validDepartments.includes(department)) {
      throw createApiError('Invalid or missing department', 400);
    }

    const dashboards = await Dashboard.find({
      company: requestingUser.company,
      department
    }).sort({ createdAt: -1 });

    return dashboards;
  }


  static async assignByDepartment(department, userIds, requestingUser, selectedDashboardIds = [], app) {
    if (requestingUser.role !== 'ADMIN') {
      throw createApiError('Only admins can assign dashboards', 403);
    }

    let dashboards;
    if (selectedDashboardIds.length > 0) {
      dashboards = await Dashboard.find({
        _id: { $in: selectedDashboardIds },
        company: requestingUser.company,
        department
      });
    } else {
      dashboards = await Dashboard.find({
        company: requestingUser.company,
        department
      });
    }

    if (!dashboards.length) {
      throw createApiError('No dashboards found to assign', 404);
    }

    // Send notifications for each dashboard
    for (const dashboard of dashboards) {
      await notificationService.sendDashboardAssignedNotification(
        dashboard,
        requestingUser,
        userIds,
        app
      );
    }

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

  static async assignDashboard(dashboardId, userIds, requestingUser, app) {
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

    dashboard.accessUsers = [...new Set([...dashboard.accessUsers.map(u => u.toString()), ...userIds])];
    await dashboard.save();
    await dashboard.populate('accessUsers', 'name email');

    // Send notifications
    const notifications = await notificationService.sendDashboardAssignedNotification(
      dashboard,
      requestingUser,
      userIds,
      app
    );

    return {
      dashboard,
      notifications,
      message: `Dashboard assigned to ${userIds.length} user(s)`
    };
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

  static checkDashboardAccess(dashboard, user) {
    if (!dashboard || !user) return false;

    if (user.role === 'SUPER_ADMIN') return true;

    if (user.role === 'ADMIN' &&
        dashboard.createdBy?._id?.toString() === user._id.toString()) {
      return true;
    }

    if (user.role === 'USER' &&
        Array.isArray(dashboard.accessUsers) &&
        dashboard.accessUsers.some(u => u._id?.toString() === user._id.toString())) {
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

    const comments = await Comment.find({ dashboard: dashboardId, parent: null })
      .populate('user', 'name email')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    return comments;
  }

  static async createComment(dashboardId, userId, message, parentId = null, app) {
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

    // Send comment notifications to all dashboard users (except sender)
    await notificationService.sendCommentNotifications({
      dashboard,
      comment,
      sender: user,
      app
    });

    // Send mention notifications for @username mentions
    await notificationService.sendMentionNotifications({
      commentText: message,
      dashboard,
      comment,
      sender: user,
      app
    });

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














  
  // ... existing methods ... 

  /**
   * Add dashboard to user's favorites
   */
  static async addFavorite(dashboardId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    // Check if user has access to dashboard
    const hasAccess = this.checkDashboardAccess(dashboard, user);
    if (!hasAccess) {
      throw createApiError('You must have access to the dashboard to favorite it', 403);
    }

    // Check if already favorited
    const isAlreadyFavorited = user.favoriteDashboards.some(
      fav => fav.dashboardId.toString() === dashboardId
    );

    if (isAlreadyFavorited) {
      throw createApiError('Dashboard already in favorites', 400);
    }

    // Add to favorites
    user.favoriteDashboards.push({
      dashboardId: dashboard._id,
      order: user.favoriteDashboards.length
    });

    await user.save();
    
    // Increment favorite count on dashboard (if you add this field)
    // await Dashboard.findByIdAndUpdate(dashboardId, { $inc: { favoriteCount: 1 } });

    return {
      message: 'Dashboard added to favorites',
      dashboard: {
        id: dashboard._id,
        title: dashboard.title,
        department: dashboard.department
      }
    };
  }

  /**
   * Remove dashboard from user's favorites
   */
  static async removeFavorite(dashboardId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    const originalLength = user.favoriteDashboards.length;
    user.favoriteDashboards = user.favoriteDashboards.filter(
      fav => fav.dashboardId.toString() !== dashboardId
    );

    // If nothing was removed, it wasn't in favorites
    if (user.favoriteDashboards.length === originalLength) {
      throw createApiError('Dashboard not found in favorites', 404);
    }

    await user.save();
    
    // Decrement favorite count on dashboard (if you add this field)
    // await Dashboard.findByIdAndUpdate(dashboardId, { $inc: { favoriteCount: -1 } });

    return {
      message: 'Dashboard removed from favorites',
      dashboardId
    };
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(dashboardId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      throw createApiError('Dashboard not found', 404);
    }

    // Check if user has access to dashboard
    const hasAccess = this.checkDashboardAccess(dashboard, user);
    if (!hasAccess) {
      throw createApiError('You must have access to the dashboard to favorite it', 403);
    }

    const existingIndex = user.favoriteDashboards.findIndex(
      fav => fav.dashboardId.toString() === dashboardId
    );

    if (existingIndex !== -1) {
      // Remove from favorites
      user.favoriteDashboards.splice(existingIndex, 1);
      // Update order for remaining items
      user.favoriteDashboards.forEach((fav, index) => {
        fav.order = index;
      });
      await user.save();
      
      // Decrement favorite count (if you add this field)
      // await Dashboard.findByIdAndUpdate(dashboardId, { $inc: { favoriteCount: -1 } });
      
      return {
        isFavorite: false,
        message: 'Dashboard removed from favorites'
      };
    } else {
      // Add to favorites
      user.favoriteDashboards.push({
        dashboardId: dashboard._id,
        order: user.favoriteDashboards.length
      });
      await user.save();
      
      // Increment favorite count (if you add this field)
      // await Dashboard.findByIdAndUpdate(dashboardId, { $inc: { favoriteCount: 1 } });
      
      return {
        isFavorite: true,
        message: 'Dashboard added to favorites'
      };
    }
  }

  /**
   * Get user's favorite dashboards with full details
   */
  static async getFavoriteDashboards(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'favoriteDashboards.dashboardId',
        populate: [
          { path: 'createdBy', select: 'name email' },
          { path: 'company', select: 'name' }
        ]
      });

    if (!user) {
      throw createApiError('User not found', 404);
    }

    // Filter out any null dashboard references and sort by order
    const favorites = user.favoriteDashboards
      .filter(fav => fav.dashboardId) // Remove deleted dashboards
      .sort((a, b) => a.order - b.order)
      .map(fav => ({
        ...fav.dashboardId.toObject(),
        favoritedAt: fav.addedAt,
        favoriteTags: fav.tags || [],
        favoriteOrder: fav.order
      }));

    return favorites;
  }

  /**
   * Reorder favorite dashboards
   */
  static async reorderFavorites(userId, dashboardIdsOrder) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    // Validate all IDs belong to user's favorites
    const userFavoriteIds = user.favoriteDashboards.map(fav => 
      fav.dashboardId.toString()
    );
    
    const invalidIds = dashboardIdsOrder.filter(
      id => !userFavoriteIds.includes(id)
    );
    
    if (invalidIds.length > 0) {
      throw createApiError('Some dashboards are not in your favorites', 400);
    }

    // Reorder based on provided array
    const favoritesMap = new Map();
    user.favoriteDashboards.forEach(fav => {
      favoritesMap.set(fav.dashboardId.toString(), fav);
    });

    user.favoriteDashboards = dashboardIdsOrder.map((id, index) => {
      const fav = favoritesMap.get(id);
      fav.order = index;
      return fav;
    });

    await user.save();

    return {
      message: 'Favorites reordered successfully',
      order: dashboardIdsOrder
    };
  }

  /**
   * Add tags to a favorite dashboard
   */
  static async tagFavorite(dashboardId, userId, tags) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    const favorite = user.favoriteDashboards.find(
      fav => fav.dashboardId.toString() === dashboardId
    );

    if (!favorite) {
      throw createApiError('Dashboard not found in favorites', 404);
    }

    // Add new tags, remove duplicates
    const existingTags = favorite.tags || [];
    const newTags = Array.isArray(tags) ? tags : [tags];
    favorite.tags = [...new Set([...existingTags, ...newTags])];

    await user.save();

    return {
      message: 'Tags added to favorite',
      dashboardId,
      tags: favorite.tags
    };
  }

  /**
   * Remove tags from a favorite dashboard
   */
  static async untagFavorite(dashboardId, userId, tagsToRemove) {
    const user = await User.findById(userId);
    if (!user) {
      throw createApiError('User not found', 404);
    }

    const favorite = user.favoriteDashboards.find(
      fav => fav.dashboardId.toString() === dashboardId
    );

    if (!favorite) {
      throw createApiError('Dashboard not found in favorites', 404);
    }

    const tagsToRemoveArray = Array.isArray(tagsToRemove) ? tagsToRemove : [tagsToRemove];
    favorite.tags = (favorite.tags || []).filter(
      tag => !tagsToRemoveArray.includes(tag)
    );

    await user.save();

    return {
      message: 'Tags removed from favorite',
      dashboardId,
      tags: favorite.tags
    };
  }

  /**
   * Check if a dashboard is favorited by user
   */
  static async checkIfFavorited(dashboardId, userId) {
    const user = await User.findById(userId);
    if (!user) {
      return { isFavorited: false };
    }

    const isFavorited = user.favoriteDashboards.some(
      fav => fav.dashboardId.toString() === dashboardId
    );

    const favoriteData = isFavorited 
      ? user.favoriteDashboards.find(fav => fav.dashboardId.toString() === dashboardId)
      : null;

    return {
      isFavorited,
      addedAt: favoriteData?.addedAt,
      tags: favoriteData?.tags || [],
      order: favoriteData?.order
    };
  }

  /**
   * Get dashboards with favorite status for authenticated user
   * Enhanced version of getDashboards that includes favorite status
   */
  static async getDashboardsWithFavoriteStatus(requestingUser) {
    const dashboards = await this.getDashboards(requestingUser);
    
    // Get user's favorite dashboard IDs
    const user = await User.findById(requestingUser._id).select('favoriteDashboards');
    const favoriteIds = new Set(
      user.favoriteDashboards.map(fav => fav.dashboardId.toString())
    );
    
    // Add favorite status to each dashboard
    return dashboards.map(dashboard => ({
      ...dashboard.toObject(),
      isFavorite: favoriteIds.has(dashboard._id.toString())
    }));
  }

  /**
   * Get most favorited dashboards (admin only)
   */
  static async getMostFavoritedDashboards(requestingUser, limit = 10) {
    if (requestingUser.role !== 'ADMIN' && requestingUser.role !== 'SUPER_ADMIN') {
      throw createApiError('Only admins can view favorited dashboards analytics', 403);
    }

    // This requires aggregating across users to count favorites
    const users = await User.find({
      company: requestingUser.company
    }).select('favoriteDashboards');

    // Count favorites across all users
    const favoriteCounts = {};
    users.forEach(user => {
      user.favoriteDashboards.forEach(fav => {
        const dashboardId = fav.dashboardId.toString();
        favoriteCounts[dashboardId] = (favoriteCounts[dashboardId] || 0) + 1;
      });
    });

    // Sort by favorite count
    const sortedDashboardIds = Object.entries(favoriteCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([dashboardId]) => dashboardId);

    // Get dashboard details
    const dashboards = await Dashboard.find({
      _id: { $in: sortedDashboardIds },
      company: requestingUser.company
    })
      .populate('createdBy', 'name email')
      .populate('company', 'name');

    // Map back with favorite counts and maintain order
    return sortedDashboardIds.map(dashboardId => {
      const dashboard = dashboards.find(d => d._id.toString() === dashboardId);
      return {
        ...dashboard.toObject(),
        favoriteCount: favoriteCounts[dashboardId] || 0
      };
    }).filter(Boolean);
  }
}
