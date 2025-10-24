import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { Dashboard } from '../models/dashboard.model.js';
import { createApiError } from '../utils/helpers.js';

export class UserService {
  static async getAllUsers(requestingUser) {
    let query = {};

    if (requestingUser.role === 'ADMIN') {
      query.company = requestingUser.company;
    }

    const users = await User.find(query)
      .select('-passwordHash -inviteTokenHash')
      .populate('company', 'name')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });

    return users;
  }

  static async getUserById(userId, requestingUser) {
    const user = await User.findById(userId)
      .select('-passwordHash -inviteTokenHash')
      .populate('company', 'name')
      .populate('invitedBy', 'name email');

    if (!user) {
      throw createApiError('User not found', 404);
    }

    if (requestingUser.role === 'ADMIN') {
      if (!user.company || user.company._id.toString() !== requestingUser.company.toString()) {
        throw createApiError('Access denied', 403);
      }
    }

    return user;
  }

  static async updateUser(userId, updateData, requestingUser) {
    const user = await User.findById(userId);

    if (!user) {
      throw createApiError('User not found', 404);
    }

    if (requestingUser.role === 'ADMIN') {
      if (!user.company || user.company.toString() !== requestingUser.company.toString()) {
        throw createApiError('Access denied', 403);
      }

      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        throw createApiError('Cannot modify admin users', 403);
      }
    }

    const allowedUpdates = ['name', 'isActive'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();

    return user;
  }

  static async deleteUser(userId, requestingUser) {
    const user = await User.findById(userId);

    if (!user) {
      throw createApiError('User not found', 404);
    }

    if (requestingUser.role === 'ADMIN') {
      if (!user.company || user.company.toString() !== requestingUser.company.toString()) {
        throw createApiError('Access denied', 403);
      }

      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        throw createApiError('Cannot delete admin users', 403);
      }
    }

    await Dashboard.updateMany(
      { accessUsers: userId },
      { $pull: { accessUsers: userId } }
    );

    await User.findByIdAndDelete(userId);
  }

  static async getAllCompanies() {
    const companies = await Company.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return companies;
  }
}
