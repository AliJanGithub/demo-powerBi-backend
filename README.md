# Power BI Dashboard Sharing Portal - Backend

Secure Node.js backend for Power BI Dashboard Sharing Portal with role-based access control.

## Features

- **3-Tier Role System**: Super Admin, Admin, and User roles with fine-grained permissions
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Email Invitations**: Email-based user invitations with token validation
- **Dashboard Management**: Full CRUD operations for Power BI dashboard sharing
- **Real-time Comments**: WebSocket-based commenting system with Socket.IO
- **Company Management**: Multi-tenant support with company isolation
- **Audit Logging**: Comprehensive audit trail for security and compliance
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Request validation with express-validator

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Email**: Nodemailer
- **WebSockets**: Socket.IO
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Mongoose models
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── sockets/         # WebSocket handlers
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── index.js         # Server entry point
├── package.json
└── .env.example
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env` file:**
   ```env
   NODE_ENV=development
   PORT=5000

   MONGODB_URI=mongodb://localhost:27017/powerbi-dashboard-portal

   JWT_ACCESS_SECRET=your_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   EMAIL_FROM=noreply@yourdomain.com

   FRONTEND_URL=http://localhost:3000
   INVITE_TOKEN_EXPIRY=72
   ```

4. **Start MongoDB:**
   ```bash
   mongod
   ```

5. **Run the server:**
   ```bash
   npm start
   ```

## API Documentation

### Authentication APIs

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

#### Accept Invitation
```http
POST /api/auth/accept-invite
Content-Type: application/json

{
  "token": "invitation_token",
  "password": "newpassword123",
  "name": "John Doe"
}
```

### Super Admin APIs

#### Invite Admin
```http
POST /api/superadmin/invite-admin
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "admin@company.com",
  "companyName": "Acme Corp",
  "name": "Jane Admin"
}
```

#### Get All Companies
```http
GET /api/superadmin/companies
Authorization: Bearer {access_token}
```

#### Get All Dashboards
```http
GET /api/superadmin/dashboards
Authorization: Bearer {access_token}
```

### Admin APIs

#### Invite User
```http
POST /api/admin/invite-user
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "user@company.com",
  "name": "John User"
}
```

### Dashboard APIs

#### Create Dashboard
```http
POST /api/dashboards
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Sales Dashboard",
  "embedUrl": "https://app.powerbi.com/...",
  "description": "Q4 Sales Analytics",
  "tags": ["sales", "q4"]
}
```

#### Get Dashboards
```http
GET /api/dashboards
Authorization: Bearer {access_token}
```

#### Assign Dashboard to Users
```http
POST /api/dashboards/{id}/assign
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2"]
}
```

### Comment APIs

#### Get Comments
```http
GET /api/comments/dashboard/{dashboard_id}
Authorization: Bearer {access_token}
```

#### Create Comment
```http
POST /api/comments/dashboard/{dashboard_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "Great insights!",
  "parentId": "optional_parent_comment_id"
}
```

## WebSocket Usage

Connect to real-time comments:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000/comments', {
  auth: {
    token: 'your_access_token'
  }
});

// Join dashboard room
socket.emit('join_dashboard', 'dashboard_id');

// Listen for new comments
socket.on('new_comment', (comment) => {
  console.log('New comment:', comment);
});

// Listen for comment updates
socket.on('comment_updated', (comment) => {
  console.log('Comment updated:', comment);
});

// Listen for comment deletions
socket.on('comment_deleted', ({ commentId }) => {
  console.log('Comment deleted:', commentId);
});
```

## Role Permissions

| Feature | Super Admin | Admin | User |
|---------|------------|-------|------|
| View All Dashboards | ✅ | ❌ (Own only) | ❌ (Assigned only) |
| Create Dashboard | ❌ | ✅ | ❌ |
| Assign Dashboard | ❌ | ✅ (Own) | ❌ |
| Comment | ❌ | ❌ | ✅ |
| Invite Admin | ✅ | ❌ | ❌ |
| Invite User | ❌ | ✅ | ❌ |
| Manage Companies | ✅ | ❌ | ❌ |

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Separate access and refresh tokens
- **Token Expiry**: Configurable token lifetimes
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs validated before processing
- **CORS**: Configured for specific frontend origin
- **Helmet**: Security headers enabled
- **Invite Tokens**: Time-limited, single-use invitation links

## Development

Run in development mode with auto-restart:

```bash
npm run dev
```

## Email Configuration

For Gmail, use App Passwords:
1. Enable 2FA on your Google account
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

## License

MIT
