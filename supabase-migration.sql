-- Migration: Create all tables for Aplikasi Sekolah SD
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Sekolah
CREATE TABLE IF NOT EXISTS "Sekolah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "npsn" TEXT NOT NULL,
    "alamat" TEXT,
    "jenjang" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL DEFAULT '2025/2026',
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sekolah_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Sekolah_npsn_key" ON "Sekolah"("npsn");

-- User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "foto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sekolahId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Guru
CREATE TABLE IF NOT EXISTS "Guru" (
    "id" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telepon" TEXT,
    "alamat" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "jenisGuru" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guru_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Guru_nip_key" ON "Guru"("nip");
CREATE UNIQUE INDEX IF NOT EXISTS "Guru_userId_key" ON "Guru"("userId");

-- Wali Siswa
CREATE TABLE IF NOT EXISTS "WaliSiswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telepon" TEXT,
    "alamat" TEXT,
    "hubungan" TEXT NOT NULL,
    "pekerjaan" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaliSiswa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WaliSiswa_userId_key" ON "WaliSiswa"("userId");

-- Kelas
CREATE TABLE IF NOT EXISTS "Kelas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tingkat" TEXT NOT NULL,
    "rombel" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kelas_pkey" PRIMARY KEY ("id")
);

-- Siswa
CREATE TABLE IF NOT EXISTS "Siswa" (
    "id" TEXT NOT NULL,
    "nisn" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenkel" TEXT,
    "tempatLahir" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "telepon" TEXT,
    "kelasId" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "waliId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Siswa_nisn_key" ON "Siswa"("nisn");
CREATE UNIQUE INDEX IF NOT EXISTS "Siswa_userId_key" ON "Siswa"("userId");

-- Mata Pelajaran
CREATE TABLE IF NOT EXISTS "MataPelajaran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT,
    "deskripsi" TEXT,
    "kelasId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "sekolahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MataPelajaran_pkey" PRIMARY KEY ("id")
);

-- Materi
CREATE TABLE IF NOT EXISTS "Materi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "gambar" TEXT,
    "fileUrl" TEXT,
    "kategori" TEXT NOT NULL,
    "mapelId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materi_pkey" PRIMARY KEY ("id")
);

-- Quiz
CREATE TABLE IF NOT EXISTS "Quiz" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "jenis" TEXT NOT NULL,
    "durasi" INTEGER NOT NULL DEFAULT 60,
    "mapelId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- Soal Quiz
CREATE TABLE IF NOT EXISTS "SoalQuiz" (
    "id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "opsiA" TEXT NOT NULL,
    "opsiB" TEXT NOT NULL,
    "opsiC" TEXT,
    "opsiD" TEXT,
    "jawaban" TEXT NOT NULL,
    "gambar" TEXT,
    "quizId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoalQuiz_pkey" PRIMARY KEY ("id")
);

-- Nilai Quiz
CREATE TABLE IF NOT EXISTS "NilaiQuiz" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "nilai" DOUBLE PRECISION NOT NULL,
    "selesai" BOOLEAN NOT NULL DEFAULT false,
    "waktuMulai" TIMESTAMP(3),
    "waktuSelesai" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NilaiQuiz_pkey" PRIMARY KEY ("id")
);

-- Kehadiran Guru
CREATE TABLE IF NOT EXISTS "KehadiranGuru" (
    "id" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KehadiranGuru_pkey" PRIMARY KEY ("id")
);

-- Kehadiran Siswa
CREATE TABLE IF NOT EXISTS "KehadiranSiswa" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KehadiranSiswa_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "User" ADD CONSTRAINT "User_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Guru" ADD CONSTRAINT "Guru_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Guru" ADD CONSTRAINT "Guru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WaliSiswa" ADD CONSTRAINT "WaliSiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Kelas" ADD CONSTRAINT "Kelas_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_waliId_fkey" FOREIGN KEY ("waliId") REFERENCES "WaliSiswa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MataPelajaran" ADD CONSTRAINT "MataPelajaran_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MataPelajaran" ADD CONSTRAINT "MataPelajaran_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MataPelajaran" ADD CONSTRAINT "MataPelajaran_sekolahId_fkey" FOREIGN KEY ("sekolahId") REFERENCES "Sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_mapelId_fkey" FOREIGN KEY ("mapelId") REFERENCES "MataPelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SoalQuiz" ADD CONSTRAINT "SoalQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NilaiQuiz" ADD CONSTRAINT "NilaiQuiz_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NilaiQuiz" ADD CONSTRAINT "NilaiQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KehadiranGuru" ADD CONSTRAINT "KehadiranGuru_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "Guru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KehadiranGuru" ADD CONSTRAINT "KehadiranGuru_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KehadiranSiswa" ADD CONSTRAINT "KehadiranSiswa_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "Siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "User_sekolahId_idx" ON "User"("sekolahId");
CREATE INDEX IF NOT EXISTS "Guru_sekolahId_idx" ON "Guru"("sekolahId");
CREATE INDEX IF NOT EXISTS "Kelas_sekolahId_idx" ON "Kelas"("sekolahId");
CREATE INDEX IF NOT EXISTS "Siswa_sekolahId_idx" ON "Siswa"("sekolahId");
CREATE INDEX IF NOT EXISTS "Siswa_kelasId_idx" ON "Siswa"("kelasId");
CREATE INDEX IF NOT EXISTS "MataPelajaran_sekolahId_idx" ON "MataPelajaran"("sekolahId");
CREATE INDEX IF NOT EXISTS "Materi_mapelId_idx" ON "Materi"("mapelId");
CREATE INDEX IF NOT EXISTS "Quiz_mapelId_idx" ON "Quiz"("mapelId");
CREATE INDEX IF NOT EXISTS "SoalQuiz_quizId_idx" ON "SoalQuiz"("quizId");
CREATE INDEX IF NOT EXISTS "NilaiQuiz_siswaId_idx" ON "NilaiQuiz"("siswaId");
CREATE INDEX IF NOT EXISTS "KehadiranSiswa_siswaId_idx" ON "KehadiranSiswa"("siswaId");
