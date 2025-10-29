

import nodemailer from 'nodemailer';
import { config } from '../configs/secrets.js';
import { logger } from '../configs/logger.js';

export class EmailService {
  constructor() {
    this.transporter = null;
  }

  async initialize() {
    if (!config.email.smtp.auth.user || !config.email.smtp.auth.pass) {
      logger.warn('Email configuration is incomplete. Emails will not be sent.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.secure,
        auth: config.email.smtp.auth
      });

      await this.transporter.verify();
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error.message);
    }
  }

  getTenantFrontendUrl(tenantName) {
    // Example:
    // tenantName = "abc"
    // FRONTEND_URL = "https://biportal365.com"
    // → returns "https://abc.biportal365.com"
    try {
      const baseUrl = new URL(config.frontendUrl);
      const domain = config.baseDomain || baseUrl.hostname;
      if (!tenantName) return config.frontendUrl;
      return `${baseUrl.protocol}//${tenantName}.${domain}`;
    } catch {
      return config.frontendUrl;
    }
  }


  async sendInviteEmail(email, name, role, inviteToken,tenantName) {
    if (!this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return;
    }

    const tenantFrontendUrl = this.getTenantFrontendUrl(tenantName);
    const inviteUrl = `${tenantFrontendUrl}/accept-invite?token=${inviteToken}`;
    const roleDisplay = role === 'ADMIN' ? 'Admin' : 'User';

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `You've been invited as ${roleDisplay}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Power BI Dashboard Portal</h2>
          <p>Hello ${name || 'there'},</p>
          <p>You have been invited to join as ${roleDisplay}.</p>
          <p>Please click the button below to accept your invitation and set your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}"
               style="background-color: #007bff; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
          <p>This invitation will expire in ${config.inviteTokenExpiry} hours.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Power BI Dashboard Portal - Secure Dashboard Sharing
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Invitation email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send invitation email:', error.message);
      throw new Error('Failed to send invitation email');
    }
  }

  async sendPasswordResetEmail(email, name, resetToken,tenantName) {
    if (!this.transporter) {
      logger.warn('Email service not configured. Skipping email send.');
      return;
    }

    
    const tenantFrontendUrl = this.getTenantFrontendUrl(tenantName);
    const resetUrl = `${tenantFrontendUrl}/forgot-password?token=${resetToken}`;

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name || 'there'},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #dc3545; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error.message);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();
