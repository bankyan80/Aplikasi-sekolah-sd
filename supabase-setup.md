# Environment Variables untuk Vercel

## PENTING: Gunakan format URL yang benar untuk Supabase

### Variable 1: DATABASE_URL (untuk aplikasi/pooler)
```
Key: DATABASE_URL
Value: postgresql://postgres.lryrzhkthqvqngvdopuy:fwoVhy9LnqqUFP2f@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Variable 2: DIRECT_DATABASE_URL (untuk migration)
```
Key: DIRECT_DATABASE_URL
Value: postgresql://postgres.lryrzhkthqvqngvdopuy:fwoVhy9LnqqUFP2f@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

## Cara Setting di Vercel:

1. Buka https://vercel.com/dashboard
2. Pilih project "aplikasi-sekolah-sd"
3. Klik Settings → Environment Variables
4. Hapus variabel lama jika ada
5. Tambahkan 2 variabel di atas dengan Value yang baru
6. Klik Save
7. Redeploy project
