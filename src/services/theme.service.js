import { User } from '../models/user.model.js';
import { createApiError } from '../utils/helpers.js';

export class ThemeService {
  static async getTheme(userId) {
    const user = await User.findById(userId).select('theme');

    if (!user) {
      throw createApiError('User not found', 404);
    }

    return user.theme || {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981'
    };
  }

  static async updateTheme(userId, themeData) {
    const { primaryColor, secondaryColor } = themeData;

    const user = await User.findById(userId);

    if (!user) {
      throw createApiError('User not found', 404);
    }

    user.theme = {
      primaryColor: primaryColor || user.theme?.primaryColor || '#3B82F6',
      secondaryColor: secondaryColor || user.theme?.secondaryColor || '#10B981'
    };

    await user.save();

    return user.theme;
  }
}
