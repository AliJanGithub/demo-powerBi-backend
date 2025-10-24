import jwt from 'jsonwebtoken';
import { config } from '../configs/secrets.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { parseTimeToMs } from '../utils/helpers.js';

export class JWTService {
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );
  }

  static generateRefreshToken(userId, role) {
    return jwt.sign(
      { userId, role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );
  }

  static async storeRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + parseTimeToMs(config.jwt.refreshExpiry));

    await RefreshToken.create({
      user: userId,
      token,
      expiresAt
    });
  }

  static async verifyRefreshToken(token) {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    const storedToken = await RefreshToken.findOne({
      token,
      isRevoked: false
    }).populate('user');

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error('Refresh token expired');
    }

    return storedToken.user;
  }

  static async revokeRefreshToken(token) {
    await RefreshToken.updateOne(
      { token },
      { isRevoked: true }
    );
  }

  static async revokeAllUserTokens(userId) {
    await RefreshToken.updateMany(
      { user: userId },
      { isRevoked: true }
    );
  }

  static generateTokenPair(userId, role) {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId, role);

    return { accessToken, refreshToken };
  }
}
