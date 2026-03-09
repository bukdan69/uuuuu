# Admin Settings - Implementation Documentation

## Overview
Sistem pengaturan platform yang terintegrasi dengan database untuk mengelola konfigurasi aplikasi.

## Analisis Masalah (Sebelum Perbaikan)

### Masalah yang Ditemukan:
1. ❌ **Menggunakan AdminLayout wrapper** - Seharusnya tidak karena sudah ada `src/app/admin/layout.tsx`
2. ❌ **Menggunakan Supabase Client langsung** - Seharusnya menggunakan API route dengan Prisma
3. ❌ **Tidak ada integrasi database** - Settings hanya di state lokal, tidak tersinkronisasi
4. ❌ **Tidak ada loading states** - Tidak ada skeleton atau loading indicator
5. ❌ **Tidak ada error handling** - Tidak ada penanganan error yang proper
6. ❌ **Switch tidak fungsional** - Banyak switch yang tidak terhubung ke database
7. ❌ **Tidak ada activity logging** - Perubahan settings tidak tercatat

### Perbaikan yang Dilakukan:
1. ✅ Hapus `AdminLayout` wrapper
2. ✅ Buat API route `/api/admin/settings` untuk CRUD operations
3. ✅ Gunakan Prisma untuk akses database (model `PlatformSetting`)
4. ✅ Tambahkan loading states dan skeleton
5. ✅ Implementasi save functionality yang proper
6. ✅ Tambahkan toast notifications
7. ✅ Tambahkan activity logging untuk audit trail

## Database Schema

### PlatformSetting Model
```prisma
model PlatformSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String?
  
  @@map("platform_settings")
}
```

## API Endpoints

### GET /api/admin/settings
Mengambil semua pengaturan platform (admin only).

**Response:**
```json
{
  "settings": {
    "site_name": "UMKM ID",
    "site_email": "admin@umkm.id",
    "maintenance_mode": false,
    "registration_enabled": true,
    "email_notifications": true,
    "kyc_required": false,
    "min_withdrawal": 50000,
    "platform_fee": 5,
    "initial_user_credits": 500
  }
}
```

### POST /api/admin/settings
Update pengaturan platform (admin only).

**Request Body:**
```json
{
  "key": "initial_user_credits",
  "value": 500,
  "description": "Jumlah kredit awal untuk user baru"
}
```

**Response:**
```json
{
  "success": true,
  "setting": {
    "key": "initial_user_credits",
    "value": "500"
  }
}
```

## Frontend Page

### Admin Settings - /admin/settings
Halaman untuk admin mengelola pengaturan platform.

**Features:**
- Form untuk mengubah pengaturan
- Loading states dengan skeleton
- Toast notifications untuk feedback
- Save individual setting atau save all
- Error handling yang proper
- Activity logging otomatis

## Available Settings

### 1. Kredit User Baru
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `initial_user_credits` | number | 500 | Jumlah kredit yang diberikan otomatis saat user baru mendaftar |

**Features:**
- Input number dengan min/max validation
- Save button individual
- Real-time preview

### 2. Pengaturan Umum
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `site_name` | string | "UMKM ID" | Nama situs platform |
| `site_email` | string | "admin@umkm.id" | Email admin platform |
| `maintenance_mode` | boolean | false | Mode maintenance untuk menonaktifkan akses publik |
| `registration_enabled` | boolean | true | Izinkan pengguna baru mendaftar |

### 3. Pengaturan Keuangan
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `min_withdrawal` | number | 50000 | Minimum penarikan dalam Rupiah |
| `platform_fee` | number | 5 | Biaya platform dalam persen |

### 4. Pengaturan Keamanan
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `kyc_required` | boolean | false | Wajib KYC untuk withdraw |

### 5. Pengaturan Notifikasi
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `email_notifications` | boolean | true | Kirim notifikasi via email |

## Seeding Data

Untuk menambahkan default platform settings:

```bash
npx tsx prisma/seed-platform-settings.ts
```

Script ini akan:
1. Membuat atau update 9 default settings
2. Menggunakan upsert untuk menghindari duplikasi
3. Menampilkan progress untuk setiap setting

## Implementation Details

### Data Flow
1. **Load Settings**: Frontend → GET `/api/admin/settings` → Prisma → Database
2. **Save Setting**: Frontend → POST `/api/admin/settings` → Prisma → Database → Activity Log

### State Management
```typescript
const [settings, setSettings] = useState({
  site_name: 'UMKM ID',
  site_email: 'admin@umkm.id',
  maintenance_mode: false,
  registration_enabled: true,
  email_notifications: true,
  kyc_required: false,
  min_withdrawal: 50000,
  platform_fee: 5,
  initial_user_credits: 500,
});
```

### Save Strategies

#### 1. Save Individual Setting
```typescript
const handleSaveSingle = async (key: string, value: any, label: string) => {
  const success = await saveSetting(key, value);
  if (success) {
    toast({ title: 'Berhasil', description: `${label} berhasil disimpan` });
  }
};
```

#### 2. Save All Settings
```typescript
const handleSaveAll = async () => {
  const promises = Object.entries(settings).map(([key, value]) =>
    saveSetting(key, value)
  );
  const results = await Promise.all(promises);
  // Show success/error toast
};
```

### Activity Logging
Setiap perubahan setting akan tercatat di `ActivityLog`:
```typescript
await db.activityLog.create({
  data: {
    userId: user.id,
    userEmail: userProfile?.email || '',
    action: 'update_setting',
    description: `Updated setting: ${key}`,
    metadata: {
      key,
      value: valueStr.substring(0, 100),
    },
  },
});
```

## Security

- All endpoints require authentication
- Admin role check on all endpoints
- Input validation on all fields
- SQL injection protection via Prisma ORM
- Activity logging for audit trail
- updatedBy field tracks who made changes

## Usage Example

### Admin Updating Initial Credits

1. Admin navigates to `/admin/settings`
2. Scrolls to "Kredit User Baru" section
3. Changes value from 500 to 1000
4. Clicks "Simpan" button
5. Setting is saved to database
6. Activity log is created
7. Toast notification shows success
8. New users will now receive 1000 credits

### Admin Enabling Maintenance Mode

1. Admin navigates to `/admin/settings`
2. Finds "Mode Maintenance" switch
3. Toggles switch to ON
4. Clicks "Simpan Semua Pengaturan"
5. All settings are saved
6. Platform enters maintenance mode
7. Public access is disabled

## Future Enhancements

⏳ **Planned Features:**
- Settings validation rules
- Settings history/versioning
- Rollback functionality
- Settings import/export
- Settings categories/grouping
- Real-time settings sync
- Settings search functionality
- Bulk edit mode
- Settings templates
- Environment-specific settings

## Notes

- Settings are stored as strings in database
- Boolean values are stored as "true"/"false" strings
- Numbers are stored as string representations
- Objects/arrays are stored as JSON strings
- Frontend handles type conversion automatically
- Upsert is used to avoid duplicate key errors
- All changes are logged for audit purposes

## Comparison: Before vs After

### Before (Masalah):
```typescript
// ❌ Menggunakan AdminLayout
<AdminLayout title="Pengaturan">
  
// ❌ Menggunakan Supabase langsung
const { data } = await supabase.from('platform_settings')...

// ❌ Tidak ada loading state
return <div>...</div>

// ❌ Tidak ada error handling
const saveInitialCredits = async () => {
  await supabase.from('platform_settings').update(...)
}
```

### After (Perbaikan):
```typescript
// ✅ Tidak menggunakan AdminLayout
<div className="space-y-6">

// ✅ Menggunakan API route dengan Prisma
const response = await fetch('/api/admin/settings');

// ✅ Ada loading state dengan skeleton
if (isLoading) {
  return <Skeleton />
}

// ✅ Ada error handling dengan toast
try {
  const response = await fetch(...);
  if (response.ok) {
    toast({ title: 'Berhasil' });
  } else {
    toast({ variant: 'destructive', title: 'Gagal' });
  }
} catch (error) {
  toast({ variant: 'destructive' });
}
```

## Testing

To test the settings page:

1. Start the dev server: `npm run dev`
2. Login as admin
3. Navigate to `/admin/settings`
4. Try changing various settings
5. Click save buttons
6. Verify toast notifications appear
7. Refresh page to verify settings persist
8. Check activity logs in database
