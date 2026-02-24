# Notifications Feature

In-app notification system for compliance alerts, expiration warnings, and system messages.

## Architecture

```
notifications/
└── NotificationsPage.tsx    # Full notification list view
```

## Rules

- `NotificationBell` component in layout handles real-time unread count.
- Service: `src/lib/api/services/notifications.ts`.
- Types: `src/types/notification.ts`.
- Notification list uses paginated API responses — extract `items` array from response.
- Mark-as-read operations should be optimistic (update UI immediately, then sync server).
