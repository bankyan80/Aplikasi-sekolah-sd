import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Check if schools already exist
    const existingSchools = await prisma.sekolah.count();

    if (existingSchools > 0) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: true,
        message: 'Data sudah ada sebelumnya',
      });
    }

    // Create sample school
    const school = await prisma.sekolah.create({
      data: {
        nama: 'SD Negeri 1 Contoh',
        npsn: '12345678',
        alamat: 'Jl. Pendidikan No. 1, Kota Contoh',
        jenjang: 'SD',
        tahunAjaran: '2025/2026',
      },
    });

    // Create default classes
    const tingkatList = ['1', '2', '3', '4', '5', '6'];
    const rombelList = ['A', 'B'];

    for (const tingkat of tingkatList) {
      for (const rombel of rombelList) {
        await prisma.kelas.create({
          data: {
            nama: `Kelas ${tingkat}${rombel}`,
            tingkat,
            rombel,
            sekolahId: school.id,
          },
        });
      }
    }

    // Create Kepala Sekolah
    const kepsek = await prisma.user.create({
      data: {
        email: 'kepsek@sekolah.com',
        password: 'kepsek123',
        nama: 'Ibu Siti Aminah, S.Pd',
        role: 'kepala_sekolah',
        sekolahId: school.id,
        isActive: true,
      },
    });

    await prisma.guru.create({
      data: {
        nip: '198001011',
        nama: 'Ibu Siti Aminah, S.Pd',
        email: 'kepsek@sekolah.com',
        telepon: '08123456789',
        alamat: 'Jl. Utama No. 1',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school.id,
        userId: kepsek.id,
      },
    });

    // Create Guru Kelas
    const guru1 = await prisma.user.create({
      data: {
        email: 'guru1@sekolah.com',
        password: 'guru123',
        nama: 'Ibu Ratna Dewi, S.Pd',
        role: 'guru_kelas',
        sekolahId: school.id,
        isActive: true,
      },
    });

    await prisma.guru.create({
      data: {
        nip: '198501012',
        nama: 'Ibu Ratna Dewi, S.Pd',
        email: 'guru1@sekolah.com',
        telepon: '08123456790',
        alamat: 'Jl. Pendidikan No. 2',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school.id,
        userId: guru1.id,
      },
    });

    // Create Guru Mapel
    const guru2 = await prisma.user.create({
      data: {
        email: 'guru2@sekolah.com',
        password: 'guru123',
        nama: 'Bapak Ahmad Fauzi, S.Pd',
        role: 'guru_mapel',
        sekolahId: school.id,
        isActive: true,
      },
    });

    await prisma.guru.create({
      data: {
        nip: '198703014',
        nama: 'Bapak Ahmad Fauzi, S.Pd',
        email: 'guru2@sekolah.com',
        telepon: '08123456792',
        alamat: 'Jl. Pendidikan No. 4',
        status: 'aktif',
        jenisGuru: 'guru_mapel',
        sekolahId: school.id,
        userId: guru2.id,
      },
    });

    // Create Wali
    const waliUser = await prisma.user.create({
      data: {
        email: 'wali@example.com',
        password: 'wali123',
        nama: 'Bapak Susanto',
        role: 'wali',
        isActive: true,
      },
    });

    const wali = await prisma.waliSiswa.create({
      data: {
        nama: 'Bapak Susanto',
        email: 'wali@example.com',
        telepon: '08123456900',
        alamat: 'Jl. Keluarga No. 1',
        hubungan: 'ayah',
        pekerjaan: 'Wiraswasta',
        userId: waliUser.id,
      },
    });

    // Create Siswa
    const kelas1A = await prisma.kelas.findFirst({
      where: { sekolahId: school.id, nama: 'Kelas 1A' },
    });

    if (kelas1A) {
      const siswaUser = await prisma.user.create({
        data: {
          email: 'siswa1@siswa.com',
          password: 'siswa123',
          nama: 'Andi Pratama',
          role: 'siswa',
          sekolahId: school.id,
          isActive: true,
        },
      });

      await prisma.siswa.create({
        data: {
          nisn: '0012345678',
          nama: 'Andi Pratama',
          jenkel: 'L',
          kelasId: kelas1A.id,
          sekolahId: school.id,
          waliId: wali.id,
          userId: siswaUser.id,
        },
      });
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Data awal berhasil dibuat!',
      data: { school: school.nama },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal membuat data awal',
      error: error.message,
    }, { status: 500 });
  }
}
