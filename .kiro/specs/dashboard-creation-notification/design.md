# Design Document: Dashboard Creation Notification

## Overview

This feature extends the existing notification system to automatically notify users when their admin creates a new dashboard. The implementation leverages the existing `NotificationService` and `DashboardService` with minimal changes to maintain backward compatibility.

## Architecture

The feature follows the existing architecture pattern:

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│ Dashboard Controller│────▶│   Dashboard Service  │────▶│ Notification Service│
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                      │                            │
                                      ▼                            ▼
                              ┌──────────────┐            ┌────────────────┐
                              │   Dashboard  │            │  Notification  │
                              │    Model     │            │     Model      │
                              └──────────────┘            └────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌────────────────┐
                                                          │ Socket (Real-  │
                                                          │ time delivery) │
                                                          └────────────────┘
```

## Components and Interfaces

### 1. Notification Model Update

Add a new notification type for dashboard creation:

```javascript
type: {
  type: String,
  enum: ['COMMENT', 'MENTION', 'DASHBOARD_ASSIGNED', 'DASHBOARD_CREATED'],
  required: true
}
```

### 2. Notification Service Extension

Add a new method to `NotificationService`:

```javascript
async sendDashboardCreatedNotification(dashboard, admin, app) {
  // 1. Find all active users invited by this admin
  // 2. Create notification for each user
  // 3. Send real-time notification via socket
  // Returns: array of created notifications
}
```

### 3. Dashboard Service Update

Modify `createDashboard` method to:
1. Accept `app` parameter for socket access
2. Call notification service after successful dashboard creation
3. Handle notification errors gracefully (non-blocking)

### 4. Dashboard Controller Update

Pass `req.app` to the service method for socket access.

## Data Models

### Notification Document (Extended)

```javascript
{
  recipient: ObjectId,      // User receiving notification
  sender: ObjectId,         // Admin who created dashboard
  type: 'DASHBOARD_CREATED', // New type
  message: String,          // "Admin Name created a new dashboard: Dashboard Title"
  dashboard: ObjectId,      // Reference to created dashboard
  isRead: Boolean,
  createdAt: Date
}
```

### User Query for Recipients

```javascript
// Find users invited by the admin
User.find({
  invitedBy: adminId,
  isActive: true,
  role: 'USER'
})
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Notification Creation for Invited Users

*For any* admin with N invited active users, when that admin creates a dashboard, exactly N notifications of type 'DASHBOARD_CREATED' should be created, one for each invited user.

**Validates: Requirements 1.1**

### Property 2: Notification Message Content

*For any* dashboard creation notification, the message should contain both the admin's name (or email) and the dashboard title.

**Validates: Requirements 1.2**

### Property 3: Dashboard Creation Triggers Notifications

*For any* successful dashboard creation by an admin, the notification service's `sendDashboardCreatedNotification` method should be invoked with the created dashboard and admin.

**Validates: Requirements 2.1**

## Error Handling

| Scenario | Handling |
|----------|----------|
| No users invited by admin | Skip notification sending, return empty array |
| Notification creation fails | Log error, continue with remaining users |
| Socket not available | Create DB notification, skip real-time delivery |
| Database error during notification | Log error, dashboard creation still succeeds |

The notification process is wrapped in try-catch to ensure dashboard creation is never blocked by notification failures.

## Testing Strategy

### Unit Tests
- Test `sendDashboardCreatedNotification` with mock data
- Test edge case: admin with no invited users
- Test error handling when notification creation fails

### Property-Based Tests
- Use fast-check library for JavaScript property-based testing
- Minimum 100 iterations per property test
- Tag format: **Feature: dashboard-creation-notification, Property N: description**

### Integration Tests
- Test full flow: dashboard creation → notification creation → socket emission
- Verify notifications appear in user's notification list
