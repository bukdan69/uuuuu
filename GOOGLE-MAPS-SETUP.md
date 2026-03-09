# Setup Maps untuk Profile

## LocationIQ (Digunakan Saat Ini)

LocationIQ adalah alternatif gratis untuk Google Maps yang menggunakan OpenStreetMap data.

### Konfigurasi
- **Access Token**: `pk.1b44f2c4c63124ef7a2e9618b73a21e9`
- **Label**: umkm a
- **Authorized HTTP Referrers**: 
  - `https://umkm.id/`
  - `http://localhost:3000/`
- **Authorized IP**: `103.171.156.182`
- **Free Tier**: 5,000 requests/day

### Fitur
- Geocoding API untuk konversi alamat ke koordinat
- Static Maps untuk menampilkan peta
- Interactive maps menggunakan Leaflet.js
- Gratis untuk 5,000 requests/hari

### Cara Kerja
1. Sistem geocode alamat menggunakan LocationIQ API
2. Mendapatkan latitude & longitude
3. Menampilkan peta interaktif dengan Leaflet.js
4. Marker otomatis ditambahkan di lokasi

### Environment Variable
```env
NEXT_PUBLIC_LOCATIONIQ_API_KEY=pk.1b44f2c4c63124ef7a2e9618b73a21e9
```

---

# Setup Google Maps API (Alternatif)

## Langkah-langkah Setup

### 1. Buat/Aktifkan Google Cloud Project
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Pastikan billing sudah diaktifkan (Google Maps memerlukan billing account, tapi ada free tier $200/bulan)

### 2. Aktifkan Maps APIs
1. Buka [Google Maps Platform](https://console.cloud.google.com/google/maps-apis)
2. Aktifkan API berikut:
   - **Maps Embed API** (untuk embed map di website)
   - **Maps JavaScript API** (opsional, untuk fitur interaktif)
   - **Geocoding API** (opsional, untuk konversi alamat ke koordinat)

### 3. Buat API Key
1. Buka [Credentials](https://console.cloud.google.com/apis/credentials)
2. Klik "Create Credentials" → "API Key"
3. Copy API Key yang dihasilkan

### 4. Restrict API Key (Keamanan)
1. Klik API Key yang baru dibuat
2. Di "Application restrictions":
   - Pilih "HTTP referrers (web sites)"
   - Tambahkan domain:
     - `http://localhost:3000/*` (untuk development)
     - `https://yourdomain.com/*` (untuk production)
3. Di "API restrictions":
   - Pilih "Restrict key"
   - Centang: Maps Embed API, Maps JavaScript API, Geocoding API
4. Klik "Save"

### 5. Tambahkan ke Environment Variables
1. Buka file `.env`
2. Tambahkan:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. Restart development server

## Fitur yang Digunakan

### Maps Embed API
- Menampilkan peta statis di halaman profile user/UMKM
- Otomatis mencari lokasi berdasarkan alamat + kota
- Tidak memerlukan JavaScript tambahan
- Gratis untuk 25,000 loads per hari

### Cara Kerja
1. Sistem mengambil data alamat dan kota dari database
2. Menggabungkan alamat + kota menjadi query string
3. Embed Google Maps dengan query tersebut
4. Google Maps otomatis mencari dan menampilkan lokasi

## Contoh Penggunaan

```typescript
// Di halaman profile, map akan muncul jika ada alamat atau kota
const mapQuery = address 
  ? `${address}, ${city}` 
  : city;

// URL embed
https://www.google.com/maps/embed/v1/place?key=API_KEY&q=QUERY
```

## Troubleshooting

### Map tidak muncul
- Cek apakah API key sudah ditambahkan di `.env`
- Cek apakah Maps Embed API sudah diaktifkan
- Cek console browser untuk error message

### "This page can't load Google Maps correctly"
- API key salah atau belum diset
- Billing belum diaktifkan di Google Cloud
- Domain tidak ada di whitelist (HTTP referrers)

### Lokasi tidak akurat
- Alamat terlalu umum atau tidak lengkap
- Tambahkan detail alamat yang lebih spesifik di database
- Pertimbangkan untuk menyimpan latitude/longitude eksak

## Biaya

### Free Tier
- $200 kredit gratis per bulan
- Maps Embed API: Gratis untuk 25,000 loads/hari
- Setelah free tier: $7 per 1,000 loads

### Estimasi Biaya
- Website dengan 1,000 views/hari: **GRATIS**
- Website dengan 10,000 views/hari: **GRATIS**
- Website dengan 50,000 views/hari: ~$10/bulan

## Alternatif (Jika tidak ingin pakai Google Maps)

### OpenStreetMap (Gratis)
```html
<iframe 
  src="https://www.openstreetmap.org/export/embed.html?bbox=COORDINATES"
  width="100%" 
  height="200"
/>
```

### Leaflet.js (Open Source)
- Library JavaScript untuk interactive maps
- Menggunakan OpenStreetMap tiles
- Gratis tanpa API key

## Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Maps Embed API Guide](https://developers.google.com/maps/documentation/embed/get-started)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
