# 🔔 In-App Notifications Implementation

## Overview
Implementasi sistem notifikasi in-app untuk menampilkan broadcast dan notifikasi lainnya kepada user di dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Admin Broadcast                                         │
│ /admin/broadcast                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ API: Create Notifications                               │
│ POST /api/admin/broadcast                               │
│ → db.notification.createMany()                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ Database: notifications table                           │
│ - userId, type, title, message                          │
│ - isRead, readAt, createdAt                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ User Dashboard                                          │
│ /dashboard/notifications                                │
│ → Fetch & display notifications                         │
└─────────────────────────────────────────────────────────┘
```

## Files Created

### 1. API Endpoint
**File:** `src/app/api/notifications/route.ts`

**Methods:**
- `GET` - Fetch user notifications
  - Query params: `?unread=true` (filter unread only)
  - Query params: `?limit=50` (limit results)
  - Returns: `{ notifications, unreadCount, total }`

- `PATCH` - Mark notification(s) as read
  - Body: `{ notificationId }` (single notification)
  - Body: `{ markAllAsRead: true }` (all notifications)

- `DELETE` - Delete notification(s)
  - Query params: `?id={notificationId}` (single)
  - Query params: `?all=true` (all read notifications)

### 2. Notifications Page
**File:** `src/app/dashboard/notifications/page.tsx`

**Features:**
- ✅ Display all notifications with icons & colors
- ✅ Filter: All / Unread only
- ✅ Mark single notification as read
- ✅ Mark all notifications as read
- ✅ Delete single notification
- ✅ Delete all read notifications
- ✅ Real-time unread count
- ✅ Empty state handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Dark mode support

**Notification Types:**
- `info` - Blue (Info icon)
- `success` - Green (CheckCircle icon)
- `warning` - Amber (AlertTriangle icon)
- `error` - Red (XCircle icon)
- `order` - Purple (ShoppingBag icon)
- `payment` - Emerald (CreditCard icon)
- `message` - Indigo (MessageSquare icon)

### 3. Header Component Update
**File:** `src/components/layout/Header.tsx`

**Changes:**
- ✅ Added unread count state
- ✅ Fetch unread count on mount
- ✅ Auto-refresh every 30 seconds
- ✅ Display badge with count (red, animated)
- ✅ Link to `/dashboard/notifications`

### 4. Seed Script
**File:** `prisma/seed-notifications.ts`

**Purpose:** Create sample notifications for testing

**Usage:**
```bash
npx tsx prisma/seed-notifications.ts
```

## Database Schema

```prisma
model Notification {
  id         String   @id @default(cuid())
  userId     String
  type       String   // info, success, warning, error, order, payment, message
  title      String
  message    String
  data       String?  // JSON string for additional data
  isRead     Boolean  @default(false)
  readAt     DateTime?
  createdAt  DateTime @default(now())

  profile    Profile  @relation(fields: [userId], references: [userId])

  @@index([userId, isRead])
  @@map("notifications")
}
```

## Usage Examples

### 1. Send Broadcast (Admin)
```typescript
// Already implemented in /admin/broadcast
await db.notification.createMany({
  data: targetUsers.map(user => ({
    userId: user.userId,
    type: 'info',
    title: 'Broadcast Title',
    message: 'Broadcast message',
    isRead: false,
  })),
});
```

### 2. Send Single Notification
```typescript
await db.notification.create({
  data: {
    userId: 'user-id',
    type: 'order',
    title: 'Pesanan Baru',
    message: 'Anda memiliki pesanan baru dari pembeli',
    isRead: false,
  },
});
```

### 3. Fetch Notifications (Frontend)
```typescript
// Get all notifications
const response = await fetch('/api/notifications');
const data = await response.json();

// Get unread only
const response = await fetch('/api/notifications?unread=true');
const data = await response.json();
```

### 4. Mark as Read
```typescript
// Single notification
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'notif-id' }),
});

// All notifications
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markAllAsRead: true }),
});
```

### 5. Delete Notification
```typescript
// Single notification
await fetch('/api/notifications?id=notif-id', {
  method: 'DELETE',
});

// All read notifications
await fetch('/api/notifications?all=true', {
  method: 'DELETE',
});
```

## Features

### ✅ Implemented
1. In-app notification display
2. Unread count badge in header
3. Filter by read/unread status
4. Mark as read (single & bulk)
5. Delete notifications (single & bulk)
6. Auto-refresh unread count (30s interval)
7. Responsive design
8. Dark mode support
9. Loading & empty states
10. Toast feedback for actions

### 🔄 Future Enhancements
1. **Real-time Updates**
   - WebSocket integration for instant notifications
   - No need to refresh page

2. **Push Notifications**
   - Browser push notifications
   - Service worker implementation

3. **Email Notifications**
   - Send important notifications via email
   - Email preferences in settings

4. **Notification Preferences**
   - User can choose which notifications to receive
   - Mute specific notification types

5. **Notification Groups**
   - Group similar notifications
   - Collapse/expand groups

6. **Rich Notifications**
   - Add images/attachments
   - Action buttons (e.g., "View Order", "Reply")

7. **Notification History**
   - Archive old notifications
   - Search & filter by date/type

8. **Analytics**
   - Track notification open rates
   - User engagement metrics

## Testing

### 1. Create Sample Notifications
```bash
npx tsx prisma/seed-notifications.ts
```

### 2. Test Broadcast
1. Login as admin
2. Go to `/admin/broadcast`
3. Send a broadcast to "Semua Pengguna"
4. Login as regular user
5. Check `/dashboard/notifications`
6. Verify notification appears with unread badge

### 3. Test Actions
- Click notification to mark as read
- Use "Tandai Semua Dibaca" button
- Delete single notification
- Delete all read notifications
- Filter by unread only

### 4. Test Badge Counter
- Check header bell icon shows correct count
- Mark notification as read
- Verify count decreases
- Wait 30 seconds for auto-refresh

## Security

✅ **Authentication:** All endpoints require valid Supabase session
✅ **Authorization:** Users can only access their own notifications
✅ **Validation:** Input validation on all endpoints
✅ **SQL Injection:** Protected by Prisma ORM
✅ **XSS:** React automatically escapes content

## Performance

✅ **Indexed Queries:** `@@index([userId, isRead])` for fast lookups
✅ **Pagination:** Limit results to 50 by default
✅ **Batch Operations:** Use `createMany()` for bulk inserts
✅ **Optimistic Updates:** Update UI before API response
✅ **Auto-refresh:** Only fetch count, not full list

## Troubleshooting

### Badge not showing
- Check if user is logged in
- Verify notifications exist in database
- Check browser console for API errors
- Clear cache and reload

### Notifications not appearing
- Verify broadcast was sent successfully
- Check database for notification records
- Ensure userId matches logged-in user
- Check API endpoint returns data

### Count not updating
- Wait 30 seconds for auto-refresh
- Manually refresh page
- Check network tab for API calls
- Verify WebSocket connection (if implemented)

## Conclusion

✅ **Opsi 1 (In-App Notification) berhasil diimplementasikan!**

User sekarang dapat:
- Melihat notifikasi broadcast dari admin
- Melihat badge counter di header
- Mengelola notifikasi (mark as read, delete)
- Filter notifikasi berdasarkan status

Sistem ini simple, tidak memerlukan email service, dan fully integrated dengan database existing.
