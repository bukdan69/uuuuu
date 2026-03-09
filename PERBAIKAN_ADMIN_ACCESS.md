# 🔧 Perbaikan Admin Access untuk itarizvsn@gmail.com

## 🐛 Masalah yang Ditemukan:

User **itarizvsn@gmail.com** mendapat error "Akses Ditolak" saat mencoba akses `/admin`, padahal role admin sudah di-assign ke database.

### Root Cause:
Admin layout (`src/app/admin/layout.tsx`) mengecek role dari `user.user_metadata?.role` (Supabase metadata), sedangkan role yang di-assign ada di database tabel `user_roles`.

---

## ✅ Solusi yang Diterapkan:

### 1. Buat Helper Functions untuk Check Role
**File**: `src/lib/auth/checkRole.ts`

Functions yang dibuat:
- `checkUserRole(userId, role)` - Check apakah user punya role tertentu
- `isAdmin()` - Check apakah current user adalah admin
- `isPenjual()` - Check apakah current user adalah penjual
- `getUserRoles(userId)` - Get semua role user
- `hasAnyRole(userId, roles)` - Check apakah user punya salah satu dari roles

**Cara Kerja**:
```typescript
// Check dari database tabel user_roles
const userRole = await db.userRole.findFirst({
  where: { userId, role }
});
return !!userRole;
```

---

### 2. Buat API Endpoint untuk Check Role
**File**: `src/app/api/auth/check-role/route.ts`

**Endpoint**: `GET /api/auth/check-role`

**Response**:
```json
{
  "userId": "773a778e-64cb-424b-93b3-8879e6583fda",
  "email": "itarizvsn@gmail.com",
  "roles": ["user", "admin"],
  "isAdmin": true,
  "isPenjual": false
}
```

**Kegunaan**:
- Client-side bisa check role user yang sedang login
- Lebih efisien daripada call API stats yang berat
- Return semua informasi role sekaligus

---

### 3. Update Admin Layout
**File**: `src/app/admin/layout.tsx`

**Perubahan**:

**SEBELUM** (❌ Salah):
```typescript
// Check dari user metadata (tidak ada di sini)
if (user.user_metadata?.role === 'admin') {
  setIsAdmin(true);
  return;
}

// Baru check API sebagai fallback
const response = await fetch('/api/admin/stats');
```

**SESUDAH** (✅ Benar):
```typescript
// Langsung check via API yang mengecek database
const response = await fetch('/api/auth/check-role');
if (response.ok) {
  const data = await response.json();
  setIsAdmin(data.isAdmin); // Check dari database
}
```

**Benefit**:
- Selalu check dari database (source of truth)
- Tidak bergantung pada user metadata
- Lebih konsisten dengan sistem role yang ada

---

## 📊 Alur Check Admin Access:

### Flow Baru (Setelah Perbaikan):

```
User Login
    ↓
Admin Layout Load
    ↓
Call API: /api/auth/check-role
    ↓
API Query Database: user_roles table
    ↓
Check: WHERE userId = ? AND role = 'admin'
    ↓
Return: { isAdmin: true/false }
    ↓
Admin Layout: Show/Hide based on isAdmin
```

### Database Query:
```sql
SELECT * FROM user_roles 
WHERE "userId" = '773a778e-64cb-424b-93b3-8879e6583fda' 
AND role = 'admin';
```

**Result**:
```
id: [uuid]
userId: 773a778e-64cb-424b-93b3-8879e6583fda
role: admin
assignedBy: system
createdAt: 2026-03-04 19:35:48
```

---

## 🎯 Testing:

### Test 1: Verifikasi Role di Database
```bash
npx ts-node check-user-role.ts
```

**Expected**:
```
✅ User ditemukan:
📧 Email: itarizvsn@gmail.com
🎭 ROLES:
1. Role: ADMIN ✅
```

### Test 2: Test API Endpoint
```bash
# Login dulu, lalu test di browser console:
fetch('/api/auth/check-role')
  .then(r => r.json())
  .then(console.log);
```

**Expected**:
```json
{
  "isAdmin": true,
  "roles": ["user", "admin"]
}
```

### Test 3: Akses Admin Panel
```
1. Logout dari aplikasi
2. Clear browser cache
3. Login dengan itarizvsn@gmail.com
4. Akses: http://localhost:3000/admin
5. Expected: Halaman admin terbuka ✅
```

---

## 📁 Files yang Dibuat/Diubah:

### Dibuat Baru:
1. ✅ `src/lib/auth/checkRole.ts` - Helper functions
2. ✅ `src/app/api/auth/check-role/route.ts` - API endpoint
3. ✅ `test-admin-access.md` - Panduan testing
4. ✅ `PERBAIKAN_ADMIN_ACCESS.md` - Dokumentasi ini

### Diubah:
1. ✅ `src/app/admin/layout.tsx` - Update logic check admin

---

## 🔐 Security Notes:

### Keamanan yang Diterapkan:

1. **Authentication Required**
   - Semua endpoint check role butuh authentication
   - Menggunakan Supabase auth

2. **Database as Source of Truth**
   - Role selalu di-check dari database
   - Tidak bisa di-manipulasi dari client

3. **Server-Side Validation**
   - Check role dilakukan di server
   - Client hanya terima hasil true/false

4. **Audit Trail**
   - Setiap assign role tercatat (assignedBy, createdAt)
   - Bisa track siapa yang assign role

---

## 🚀 Next Steps untuk User:

### Untuk itarizvsn@gmail.com:

1. **Logout** dari aplikasi
2. **Clear** browser cache dan cookies
3. **Login** ulang dengan email: itarizvsn@gmail.com
4. **Akses** admin panel: `/admin`
5. **Enjoy** full admin access! 🎉

### Fitur Admin yang Bisa Diakses:

- ✅ Dashboard & Analytics
- ✅ User Management
- ✅ Listing Review & Approval
- ✅ KYC Verification Review
- ✅ Category Management
- ✅ Banner Management
- ✅ Coupon Management
- ✅ Credit Package Management
- ✅ Topup Request Review
- ✅ Withdrawal Request Review
- ✅ Order Monitoring
- ✅ Support Ticket Management
- ✅ Report Handling
- ✅ Broadcast Notifications
- ✅ Platform Settings
- ✅ Activity Logs

---

## 📞 Troubleshooting:

### Jika Masih "Akses Ditolak":

1. **Hard Refresh**: Ctrl + Shift + R
2. **Clear Cache**: Ctrl + Shift + Delete
3. **Restart Dev Server**: Stop dan start ulang `npm run dev`
4. **Check Console**: Lihat error di browser DevTools (F12)
5. **Verify Login**: Pastikan login dengan email yang benar

### Debug Commands:

```bash
# Check role di database
npx ts-node check-user-role.ts

# List semua admin
npx ts-node scripts/list-all-roles.ts
```

---

## ✅ Summary:

**Problem**: Admin access ditolak karena check role dari user metadata (kosong)

**Solution**: Update admin layout untuk check role dari database via API

**Status**: ✅ Fixed

**Action Required**: User perlu logout, clear cache, dan login ulang

**Expected Result**: User bisa akses `/admin` tanpa error

---

**Timestamp**: 4 Maret 2026, 19:45
**Fixed By**: System
**Tested**: ✅ API endpoint working, role verified in database
