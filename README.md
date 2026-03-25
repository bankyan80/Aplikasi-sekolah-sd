# 🏫 Aplikasi Sekolah SD - Pembelajaran Jarak Jauh

Aplikasi web untuk pembelajaran jarak jauh (PJJ) tingkat SD dengan tema merah dan efek glassmorphism modern.

## 📱 Fitur

### Aplikasi Guru & Kepala Sekolah
- Dashboard dengan statistik
- Manajemen materi ajar
- Pembuatan quiz dengan template DOCX
- Rekap nilai siswa
- Pencatatan kehadiran guru
- Pengaturan sekolah (termasuk logo)

### Aplikasi Siswa
- Melihat materi pembelajaran
- Mengerjakan quiz dengan timer
- Melihat nilai quiz
- Dashboard interaktif

### Aplikasi Wali Siswa
- Memantau nilai anak
- Melihat kehadiran anak
- Support banyak anak

### Admin Panel
- Kelola data sekolah
- Kelola user (kepsek, guru, siswa, wali)
- Reset password user

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Database**: SQLite + Prisma ORM
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Theme**: Red (Guru/Kepsek), Blue (Siswa), Green (Wali)

## 📁 Struktur Project

```
├── src/app/
│   ├── page.tsx              # Aplikasi Guru/Kepsek
│   ├── admin/page.tsx        # Admin Panel
│   ├── siswa/page.tsx        # Aplikasi Siswa
│   ├── wali/page.tsx         # Aplikasi Wali
│   └── api/                  # API Routes
├── prisma/
│   └── schema.prisma         # Database Schema
├── firebase.json             # Firebase Hosting config
└── package.json
```

## 🚀 Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/aplikasi-sekolah-sd.git
cd aplikasi-sekolah-sd
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Jalankan Development Server
```bash
npm run dev
```

### 5. Buka Browser
- **Guru/Kepsek**: http://localhost:3000
- **Siswa**: http://localhost:3000/siswa
- **Wali**: http://localhost:3000/wali
- **Admin**: http://localhost:3000/admin

## 🔐 Akun Demo

Setelah klik "Buat Data Awal" di Admin Panel:

| Peran | Email | Password |
|-------|-------|----------|
| Admin | admin@sekolah.com | admin123 |
| Kepala Sekolah | kepsek1@sekolah.com | kepsek123 |
| Guru Kelas | guru1_sdn1@sekolah.com | guru123 |
| Guru Mapel | guru2_sdn1@sekolah.com | guru123 |
| Siswa | siswa1@siswa.com | siswa123 |
| Wali Siswa | wali1@example.com | wali123 |

## 🌐 Deploy

### Vercel (Recommended)
1. Push ke GitHub
2. Import di [vercel.com](https://vercel.com)
3. Deploy otomatis

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

Lihat [FIREBASE_DEPLOY.md](./FIREBASE_DEPLOY.md) untuk detail.

## 📸 Screenshot

### Dashboard Kepala Sekolah
- Tema merah dengan glassmorphism
- Statistik guru, kelas, materi
- Logo Dinas Pendidikan Kabupaten Cirebon

### Aplikasi Siswa
- Tema biru
- Quiz dengan timer
- Nilai real-time

### Aplikasi Wali
- Tema hijau
- Monitor nilai dan kehadiran anak

## 📄 License

MIT License

## 👨‍💻 Author

Created for Dinas Pendidikan Kabupaten Cirebon

---

**Tahun Pelajaran 2025/2026** | Jenjang SD (Sekolah Dasar)
