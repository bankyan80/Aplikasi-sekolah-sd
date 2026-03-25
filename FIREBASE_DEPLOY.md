# Panduan Deploy ke Firebase Hosting

## Aplikasi Sekolah SD - Pembelajaran Jarak Jauh

---

## Prasyarat

1. **Akun Firebase** - Buat di [Firebase Console](https://console.firebase.google.com/)
2. **Firebase CLI** - Install dengan perintah:
   ```bash
   npm install -g firebase-tools
   ```

---

## Langkah-langkah Deploy

### 1. Login ke Firebase
```bash
npm run firebase:login
```
Atau:
```bash
firebase login
```

### 2. Buat Project Firebase (jika belum ada)
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add Project" atau "Tambah Project"
3. Masukkan nama project, contoh: `aplikasi-sekolah-sd`
4. Ikuti langkah-langkah pembuatan project
5. **CATAT PROJECT ID** - akan digunakan di langkah berikutnya

### 3. Update Konfigurasi Firebase
Edit file `.firebaserc` dan ganti `YOUR_FIREBASE_PROJECT_ID` dengan Project ID Anda:
```json
{
  "projects": {
    "default": "project-id-anda",
    "production": "project-id-anda"
  }
}
```

### 4. Inisialisasi Firebase (opsional jika sudah ada firebase.json)
```bash
npm run firebase:init
```
Pilih opsi:
- Hosting: Configure files for Firebase Hosting
- Use an existing project → pilih project Anda
- Public directory: `.next/standalone`
- Single-page app: Yes (untuk rewrite)
- Overwrite firebase.json: No (jika sudah ada)

### 5. Build Aplikasi
```bash
npm run build
```

### 6. Deploy ke Firebase Hosting
```bash
npm run firebase:deploy
```
Atau:
```bash
firebase deploy --only hosting
```

---

## Struktur File Firebase

```
├── firebase.json          # Konfigurasi Firebase Hosting
├── .firebaserc            # Konfigurasi project Firebase
├── .next/
│   └── standalone/        # Output build untuk deployment
└── public/                # File statis
```

---

## Konfigurasi firebase.json

```json
{
  "hosting": {
    "public": ".next/standalone",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/_next/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

---

## Perhatian Penting

### ⚠️ Aplikasi Menggunakan Server-Side Features

Aplikasi ini menggunakan:
- **API Routes** (`/api/*`) - Memerlukan server-side rendering
- **Prisma + SQLite** - Database lokal
- **Cookie-based Authentication** - Session management

### Solusi untuk Production:

#### Opsi 1: Firebase App Hosting (Rekomendasi)
Firebase App Hosting mendukung Next.js dengan server-side rendering:

```bash
# Install Firebase CLI versi terbaru
npm install -g firebase-tools@latest

# Init App Hosting
firebase init hosting

# Pilih "Web Frameworks" saat inisialisasi
# Firebase akan otomatis mendeteksi Next.js
```

#### Opsi 2: Vercel (Paling Mudah untuk Next.js)
1. Push kode ke GitHub
2. Hubungkan ke Vercel
3. Deploy otomatis

#### Opsi 3: Platform Lain
- **Railway** - railway.app
- **Render** - render.com
- **Fly.io** - fly.io

---

## Alternatif: Static Export (Tanpa API Routes)

Jika ingin deploy ke Firebase Hosting biasa, ubah `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: "export",  // Ubah dari "standalone" ke "export"
  // ... config lainnya
};
```

**Catatan**: Dengan static export, API routes tidak akan berfungsi. Anda perlu memindahkan logic ke client-side atau Firebase Functions.

---

## Environment Variables

Buat file `.env.production` untuk environment production:

```env
DATABASE_URL=file:/home/z/my-project/db/custom.db
# Atau gunakan database cloud seperti PostgreSQL/MySQL
```

---

## Troubleshooting

### Error: "Project not found"
- Pastikan Project ID di `.firebaserc` sudah benar
- Cek apakah Anda memiliki akses ke project tersebut

### Error: "Permission denied"
- Jalankan `firebase login` ulang
- Pastikan akun Anda memiliki akses ke project

### Build Error
```bash
# Hapus cache dan build ulang
rm -rf .next
npm run build
```

### Database Error
```bash
# Reset database
npm run db:reset
```

---

## Akun Demo Setelah Deploy

Jangan lupa untuk menjalankan "Buat Data Awal" di Admin Panel setelah deploy pertama kali:

1. Buka `https://your-app.web.app/admin`
2. Login dengan: `admin@sekolah.com / admin123`
3. Klik "Buat Data Awal"
4. Maka akun demo akan tersedia:

| Peran | Email | Password |
|-------|-------|----------|
| Admin | admin@sekolah.com | admin123 |
| Kepsek | kepsek1@sekolah.com | kepsek123 |
| Guru | guru1_sdn1@sekolah.com | guru123 |
| Siswa | siswa1@siswa.com | siswa123 |
| Wali | wali1@example.com | wali123 |

---

## Support

Jika mengalami masalah, cek:
- [Firebase Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
