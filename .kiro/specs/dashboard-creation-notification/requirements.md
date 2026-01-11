# Requirements Document

## Introduction

This feature adds automatic notifications to users when an admin creates a new dashboard. When an admin creates a dashboard, all users that were invited/created by that admin should receive a notification informing them about the new dashboard.

## Glossary

- **Admin**: A user with role 'ADMIN' who can create dashboards and invite users
- **User**: A user with role 'USER' who was invited by an admin (tracked via `invitedBy` field)
- **Dashboard**: A Power BI or analytics dashboard created by an admin
- **Notification_Service**: The service responsible for creating and sending notifications
- **Dashboard_Service**: The service responsible for dashboard CRUD operations

## Requirements

### Requirement 1

**User Story:** As a user, I want to be notified when my admin creates a new dashboard, so that I am aware of new dashboards available in the system.

#### Acceptance Criteria

1. WHEN an admin creates a new dashboard, THE Notification_Service SHALL create a notification for each active user who was invited by that admin
2. WHEN a dashboard creation notification is created, THE Notification_Service SHALL include the dashboard title and admin name in the notification message
3. WHEN a dashboard creation notification is created, THE Notification_Service SHALL send real-time notification via socket to online users
4. IF no users were invited by the admin, THEN THE Dashboard_Service SHALL complete dashboard creation without sending notifications

### Requirement 2

**User Story:** As an admin, I want my users to be automatically notified about new dashboards, so that I don't have to manually inform them.

#### Acceptance Criteria

1. WHEN an admin creates a dashboard, THE Dashboard_Service SHALL trigger the notification process after successful dashboard creation
2. THE Dashboard_Service SHALL pass the app context to enable real-time socket notifications
3. IF the notification process fails, THEN THE Dashboard_Service SHALL still complete the dashboard creation successfully (notifications are non-blocking)
