# Support Ticket System - Implementation Documentation

## Overview
Sistem tiket support yang terintegrasi dengan database untuk mengelola pertanyaan dan masalah pengguna.

## Database Schema

### SupportTicket Model
```prisma
model SupportTicket {
  id              String   @id @default(cuid())
  userId          String
  subject         String
  category        String?  // payment, listing, account, order, other
  priority        String   @default("normal") // low, normal, high, urgent
  status          String   @default("open") // open, in_progress, waiting_customer, resolved, closed
  assignedTo      String?
  resolvedBy      String?
  resolvedAt      DateTime?
  lastReplyAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  profile         Profile        @relation(fields: [userId], references: [userId])
  replies         TicketReply[]
}
```

### TicketReply Model
```prisma
model TicketReply {
  id         String   @id @default(cuid())
  ticketId   String
  userId     String
  message    String
  isStaff    Boolean  @default(false)
  createdAt  DateTime @default(now())
  
  ticket     SupportTicket @relation(fields: [ticketId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### User Endpoints

#### GET /api/dashboard/support
Mengambil semua tiket support milik user yang sedang login.

**Response:**
```json
{
  "tickets": [
    {
      "id": "clxxx",
      "subject": "Pembayaran tidak berhasil",
      "category": "payment",
      "priority": "high",
      "status": "open",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_reply_at": "2024-01-01T00:00:00.000Z",
      "replyCount": 1
    }
  ]
}
```

#### POST /api/dashboard/support
Membuat tiket support baru.

**Request Body:**
```json
{
  "subject": "Judul tiket",
  "message": "Pesan detail masalah",
  "priority": "normal",
  "category": "payment"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "clxxx",
    "subject": "Judul tiket",
    "status": "open"
  }
}
```

### Admin Endpoints

#### GET /api/admin/support
Mengambil semua tiket support (admin only).

**Query Parameters:**
- `status` (optional): Filter by status (open, in_progress, waiting_customer, resolved, closed)
- `priority` (optional): Filter by priority (low, normal, high, urgent)

**Response:**
```json
{
  "tickets": [
    {
      "id": "clxxx",
      "subject": "Pembayaran tidak berhasil",
      "category": "payment",
      "priority": "high",
      "status": "open",
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_reply_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "replyCount": 1
    }
  ]
}
```

#### PATCH /api/admin/support
Update status tiket (admin only).

**Request Body:**
```json
{
  "ticketId": "clxxx",
  "status": "resolved",
  "assignedTo": "admin-user-id" // optional
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "clxxx",
    "status": "resolved"
  }
}
```

## Frontend Pages

### User Dashboard - /dashboard/support
Halaman untuk user membuat dan melihat tiket support mereka.

**Features:**
- Form untuk membuat tiket baru
- Tabel daftar tiket dengan filter
- Badge untuk status dan prioritas
- Loading states dan empty states

### Admin Dashboard - /admin/support
Halaman untuk admin mengelola semua tiket support.

**Features:**
- Tabel daftar semua tiket
- Filter by status dan priority
- Tombol untuk resolve tiket
- Informasi user yang membuat tiket
- Loading states dan empty states

## Status Types

| Status | Label | Deskripsi |
|--------|-------|-----------|
| `open` | Terbuka | Tiket baru yang belum ditangani |
| `in_progress` | Diproses | Tiket sedang ditangani oleh admin |
| `waiting_customer` | Menunggu | Menunggu respon dari customer |
| `resolved` | Selesai | Tiket sudah diselesaikan |
| `closed` | Ditutup | Tiket ditutup |

## Priority Levels

| Priority | Label | Deskripsi |
|----------|-------|-----------|
| `low` | Rendah | Prioritas rendah |
| `normal` | Normal | Prioritas normal |
| `high` | Tinggi | Prioritas tinggi |
| `urgent` | Urgent | Prioritas mendesak |

## Categories

| Category | Label | Deskripsi |
|----------|-------|-----------|
| `payment` | Pembayaran | Masalah terkait pembayaran |
| `listing` | Iklan | Masalah terkait iklan/listing |
| `account` | Akun | Masalah terkait akun |
| `order` | Pesanan | Masalah terkait pesanan |
| `other` | Lainnya | Masalah lainnya |

## Seeding Data

Untuk menambahkan sample support tickets:

```bash
npx tsx prisma/seed-support-tickets.ts
```

Script ini akan:
1. Mencari user pertama di database
2. Membuat 5 sample tickets dengan berbagai status dan prioritas
3. Membuat initial reply untuk setiap ticket

## Implementation Status

✅ **Completed:**
- Database schema (SupportTicket dan TicketReply models)
- API endpoints untuk user (GET, POST)
- API endpoints untuk admin (GET, PATCH)
- User dashboard page dengan form dan tabel
- Admin dashboard page dengan filter dan resolve button
- Seed script untuk sample data
- Loading states dan error handling
- Toast notifications

⏳ **Future Enhancements:**
- Detail page untuk melihat dan membalas tiket
- Real-time notifications untuk tiket baru
- Email notifications untuk update tiket
- File attachment support
- Ticket assignment system
- Ticket search functionality
- Analytics dashboard untuk admin

## Usage Example

### User Creating a Ticket

1. User navigates to `/dashboard/support`
2. Clicks "Buat Tiket" button
3. Fills in subject, message, category, and priority
4. Submits the form
5. Ticket is created with status "open"
6. Initial reply is created with the message

### Admin Resolving a Ticket

1. Admin navigates to `/admin/support`
2. Views list of all tickets
3. Filters by status or priority if needed
4. Clicks resolve button (checkmark icon)
5. Ticket status is updated to "resolved"
6. resolvedBy and resolvedAt fields are set

## Security

- All endpoints require authentication
- Admin endpoints check for admin role
- Users can only view their own tickets
- Admins can view all tickets
- Input validation on all endpoints
- SQL injection protection via Prisma ORM

## Notes

- Tickets are sorted by priority (desc) and creation date (desc) for admin view
- User view shows only their own tickets sorted by creation date (desc)
- lastReplyAt is updated whenever a new reply is added
- Deleting a ticket will cascade delete all replies
