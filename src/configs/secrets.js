import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://alijan061333_db_user:wxoHsGGpmrvKOv9q@cluster0.1vhmsiz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '40m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE==='true' ,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
  },

  frontendUrl: process.env.FRONTEND_URL || 'https://biportal365.com',
  inviteTokenExpiry: parseInt(process.env.INVITE_TOKEN_EXPIRY || '72'),
  baseDomain :process.env.BASE_DOMAIN
};
