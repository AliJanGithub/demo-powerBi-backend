import { ThemeService } from '../services/theme.service.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /theme - Get user's theme
export const getTheme = asyncHandler(async (req, res) => {
  const theme = await ThemeService.getTheme(req.user._id);

  res.json({
    theme
  });
});

// PUT /theme/change - Update user's theme
export const updateTheme = asyncHandler(async (req, res) => {
  const { primaryColor, secondaryColor } = req.body;

  const theme = await ThemeService.updateTheme(req.user._id, {
    primaryColor,
    secondaryColor
  });

  res.json({
    success: true,
    theme
  });
});
