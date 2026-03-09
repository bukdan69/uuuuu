import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Elektronik',
    slug: 'elektronik',
    description: 'Perangkat elektronik dan gadget',
    icon: 'Zap',
    color: '#3B82F6', // Blue
    subcategories: [
      { name: 'Audio', slug: 'audio' },
      { name: 'Headphone & Earphone', slug: 'headphone-earphone' },
      { name: 'Speaker', slug: 'speaker' },
      { name: 'Smart Home', slug: 'smart-home' },
      { name: 'Wearable Device', slug: 'wearable-device' },
      { name: 'Gadget Lainnya', slug: 'gadget-lainnya' },
    ],
  },
  {
    name: 'Handphone & Aksesoris',
    slug: 'handphone-aksesoris',
    description: 'Smartphone, tablet, dan aksesoris',
    icon: 'Smartphone',
    color: '#8B5CF6', // Purple
    subcategories: [
      { name: 'Smartphone', slug: 'smartphone' },
      { name: 'Tablet', slug: 'tablet' },
      { name: 'Charger & Kabel', slug: 'charger-kabel' },
      { name: 'Powerbank', slug: 'powerbank' },
      { name: 'Case & Cover', slug: 'case-cover' },
      { name: 'Screen Protector', slug: 'screen-protector' },
    ],
  },
  {
    name: 'Komputer & Aksesoris',
    slug: 'komputer-aksesoris',
    description: 'Laptop, PC, dan aksesoris komputer',
    icon: 'Monitor',
    color: '#06B6D4', // Cyan
    subcategories: [
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Desktop PC', slug: 'desktop-pc' },
      { name: 'Monitor', slug: 'monitor' },
      { name: 'Keyboard & Mouse', slug: 'keyboard-mouse' },
      { name: 'Storage (SSD/HDD)', slug: 'storage' },
      { name: 'Komponen PC', slug: 'komponen-pc' },
    ],
  },
  {
    name: 'Kamera',
    slug: 'kamera',
    description: 'Kamera dan aksesoris fotografi',
    icon: 'Camera',
    color: '#EC4899', // Pink
    subcategories: [
      { name: 'Kamera DSLR', slug: 'kamera-dslr' },
      { name: 'Kamera Mirrorless', slug: 'kamera-mirrorless' },
      { name: 'Action Camera', slug: 'action-camera' },
      { name: 'Lensa Kamera', slug: 'lensa-kamera' },
      { name: 'Tripod', slug: 'tripod' },
      { name: 'Aksesoris Kamera', slug: 'aksesoris-kamera' },
    ],
  },
  {
    name: 'TV & Home Entertainment',
    slug: 'tv-home-entertainment',
    description: 'TV dan perangkat hiburan rumah',
    icon: 'Tv',
    color: '#F59E0B', // Amber
    subcategories: [
      { name: 'Smart TV', slug: 'smart-tv' },
      { name: 'Android TV Box', slug: 'android-tv-box' },
      { name: 'Proyektor', slug: 'proyektor' },
      { name: 'Home Theater', slug: 'home-theater' },
      { name: 'TV Accessories', slug: 'tv-accessories' },
      { name: 'TV Bracket', slug: 'tv-bracket' },
    ],
  },
  {
    name: 'Peralatan Rumah Tangga',
    slug: 'peralatan-rumah-tangga',
    description: 'Peralatan elektronik rumah tangga',
    icon: 'Home',
    color: '#10B981', // Emerald
    subcategories: [
      { name: 'Vacuum Cleaner', slug: 'vacuum-cleaner' },
      { name: 'Setrika', slug: 'setrika' },
      { name: 'Mesin Cuci', slug: 'mesin-cuci' },
      { name: 'Kipas Angin', slug: 'kipas-angin' },
      { name: 'AC', slug: 'ac' },
      { name: 'Air Purifier', slug: 'air-purifier' },
    ],
  },
  {
    name: 'Rumah & Dekorasi',
    slug: 'rumah-dekorasi',
    description: 'Dekorasi dan perlengkapan rumah',
    icon: 'Sofa',
    color: '#EF4444', // Red
    subcategories: [
      { name: 'Dekorasi Rumah', slug: 'dekorasi-rumah' },
      { name: 'Lampu', slug: 'lampu' },
      { name: 'Karpet', slug: 'karpet' },
      { name: 'Gorden', slug: 'gorden' },
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Tanaman Hias', slug: 'tanaman-hias' },
    ],
  },
  {
    name: 'Dapur',
    slug: 'dapur',
    description: 'Peralatan dan perlengkapan dapur',
    icon: 'ChefHat',
    color: '#F97316', // Orange
    subcategories: [
      { name: 'Alat Masak', slug: 'alat-masak' },
      { name: 'Alat Makan', slug: 'alat-makan' },
      { name: 'Peralatan Baking', slug: 'peralatan-baking' },
      { name: 'Pisau Dapur', slug: 'pisau-dapur' },
      { name: 'Penyimpanan Makanan', slug: 'penyimpanan-makanan' },
      { name: 'Alat Kopi & Teh', slug: 'alat-kopi-teh' },
    ],
  },
  {
    name: 'Makanan & Minuman',
    slug: 'makanan-minuman',
    description: 'Produk makanan dan minuman',
    icon: 'UtensilsCrossed',
    color: '#84CC16', // Lime
    subcategories: [
      { name: 'Snack', slug: 'snack' },
      { name: 'Minuman', slug: 'minuman' },
      { name: 'Bumbu Masak', slug: 'bumbu-masak' },
      { name: 'Frozen Food', slug: 'frozen-food' },
      { name: 'Produk Organik', slug: 'produk-organik' },
      { name: 'Makanan Instan', slug: 'makanan-instan' },
    ],
  },
  {
    name: 'Kesehatan',
    slug: 'kesehatan',
    description: 'Produk kesehatan dan suplemen',
    icon: 'Heart',
    color: '#14B8A6', // Teal
    subcategories: [
      { name: 'Vitamin', slug: 'vitamin' },
      { name: 'Suplemen', slug: 'suplemen' },
      { name: 'Alat Kesehatan', slug: 'alat-kesehatan' },
      { name: 'Masker', slug: 'masker' },
      { name: 'Termometer', slug: 'termometer' },
      { name: 'Obat Herbal', slug: 'obat-herbal' },
    ],
  },
  {
    name: 'Kecantikan',
    slug: 'kecantikan',
    description: 'Produk kecantikan dan perawatan',
    icon: 'Sparkles',
    color: '#A855F7', // Purple
    subcategories: [
      { name: 'Makeup', slug: 'makeup' },
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Hair Care', slug: 'hair-care' },
      { name: 'Body Care', slug: 'body-care' },
      { name: 'Beauty Tools', slug: 'beauty-tools' },
      { name: 'Parfum', slug: 'parfum' },
    ],
  },
  {
    name: 'Perawatan Pria',
    slug: 'perawatan-pria',
    description: 'Produk perawatan khusus pria',
    icon: 'User',
    color: '#6366F1', // Indigo
    subcategories: [
      { name: 'Skincare Pria', slug: 'skincare-pria' },
      { name: 'Shaving', slug: 'shaving' },
      { name: 'Hair Styling', slug: 'hair-styling' },
      { name: 'Parfum Pria', slug: 'parfum-pria' },
      { name: 'Grooming Tools', slug: 'grooming-tools' },
      { name: 'Body Care Pria', slug: 'body-care-pria' },
    ],
  },
  {
    name: 'Ibu & Bayi',
    slug: 'ibu-bayi',
    description: 'Perlengkapan ibu dan bayi',
    icon: 'Baby',
    color: '#F472B6', // Pink
    subcategories: [
      { name: 'Popok', slug: 'popok' },
      { name: 'Susu Bayi', slug: 'susu-bayi' },
      { name: 'Stroller', slug: 'stroller' },
      { name: 'Perlengkapan Makan Bayi', slug: 'perlengkapan-makan-bayi' },
      { name: 'Mainan Bayi', slug: 'mainan-bayi' },
      { name: 'Pakaian Bayi', slug: 'pakaian-bayi' },
    ],
  },
  {
    name: 'Fashion Wanita',
    slug: 'fashion-wanita',
    description: 'Pakaian dan fashion wanita',
    icon: 'Shirt',
    color: '#EC4899', // Pink
    subcategories: [
      { name: 'Dress', slug: 'dress' },
      { name: 'Atasan', slug: 'atasan' },
      { name: 'Celana', slug: 'celana' },
      { name: 'Rok', slug: 'rok' },
      { name: 'Outerwear', slug: 'outerwear' },
      { name: 'Lingerie', slug: 'lingerie' },
    ],
  },
  {
    name: 'Fashion Pria',
    slug: 'fashion-pria',
    description: 'Pakaian dan fashion pria',
    icon: 'ShirtIcon',
    color: '#0EA5E9', // Sky Blue
    subcategories: [
      { name: 'Kaos', slug: 'kaos' },
      { name: 'Kemeja', slug: 'kemeja' },
      { name: 'Jaket', slug: 'jaket' },
      { name: 'Celana', slug: 'celana-pria' },
      { name: 'Underwear', slug: 'underwear' },
      { name: 'Pakaian Olahraga', slug: 'pakaian-olahraga' },
    ],
  },
  {
    name: 'Fashion Muslim',
    slug: 'fashion-muslim',
    description: 'Pakaian muslim dan aksesoris',
    icon: 'Moon',
    color: '#059669', // Green
    subcategories: [
      { name: 'Hijab', slug: 'hijab' },
      { name: 'Gamis', slug: 'gamis' },
      { name: 'Baju Koko', slug: 'baju-koko' },
      { name: 'Mukena', slug: 'mukena' },
      { name: 'Sarung', slug: 'sarung' },
      { name: 'Aksesoris Muslim', slug: 'aksesoris-muslim' },
    ],
  },
  {
    name: 'Sepatu Wanita',
    slug: 'sepatu-wanita',
    description: 'Sepatu dan sandal wanita',
    icon: 'Footprints',
    color: '#D946EF', // Fuchsia
    subcategories: [
      { name: 'Sneakers', slug: 'sneakers-wanita' },
      { name: 'Heels', slug: 'heels' },
      { name: 'Flat Shoes', slug: 'flat-shoes' },
      { name: 'Sandal', slug: 'sandal-wanita' },
      { name: 'Boots', slug: 'boots-wanita' },
      { name: 'Wedges', slug: 'wedges' },
    ],
  },
  {
    name: 'Sepatu Pria',
    slug: 'sepatu-pria',
    description: 'Sepatu dan sandal pria',
    icon: 'Footprints',
    color: '#0284C7', // Blue
    subcategories: [
      { name: 'Sneakers', slug: 'sneakers-pria' },
      { name: 'Formal Shoes', slug: 'formal-shoes' },
      { name: 'Sandal', slug: 'sandal-pria' },
      { name: 'Boots', slug: 'boots-pria' },
      { name: 'Loafers', slug: 'loafers' },
      { name: 'Sepatu Olahraga', slug: 'sepatu-olahraga' },
    ],
  },
  {
    name: 'Tas Wanita',
    slug: 'tas-wanita',
    description: 'Tas dan dompet wanita',
    icon: 'ShoppingBag',
    color: '#DB2777', // Pink
    subcategories: [
      { name: 'Handbag', slug: 'handbag' },
      { name: 'Sling Bag', slug: 'sling-bag-wanita' },
      { name: 'Backpack', slug: 'backpack-wanita' },
      { name: 'Clutch', slug: 'clutch' },
      { name: 'Tote Bag', slug: 'tote-bag' },
      { name: 'Travel Bag', slug: 'travel-bag-wanita' },
    ],
  },
  {
    name: 'Tas Pria',
    slug: 'tas-pria',
    description: 'Tas dan dompet pria',
    icon: 'Briefcase',
    color: '#0891B2', // Cyan
    subcategories: [
      { name: 'Backpack', slug: 'backpack-pria' },
      { name: 'Sling Bag', slug: 'sling-bag-pria' },
      { name: 'Laptop Bag', slug: 'laptop-bag' },
      { name: 'Waist Bag', slug: 'waist-bag' },
      { name: 'Travel Bag', slug: 'travel-bag-pria' },
      { name: 'Briefcase', slug: 'briefcase' },
    ],
  },
  {
    name: 'Jam Tangan',
    slug: 'jam-tangan',
    description: 'Jam tangan dan aksesoris',
    icon: 'Watch',
    color: '#7C3AED', // Violet
    subcategories: [
      { name: 'Jam Pria', slug: 'jam-pria' },
      { name: 'Jam Wanita', slug: 'jam-wanita' },
      { name: 'Smartwatch', slug: 'smartwatch' },
      { name: 'Jam Anak', slug: 'jam-anak' },
      { name: 'Strap Jam', slug: 'strap-jam' },
      { name: 'Aksesoris Jam', slug: 'aksesoris-jam' },
    ],
  },
  {
    name: 'Olahraga & Outdoor',
    slug: 'olahraga-outdoor',
    description: 'Peralatan olahraga dan outdoor',
    icon: 'Dumbbell',
    color: '#DC2626', // Red
    subcategories: [
      { name: 'Fitness', slug: 'fitness' },
      { name: 'Camping', slug: 'camping' },
      { name: 'Sepeda', slug: 'sepeda' },
      { name: 'Sepak Bola', slug: 'sepak-bola' },
      { name: 'Alat Gym', slug: 'alat-gym' },
      { name: 'Hiking', slug: 'hiking' },
    ],
  },
  {
    name: 'Otomotif',
    slug: 'otomotif',
    description: 'Aksesoris dan sparepart kendaraan',
    icon: 'Car',
    color: '#EA580C', // Orange
    subcategories: [
      { name: 'Aksesoris Mobil', slug: 'aksesoris-mobil' },
      { name: 'Aksesoris Motor', slug: 'aksesoris-motor' },
      { name: 'Sparepart Mobil', slug: 'sparepart-mobil' },
      { name: 'Sparepart Motor', slug: 'sparepart-motor' },
      { name: 'Helm', slug: 'helm' },
      { name: 'Oli & Cairan', slug: 'oli-cairan' },
    ],
  },
  {
    name: 'Hobi & Koleksi',
    slug: 'hobi-koleksi',
    description: 'Barang hobi dan koleksi',
    icon: 'Gamepad2',
    color: '#7C3AED', // Violet
    subcategories: [
      { name: 'Action Figure', slug: 'action-figure' },
      { name: 'Model Kit', slug: 'model-kit' },
      { name: 'Trading Card', slug: 'trading-card' },
      { name: 'RC Toys', slug: 'rc-toys' },
      { name: 'Koleksi Antik', slug: 'koleksi-antik' },
      { name: 'Merchandise', slug: 'merchandise' },
    ],
  },
  {
    name: 'Buku & Alat Tulis',
    slug: 'buku-alat-tulis',
    description: 'Buku dan perlengkapan tulis',
    icon: 'BookOpen',
    color: '#CA8A04', // Yellow
    subcategories: [
      { name: 'Buku Pelajaran', slug: 'buku-pelajaran' },
      { name: 'Novel', slug: 'novel' },
      { name: 'Komik', slug: 'komik' },
      { name: 'Stationery', slug: 'stationery' },
      { name: 'Perlengkapan Kantor', slug: 'perlengkapan-kantor' },
      { name: 'Perlengkapan Sekolah', slug: 'perlengkapan-sekolah' },
    ],
  },
  // ============================================
  // KATEGORI TAMBAHAN UNTUK UMKM
  // ============================================
  {
    name: 'Jasa',
    slug: 'jasa',
    description: 'Berbagai layanan jasa profesional dan kreatif',
    icon: 'Wrench',
    color: '#0891B2', // Cyan
    subcategories: [
      { name: 'Jasa Jahit', slug: 'jasa-jahit' },
      { name: 'Jasa Kreatif', slug: 'jasa-kreatif' },
      { name: 'Jasa Desain', slug: 'jasa-desain' },
      { name: 'Jasa Fotografi', slug: 'jasa-fotografi' },
      { name: 'Jasa Event', slug: 'jasa-event' },
      { name: 'Jasa Lainnya', slug: 'jasa-lainnya' },
    ],
  },
  {
    name: 'Kuliner & Kue',
    slug: 'kuliner-kue',
    description: 'Makanan olahan, kue, dan produk kuliner UMKM',
    icon: 'Cookie',
    color: '#F59E0B', // Amber
    subcategories: [
      { name: 'Kue Kering', slug: 'kue-kering' },
      { name: 'Kue Basah', slug: 'kue-basah' },
      { name: 'Roti & Bakery', slug: 'roti-bakery' },
      { name: 'Makanan Olahan', slug: 'makanan-olahan' },
      { name: 'Catering', slug: 'catering' },
      { name: 'Frozen Food Homemade', slug: 'frozen-food-homemade' },
    ],
  },
  {
    name: 'Kerajinan Tangan',
    slug: 'kerajinan-tangan',
    description: 'Produk handmade dan kerajinan lokal',
    icon: 'Scissors',
    color: '#EC4899', // Pink
    subcategories: [
      { name: 'Handmade & Craft', slug: 'handmade-craft' },
      { name: 'Aksesoris Handmade', slug: 'aksesoris-handmade' },
      { name: 'Dekorasi Handmade', slug: 'dekorasi-handmade' },
      { name: 'Souvenir', slug: 'souvenir' },
      { name: 'Rajutan & Bordir', slug: 'rajutan-bordir' },
      { name: 'Kerajinan Kayu', slug: 'kerajinan-kayu' },
    ],
  },
  {
    name: 'Properti',
    slug: 'properti',
    description: 'Jual beli dan sewa properti',
    icon: 'Building2',
    color: '#059669', // Green
    subcategories: [
      { name: 'Rumah', slug: 'rumah' },
      { name: 'Tanah', slug: 'tanah' },
      { name: 'Apartemen', slug: 'apartemen' },
      { name: 'Ruko', slug: 'ruko' },
      { name: 'Kost', slug: 'kost' },
      { name: 'Gudang', slug: 'gudang' },
    ],
  },
  {
    name: 'Kendaraan',
    slug: 'kendaraan',
    description: 'Jual beli kendaraan bermotor dan non-motor',
    icon: 'Bike',
    color: '#DC2626', // Red
    subcategories: [
      { name: 'Mobil', slug: 'mobil' },
      { name: 'Motor', slug: 'motor' },
      { name: 'Sepeda', slug: 'sepeda-kendaraan' },
      { name: 'Truk & Alat Berat', slug: 'truk-alat-berat' },
      { name: 'Kendaraan Listrik', slug: 'kendaraan-listrik' },
      { name: 'Aksesoris Kendaraan', slug: 'aksesoris-kendaraan' },
    ],
  },
  {
    name: 'Fashion Lokal',
    slug: 'fashion-lokal',
    description: 'Produk fashion dan pakaian lokal Indonesia',
    icon: 'Store',
    color: '#8B5CF6', // Purple
    subcategories: [
      { name: 'Batik', slug: 'batik' },
      { name: 'Tenun', slug: 'tenun' },
      { name: 'Pakaian Adat', slug: 'pakaian-adat' },
      { name: 'Fashion Etnik', slug: 'fashion-etnik' },
      { name: 'Aksesoris Lokal', slug: 'aksesoris-lokal' },
      { name: 'Tas Lokal', slug: 'tas-lokal' },
    ],
  },
  {
    name: 'Kopi & Minuman',
    slug: 'kopi-minuman',
    description: 'Kopi, teh, dan minuman khas lokal',
    icon: 'Coffee',
    color: '#92400E', // Brown
    subcategories: [
      { name: 'Kopi Lokal', slug: 'kopi-lokal' },
      { name: 'Teh Lokal', slug: 'teh-lokal' },
      { name: 'Minuman Herbal', slug: 'minuman-herbal' },
      { name: 'Minuman Tradisional', slug: 'minuman-tradisional' },
      { name: 'Sirup & Sari Buah', slug: 'sirup-sari-buah' },
      { name: 'Minuman Kemasan', slug: 'minuman-kemasan' },
    ],
  },
  {
    name: 'Produk Kecantikan Lokal',
    slug: 'produk-kecantikan-lokal',
    description: 'Produk kecantikan dan perawatan lokal',
    icon: 'Sparkle',
    color: '#DB2777', // Pink
    subcategories: [
      { name: 'Skincare Lokal', slug: 'skincare-lokal' },
      { name: 'Makeup Lokal', slug: 'makeup-lokal' },
      { name: 'Sabun Handmade', slug: 'sabun-handmade' },
      { name: 'Lulur & Scrub', slug: 'lulur-scrub' },
      { name: 'Minyak Aromaterapi', slug: 'minyak-aromaterapi' },
      { name: 'Perawatan Rambut Lokal', slug: 'perawatan-rambut-lokal' },
    ],
  },
  {
    name: 'Tanaman & Pertanian',
    slug: 'tanaman-pertanian',
    description: 'Tanaman hias, bibit, dan produk pertanian',
    icon: 'Sprout',
    color: '#16A34A', // Green
    subcategories: [
      { name: 'Tanaman Hias Indoor', slug: 'tanaman-hias-indoor' },
      { name: 'Tanaman Hias Outdoor', slug: 'tanaman-hias-outdoor' },
      { name: 'Bibit Tanaman', slug: 'bibit-tanaman' },
      { name: 'Pupuk & Media Tanam', slug: 'pupuk-media-tanam' },
      { name: 'Alat Berkebun', slug: 'alat-berkebun' },
      { name: 'Hasil Pertanian', slug: 'hasil-pertanian' },
    ],
  },
  {
    name: 'Perlengkapan Hewan',
    slug: 'perlengkapan-hewan',
    description: 'Makanan dan perlengkapan hewan peliharaan',
    icon: 'PawPrint',
    color: '#EA580C', // Orange
    subcategories: [
      { name: 'Makanan Hewan', slug: 'makanan-hewan' },
      { name: 'Aksesoris Hewan', slug: 'aksesoris-hewan' },
      { name: 'Kandang & Tempat Tidur', slug: 'kandang-tempat-tidur' },
      { name: 'Mainan Hewan', slug: 'mainan-hewan' },
      { name: 'Perawatan Hewan', slug: 'perawatan-hewan' },
      { name: 'Obat & Vitamin Hewan', slug: 'obat-vitamin-hewan' },
    ],
  },
  {
    name: 'Alat Musik',
    slug: 'alat-musik',
    description: 'Alat musik dan aksesoris musik',
    icon: 'Music',
    color: '#7C3AED', // Violet
    subcategories: [
      { name: 'Gitar', slug: 'gitar' },
      { name: 'Keyboard & Piano', slug: 'keyboard-piano' },
      { name: 'Drum & Perkusi', slug: 'drum-perkusi' },
      { name: 'Alat Musik Tradisional', slug: 'alat-musik-tradisional' },
      { name: 'Aksesoris Musik', slug: 'aksesoris-musik' },
      { name: 'Audio Recording', slug: 'audio-recording' },
    ],
  },
  {
    name: 'Mainan & Hobi Anak',
    slug: 'mainan-hobi-anak',
    description: 'Mainan edukatif dan hobi untuk anak',
    icon: 'Puzzle',
    color: '#F472B6', // Pink
    subcategories: [
      { name: 'Mainan Edukatif', slug: 'mainan-edukatif' },
      { name: 'Boneka & Plushie', slug: 'boneka-plushie' },
      { name: 'Puzzle & Board Game', slug: 'puzzle-board-game' },
      { name: 'Mainan Outdoor', slug: 'mainan-outdoor' },
      { name: 'Mainan Remote Control', slug: 'mainan-remote-control' },
      { name: 'Alat Tulis Anak', slug: 'alat-tulis-anak' },
    ],
  },
  {
    name: 'Perlengkapan Kantor',
    slug: 'perlengkapan-kantor',
    description: 'Peralatan dan furniture kantor',
    icon: 'Briefcase',
    color: '#475569', // Slate
    subcategories: [
      { name: 'Meja & Kursi Kantor', slug: 'meja-kursi-kantor' },
      { name: 'Alat Tulis Kantor', slug: 'alat-tulis-kantor' },
      { name: 'Filling & Storage', slug: 'filling-storage' },
      { name: 'Printer & Scanner', slug: 'printer-scanner' },
      { name: 'Papan Tulis & Presentasi', slug: 'papan-tulis-presentasi' },
      { name: 'Perlengkapan Meeting', slug: 'perlengkapan-meeting' },
    ],
  },
  {
    name: 'Perlengkapan Ibadah',
    slug: 'perlengkapan-ibadah',
    description: 'Perlengkapan untuk kegiatan ibadah',
    icon: 'BookHeart',
    color: '#059669', // Green
    subcategories: [
      { name: 'Al-Quran & Kitab', slug: 'alquran-kitab' },
      { name: 'Sajadah', slug: 'sajadah' },
      { name: 'Tasbih & Aksesoris', slug: 'tasbih-aksesoris' },
      { name: 'Peci & Kopiah', slug: 'peci-kopiah' },
      { name: 'Parfum & Minyak Wangi', slug: 'parfum-minyak-wangi' },
      { name: 'Dekorasi Islami', slug: 'dekorasi-islami' },
    ],
  },
  {
    name: 'Lainnya',
    slug: 'lainnya',
    description: 'Kategori produk dan jasa lainnya',
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    subcategories: [
      { name: 'Barang Antik', slug: 'barang-antik' },
      { name: 'Barang Bekas', slug: 'barang-bekas' },
      { name: 'Jasa Umum', slug: 'jasa-umum' },
      { name: 'Produk Digital', slug: 'produk-digital' },
      { name: 'Voucher & Tiket', slug: 'voucher-tiket' },
      { name: 'Lain-lain', slug: 'lain-lain' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding categories and subcategories...');

  for (const category of categories) {
    const { subcategories, icon, color, ...categoryData } = category;

    // Create parent category
    const createdCategory = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        ...categoryData,
        icon,
        color,
      },
      create: {
        ...categoryData,
        icon,
        color,
        isActive: true,
        listingCount: 0,
      },
    });

    console.log(`✅ Created category: ${createdCategory.name} (${icon} ${color})`);

    // Create subcategories
    for (const subcategory of subcategories) {
      await prisma.category.upsert({
        where: { slug: subcategory.slug },
        update: {
          ...subcategory,
          parentId: createdCategory.id,
        },
        create: {
          ...subcategory,
          parentId: createdCategory.id,
          isActive: true,
          listingCount: 0,
        },
      });
    }

    console.log(`   ↳ Created ${subcategories.length} subcategories`);
  }

  console.log('✨ Seeding completed!');
  console.log(`📊 Total: ${categories.length} categories, ${categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
