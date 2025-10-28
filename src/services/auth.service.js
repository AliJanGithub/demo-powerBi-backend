import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';
import { JWTService } from './jwt.service.js';
import { emailService } from './email.service.js';
import { generateToken, hashToken, createApiError } from '../utils/helpers.js';
import { config } from '../configs/secrets.js';

export class AuthService {
  // static async login(email, password) {
  //  const user = await User.findOne({ email })
  // .populate({
  //   path: 'company',
  //   select: 'name createdBy', // include createdBy so we can populate it next
  //   populate: {
  //     path: 'createdBy',
  //     select: 'name email role' // fields from User model
  //   }
  // });


  //   if (!user || !user.passwordHash) {
  //     throw createApiError('Invalid credentials', 401);
  //   }

  //   const isPasswordValid = await user.comparePassword(password);

  //   if (!isPasswordValid) {
  //     throw createApiError('Invalid credentials', 401);
  //   }

  //   if (!user.isActive) {
  //     throw createApiError('Account is inactive', 403);
  //   }

  //   const { accessToken, refreshToken } = JWTService.generateTokenPair(user._id, user.role,user.company?._id);
  //   await JWTService.storeRefreshToken(user._id, refreshToken);

  //   return { user, accessToken, refreshToken };
  // }
  static async login(email, password, tenant) {
  const user = await User.findOne({ email }).populate({
    path: 'company',
    select: 'name createdBy',
    populate: {
      path: 'createdBy',
      select: 'name email role'
    }
  });

  if (!user || !user.passwordHash) {
    throw createApiError('Invalid credentials', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createApiError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw createApiError('Account is inactive', 403);
  }

  // 🚨 Enforce tenant match
  if (tenant && user.company?._id.toString() !== tenant._id.toString()) {
    throw createApiError('User does not belong to this tenant.', 403);
  }

  const { accessToken, refreshToken } = JWTService.generateTokenPair(user._id, user.role, user.company?._id);
  await JWTService.storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
}


  static async getUserById(id) {
  return User.findById(id);
}








 static async forgotPasswordRequest(email) {
        const user = await User.findOne({ email });

        if (!user) {
            // Important: Return a success message even if the user is not found,
            // to prevent email enumeration attacks.
            return { message: 'If an account with that email exists, a password reset link has been sent.' };
        }

        // 1. Generate a secure, short-lived token
        const resetToken = generateToken();
        // const resetTokenHash = hashToken(resetToken);
        // Token expires in 1 hour (config.resetTokenExpiry is in hours, assuming 1)
        const resetExpiresAt = new Date(Date.now() + config.resetTokenExpiry * 60 * 60 * 1000);

        // 2. Save the token hash and expiry to the user document
        user.passwordResetTokenHash = resetToken;
        user.passwordResetExpiresAt = resetExpiresAt;
        await user.save({ validateBeforeSave: false }); // Bypass validation like 'required password'

        // 3. Send the email with the reset link containing the raw token
        await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

        return { message: 'Password reset link sent successfully.' };
    }

  
    static async resetPassword(token, newPassword) {
        // const tokenHash = hashToken(token);
        // console.log("tokennnn hash ",tokenHash)

        // 1. Find user by the hashed token and check expiry
        const user = await User.findOne({
            passwordResetTokenHash: token
        });
     console.log("user",user)
        if (!user) {
            throw createApiError('Invalid or expired password reset token.', 400);
        }

        // 2. Update the password
        await user.hashPassword(newPassword);

        // 3. Clear the reset token fields and save
        user.passwordResetTokenHash = undefined;
        user.passwordResetExpiresAt = undefined;

        // If the user was invited but never set a password, this completes their setup
        if (!user.isActive) {
            user.isActive = true;
            user.inviteTokenHash = undefined;
            user.inviteExpiresAt = undefined;
        }

        await user.save();

        // 4. Optionally: Log the user in and return tokens, or just return success
        // We'll return tokens for a smooth transition to the authenticated state.
        const { accessToken, refreshToken } = JWTService.generateTokenPair(user._id, user.role,  user.company?._id);
        await JWTService.storeRefreshToken(user._id, refreshToken);

        return { user, accessToken, refreshToken };
    }









// ✅ Change Password
static async changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw createApiError('Current password is incorrect', 400);
  }

  // Hash and set new password
  await user.hashPassword(newPassword);
  await user.save();

  return user;
}

// ✅ Change Name
static async changeName(userId, newName) {
  const user = await User.findById(userId);
  if (!user) {
    throw createApiError('User not found', 404);
  }

  user.name = newName.trim();
  await user.save();

  return user;
}





  static async refreshTokens(refreshToken) {
    try {
      const user = await JWTService.verifyRefreshToken(refreshToken);

      await JWTService.revokeRefreshToken(refreshToken);

      const { accessToken, refreshToken: newRefreshToken } = JWTService.generateTokenPair(
        user._id,
        user.role,
          user.company?._id
      );
      await JWTService.storeRefreshToken(user._id, newRefreshToken);

      return { user, accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw createApiError('Invalid or expired refresh token', 401);
    }
  }

  static async logout(refreshToken) {
    if (refreshToken) {
      await JWTService.revokeRefreshToken(refreshToken);
    }
  }

  static async inviteAdmin(superAdminId, email, companyName,subdomain, name = null) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createApiError('User with this email already exists', 400);
    }

    let company = await Company.findOne({ name: companyName });

    if (!company) {
      company = await Company.create({
        name: companyName,
        createdBy: superAdminId,
        subdomain
      });
    }

    const inviteToken = generateToken();
    const inviteTokenHash = hashToken(inviteToken);
    const inviteExpiresAt = new Date(Date.now() + config.inviteTokenExpiry * 60 * 60 * 1000);

    const admin = await User.create({
      email,
      name,
      role: 'ADMIN',
      company: company._id,
      invitedBy: superAdminId,
      inviteTokenHash,
      inviteExpiresAt,
      isActive: false
    });

    await emailService.sendInviteEmail(email, name, 'ADMIN', inviteToken);

    return { admin, company };
  }

  static async inviteUser(adminId, email, name = null) {
    const admin = await User.findById(adminId).populate('company');

    if (!admin || admin.role !== 'ADMIN') {
      throw createApiError('Only admins can invite users', 403);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createApiError('User with this email already exists', 400);
    }

    const inviteToken = generateToken();
    const inviteTokenHash = hashToken(inviteToken);
    const inviteExpiresAt = new Date(Date.now() + config.inviteTokenExpiry * 60 * 60 * 1000);

    const user = await User.create({
      email,
      name,
      role: 'USER',
      company: admin.company._id,
      invitedBy: adminId,
      inviteTokenHash,
      inviteExpiresAt,
      isActive: false
    });

    await emailService.sendInviteEmail(email, name, 'USER', inviteToken);

    return user;
  }

  static async acceptInvite(token, password, name = null) {
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      inviteTokenHash: tokenHash,
      inviteExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw createApiError('Invalid or expired invitation token', 400);
    }

    await user.hashPassword(password);

    if (name) {
      user.name = name;
    }

    user.isActive = true;
    user.inviteTokenHash = undefined;
    user.inviteExpiresAt = undefined;

    await user.save();

    const { accessToken, refreshToken } = JWTService.generateTokenPair(user._id, user.role,  user.company?._id);
    await JWTService.storeRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
  }
}
