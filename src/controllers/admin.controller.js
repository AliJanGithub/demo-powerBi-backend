import { AuthService } from '../services/auth.service.js';
import { asyncHandler, sanitizeUser } from '../utils/helpers.js';

export const inviteUser = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  const user = await AuthService.inviteUser(req.user._id, email, name);

  res.status(201).json({
    success: true,
    message: 'User invited successfully',
    data: {
      user: sanitizeUser(user)
    }
  });
});
