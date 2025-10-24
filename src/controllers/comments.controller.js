import { DashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/helpers.js';

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
    // const notificationSocket = req.app.get('notificationSocket');
  const comment = await DashboardService.createComment(id, req.user._id, message, parentId,req.app);

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: { comment }
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const comment = await DashboardService.updateComment(id, req.user._id, message, req.user);

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment }
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await DashboardService.deleteComment(id, req.user);

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
});
