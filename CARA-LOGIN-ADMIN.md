# 🔐 Cara Login Sebagai Admin

## ❓ Mengapa Tidak Bisa Login Admin?

Sistem ini menggunakan **Google OAuth** untuk authentication. User admin di database (`admin@marketplace.com` dengan userId `admin-001`) adalah **dummy data** yang tidak terhubung dengan Supabase Auth.

Untuk login sebagai admin, Anda perlu:
1. Login dengan Google OAuth terlebih dahulu
2. Assign role admin ke akun Google Anda

---

## 📋 Langkah-Langkah Login Admin

### Step 1: Login dengan Google OAuth

1. Buka browser dan kunjungi:
   ```
   http://localhost:3000/auth
   ```

2. Klik tombol **"Lanjutkan dengan Google"**

3. Pilih akun Google Anda

4. Setelah berhasil login, Anda akan diarahkan ke dashboard

### Step 2: Assign Role Admin

Setelah login, jalankan script berikut dengan email Google Anda:

```bash
npx tsx scripts/create-admin-from-google.ts your-email@gmail.com
```

**Contoh:**
```bash
npx tsx scripts/create-admin-from-google.ts john.doe@gmail.com
```

### Step 3: Akses Admin Panel

1. Refresh halaman browser (F5)

2. Kunjungi admin panel:
   ```
   http://localhost:3000/admin
   ```

3. ✅ Sekarang Anda bisa akses semua fitur admin!

---

## 🔧 Troubleshooting

### Problem: "User tidak ditemukan"

**Penyebab:** Anda belum login dengan Google OAuth

**Solusi:**
1. Pastikan Anda sudah login di http://localhost:3000/auth
2. Cek apakah Anda sudah diarahkan ke dashboard
3. Jalankan script lagi dengan email yang benar

### Problem: "Email salah"

**Solusi:** Jalankan script tanpa parameter untuk melihat daftar user:

```bash
npx tsx scripts/create-admin-from-google.ts
```

Script akan menampilkan semua user yang ada di database.

### Problem: "Sudah assign admin tapi masih tidak bisa akses"

**Solusi:**
1. Logout dari aplikasi
2. Login lagi dengan Google
3. Atau clear browser cache dan cookies
4. Refresh halaman

---

## 🎯 Cara Kerja Authentication

### Flow Login:

```
1. User klik "Login dengan Google"
   ↓
2. Redirect ke Google OAuth
   ↓
3. User pilih akun Google
   ↓
4. Google redirect kembali ke app
   ↓
5. Supabase Auth membuat session
   ↓
6. App membuat/update profile di database
   ↓
7. User diarahkan ke dashboard
```

### Flow Check Admin:

```
1. User akses /admin
   ↓
2. Middleware cek Supabase session
   ↓
3. Get user ID dari session
   ↓
4. Query database: user_roles table
   ↓
5. Cek apakah ada role 'admin'
   ↓
6. Allow/Deny access
```

---

## 📊 Database Structure

### Table: profiles
```sql
id          | userId (Supabase Auth ID) | email              | name
------------|---------------------------|--------------------|---------
clxxx...    | abc123-def456-...         | john@gmail.com     | John Doe
```

### Table: user_roles
```sql
id          | userId (FK)       | role    | assignedBy
------------|-------------------|---------|------------
clyyy...    | abc123-def456-... | admin   | system
clzzz...    | abc123-def456-... | penjual | system
```

**Key Point:** `userId` di kedua table harus **sama** dan harus match dengan Supabase Auth user ID!

---

## 🔑 Multiple Roles

Satu user bisa punya multiple roles:

```typescript
// User bisa jadi admin DAN penjual
{
  userId: "abc123",
  roles: ["user", "admin", "penjual"]
}
```

### Assign Multiple Roles:

```bash
# Assign admin
npx tsx scripts/create-admin-from-google.ts your-email@gmail.com

# Assign penjual (seller)
npx tsx scripts/assign-penjual-role.ts your-email@gmail.com
```

---

## 🛠️ Scripts Tersedia

### 1. Check Admin Users
```bash
npx tsx scripts/check-admin-users.ts
```
Menampilkan semua user dengan role admin.

### 2. Assign Admin Role
```bash
npx tsx scripts/create-admin-from-google.ts EMAIL
```
Menambahkan role admin ke user.

### 3. Check Database Data
```bash
npx tsx scripts/check-database-data.ts
```
Menampilkan ringkasan data di database.

### 4. List All Users
```bash
npx tsx scripts/list-all-users.ts
```
Menampilkan semua user dan role mereka.

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Start dev server (jika belum)
npm run dev

# 2. Login dengan Google
# Buka: http://localhost:3000/auth

# 3. Assign admin role
npx tsx scripts/create-admin-from-google.ts your-email@gmail.com

# 4. Akses admin panel
# Buka: http://localhost:3000/admin
```

---

## 📝 Notes

### Dummy Admin User

User `admin@marketplace.com` (userId: `admin-001`) adalah dummy data dari seed script. User ini **TIDAK BISA** digunakan untuk login karena:

1. ❌ Tidak ada di Supabase Auth (auth.users table)
2. ❌ Tidak ada password (sistem pakai Google OAuth)
3. ❌ userId tidak match dengan Supabase user ID

### Production Setup

Untuk production, Anda bisa:

1. **Manual Assignment:**
   - Admin pertama assign manual via script
   - Admin berikutnya assign via admin panel

2. **Whitelist Email:**
   - Buat list email yang auto-jadi admin
   - Check saat user pertama kali login

3. **Invite System:**
   - Admin kirim invite link
   - User yang daftar via link auto jadi admin

---

## 🔐 Security Best Practices

### ✅ DO:
- Assign admin role hanya ke email terpercaya
- Log semua admin actions (sudah ada di AdminLog table)
- Review admin access secara berkala
- Gunakan 2FA untuk admin (future feature)

### ❌ DON'T:
- Jangan share admin credentials
- Jangan assign admin ke email publik
- Jangan skip audit logging
- Jangan hardcode admin emails di code

---

## 🆘 Need Help?

Jika masih ada masalah:

1. Check server logs di terminal
2. Check browser console (F12)
3. Check Supabase dashboard untuk auth logs
4. Run diagnostic scripts di folder `/scripts`

---

**Last Updated:** 10 Maret 2026  
**System Version:** 0.2.0
