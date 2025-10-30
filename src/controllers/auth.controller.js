import { AuthService } from '../services/auth.service.js';
import { asyncHandler, sanitizeUser } from '../utils/helpers.js';
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // const tenant = req.tenant;/

  const { user, accessToken, refreshToken } = await AuthService.login(email, password);
  // const { user, accessToken, refreshToken } = await AuthService.login(email, password, tenant);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    }
  });
});


export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const { user, accessToken, refreshToken: newRefreshToken } = await AuthService.refreshTokens(
    refreshToken
  );

  res.json({
    success: true,
    message: 'Tokens refreshed',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken
    }
  });
});






export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // The service handles sending the email and preventing enumeration attacks.
    const { message } = await AuthService.forgotPasswordRequest(email);

    // Always return a generic success message to the client for security.
    res.json({
        success: true,
        message: message || 'Password reset link successfully requested. Check your inbox.'
    });
});

/**
 * Handles the request to finalize the password reset with a new password and token.
 */
export const resetPassword = asyncHandler(async (req, res) => {
    // The token comes from the URL/query params, and the password comes from the body.
    const token = req.params.token || req.query.token || req.body.token;
     console.log("tokennnnnnnnnnn",token)
    const { password: newPassword } = req.body;

    const { user, accessToken, refreshToken } = await AuthService.resetPassword(token, newPassword);

    // Return the user and new tokens, acting as an automatic login
    res.json({
        success: true,
        message: 'Password reset successfully. You are now logged in.',
        data: {
            user: sanitizeUser(user),
            accessToken,
            refreshToken
        }
    });
});









export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await AuthService.logout(refreshToken);

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export const acceptInvite = asyncHandler(async (req, res) =>
   { const { token, password, name } = req.body;
 const { user, accessToken, refreshToken } = await AuthService.acceptInvite( token, password, name );
  res.json({ success: true, message: 'Invitation accepted successfully',
     data: { user: sanitizeUser(user), accessToken, refreshToken } });
     });
 export const me = asyncHandler(async (req, res) =>
       { res.json({ success: true, data: { user: sanitizeUser(req.user) } }); 
    })


export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const dbUser = await AuthService.getUserById(user._id);
  const isMatch = await dbUser.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  await dbUser.hashPassword(newPassword);
  await dbUser.save();

  res.json({ success: true, message: 'Password changed successfully' });
});


export const changeName = asyncHandler(async (req, res) => {
  const { newName } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const dbUser = await AuthService.getUserById(user._id);
  dbUser.name = newName;
  await dbUser.save();

  res.json({
    success: true,
    message: 'Name updated successfully',
    data: { name: dbUser.name },
  });
});


