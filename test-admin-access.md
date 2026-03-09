# Test Admin Access untuk itarizvsn@gmail.com

## ✅ Yang Sudah Dilakukan:

### 1. Assign Role Admin
- ✅ Role admin sudah di-assign ke database
- ✅ User ID: 773a778e-64cb-424b-93b3-8879e6583fda
- ✅ Email: itarizvsn@gmail.com
- ✅ Role: ADMIN (di tabel user_roles)

### 2. Perbaikan Admin Layout
- ✅ Update `src/app/admin/layout.tsx`
- ✅ Sekarang mengecek role dari database (bukan user_metadata)
- ✅ Menggunakan API `/api/auth/check-role`

### 3. Buat Helper Functions
- ✅ `src/lib/auth/checkRole.ts` - Helper functions untuk check role
- ✅ `src/app/api/auth/check-role/route.ts` - API endpoint untuk check role

---

## 🔧 Cara Test:

### Test 1: Cek Role via Script
```bash
npx ts-node check-user-role.ts
```

**Expected Output**:
```
✅ User ditemukan:
📧 Email: itarizvsn@gmail.com
👤 Nama: Nodemon Ss

🎭 ROLES:
1. Role: ADMIN
   Assigned By: system
   Assigned At: 4/3/2026, 19.35.48
```

### Test 2: Login dan Akses Admin Panel
1. **Logout** dari aplikasi (jika sudah login)
2. **Login** dengan:
   - Email: itarizvsn@gmail.com
   - Password: [password user]
3. **Akses** admin panel:
   ```
   http://localhost:3000/admin
   ```
4. **Expected**: Halaman admin terbuka (tidak ada "Akses Ditolak")

### Test 3: Test API Check Role (via Browser Console)
Setelah login, buka browser console dan jalankan:

```javascript
fetch('/api/auth/check-role')
  .then(r => r.json())
  .then(data => console.log(data));
```

**Expected Output**:
```json
{
  "userId": "773a778e-64cb-424b-93b3-8879e6583fda",
  "email": "itarizvsn@gmail.com",
  "roles": ["user", "admin"],
  "isAdmin": true,
  "isBandar": false
}
```

---

## 🐛 Troubleshooting:

### Jika Masih "Akses Ditolak":

#### 1. Clear Browser Cache & Cookies
```
Ctrl + Shift + Delete (Chrome/Edge)
Pilih: Cookies dan Cache
Clear
```

#### 2. Hard Refresh
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

#### 3. Logout dan Login Ulang
- Logout dari aplikasi
- Clear cookies
- Login kembali dengan itarizvsn@gmail.com

#### 4. Restart Development Server
```bash
# Stop server (Ctrl + C)
# Start ulang
npm run dev
```

#### 5. Cek Console untuk Error
- Buka Browser DevTools (F12)
- Tab Console
- Lihat apakah ada error saat fetch `/api/auth/check-role`

---

## 📋 Checklist Verifikasi:

- [ ] Role admin sudah di database (✅ Sudah)
- [ ] Admin layout sudah diperbaiki (✅ Sudah)
- [ ] API check-role sudah dibuat (✅ Sudah)
- [ ] User sudah logout dan login ulang
- [ ] Browser cache sudah di-clear
- [ ] Development server sudah di-restart
- [ ] API `/api/auth/check-role` return `isAdmin: true`
- [ ] Halaman `/admin` bisa diakses

---

## 🎯 Expected Behavior:

Setelah semua perbaikan:

1. **Login** dengan itarizvsn@gmail.com
2. **API Check**: `/api/auth/check-role` return `isAdmin: true`
3. **Admin Layout**: Tidak show "Akses Ditolak"
4. **Admin Panel**: Bisa akses semua halaman admin
5. **Sidebar**: Muncul admin sidebar dengan menu lengkap

---

## 📞 Jika Masih Bermasalah:

Cek hal berikut:

### 1. Apakah user sudah login dengan benar?
```javascript
// Di browser console
fetch('/api/auth/check-role')
  .then(r => r.json())
  .then(data => console.log('User:', data));
```

### 2. Apakah role ada di database?
```bash
npx ts-node check-user-role.ts
```

### 3. Apakah ada error di console?
- Buka DevTools (F12)
- Tab Console
- Screenshot error jika ada

### 4. Apakah API endpoint berfungsi?
Test manual via browser:
```
http://localhost:3000/api/auth/check-role
```

---

## ✅ Summary:

**Status**: Role admin sudah di-assign dan sistem sudah diperbaiki

**Next Steps**:
1. Logout dari aplikasi
2. Clear browser cache
3. Login ulang dengan itarizvsn@gmail.com
4. Akses `/admin`
5. Seharusnya bisa masuk!

Jika masih ada masalah, screenshot error dan share untuk debugging lebih lanjut.
