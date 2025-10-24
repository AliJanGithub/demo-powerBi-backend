import { User } from '../models/user.model.js';
import { UserService } from '../services/user.service.js';
import { asyncHandler, sanitizeUser } from '../utils/helpers.js';

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers(req.user);

  res.json({
    success: true,
    data: { users }
  });
});




export const updateUserName = asyncHandler(async (req, res) => {
  // ID of the user to update
  const { name } = req.body; 
  const userId=req.user._id;
  // New name from request body

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.name = name;  // Update only the name
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Name updated successfully',
    data: { id: user._id, name: user.name }
  });
});





export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserService.getUserById(id, req.user);

  res.json({
    success: true,
    data: { user: sanitizeUser(user) }
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserService.updateUser(id, req.body, req.user);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: sanitizeUser(user) }
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await UserService.deleteUser(id, req.user);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ✅ Change Password Controller
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id; // from authenticate middleware

  const user = await AuthService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: {
      user: sanitizeUser(user)
    }
  });
});

// ✅ Change Name Controller
export const changeName = asyncHandler(async (req, res) => {
  const { newName } = req.body;
  const userId = req.user._id;

  const user = await AuthService.changeName(userId, newName);

  res.json({
    success: true,
    message: 'Name updated successfully',
    data: {
      user: sanitizeUser(user)
    }
  });
});






export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.logo = {
    data: req.file.buffer,
    contentType: req.file.mimetype
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Logo uploaded successfully'
  });
});

// ✅ Get user/company logo
export const getLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user || !user.logo?.data) {
    return res.status(404).json({ success: false, message: 'Logo not found' });
  }

  res.set('Content-Type', user.logo.contentType);
  res.send(user.logo.data);
});
