import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    // Check if schools already exist
    const existingSchools = await db.sekolah.count();

    if (existingSchools > 0) {
      return NextResponse.json({
        success: true,
        message: 'Data sudah ada sebelumnya',
      });
    }

    // Create sample schools
    const school1 = await db.sekolah.create({
      data: {
        nama: 'SD Negeri 1 Contoh',
        npsn: '12345678',
        alamat: 'Jl. Pendidikan No. 1, Kota Contoh',
        jenjang: 'SD',
        tahunAjaran: '2025/2026',
      },
    });

    const school2 = await db.sekolah.create({
      data: {
        nama: 'SD Negeri 2 Contoh',
        npsn: '87654321',
        alamat: 'Jl. Merdeka No. 2, Kota Contoh',
        jenjang: 'SD',
        tahunAjaran: '2025/2026',
      },
    });

    // Create default classes for both schools
    const tingkatList = ['1', '2', '3', '4', '5', '6'];
    const rombelList = ['A', 'B'];

    for (const school of [school1, school2]) {
      for (const tingkat of tingkatList) {
        for (const rombel of rombelList) {
          await db.kelas.create({
            data: {
              nama: `Kelas ${tingkat}${rombel}`,
              tingkat,
              rombel,
              sekolahId: school.id,
            },
          });
        }
      }
    }

    // Create kepala sekolah for school 1
    const kepsek1 = await db.user.create({
      data: {
        email: 'kepsek1@sekolah.com',
        password: 'kepsek123',
        nama: 'Ibu Siti Aminah, S.Pd',
        role: 'kepala_sekolah',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    // Create guru for school 1
    const guru1_1 = await db.user.create({
      data: {
        email: 'guru1_sdn1@sekolah.com',
        password: 'guru123',
        nama: 'Ibu Ratna Dewi, S.Pd',
        role: 'guru_kelas',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    const guru1_2 = await db.user.create({
      data: {
        email: 'guru2_sdn1@sekolah.com',
        password: 'guru123',
        nama: 'Bapak Ahmad Fauzi, S.Pd',
        role: 'guru_mapel',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    // Create Guru records for school 1
    await db.guru.create({
      data: {
        nip: '198001011',
        nama: 'Ibu Siti Aminah, S.Pd',
        email: 'kepsek1@sekolah.com',
        telepon: '08123456789',
        alamat: 'Jl. Utama No. 1',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school1.id,
        userId: kepsek1.id,
      },
    });

    await db.guru.create({
      data: {
        nip: '198501012',
        nama: 'Ibu Ratna Dewi, S.Pd',
        email: 'guru1_sdn1@sekolah.com',
        telepon: '08123456790',
        alamat: 'Jl. Pendidikan No. 2',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school1.id,
        userId: guru1_1.id,
      },
    });

    await db.guru.create({
      data: {
        nip: '198703014',
        nama: 'Bapak Ahmad Fauzi, S.Pd',
        email: 'guru2_sdn1@sekolah.com',
        telepon: '08123456792',
        alamat: 'Jl. Pendidikan No. 4',
        status: 'aktif',
        jenisGuru: 'guru_mapel',
        sekolahId: school1.id,
        userId: guru1_2.id,
      },
    });

    // Create kepala sekolah for school 2
    const kepsek2 = await db.user.create({
      data: {
        email: 'kepsek2@sekolah.com',
        password: 'kepsek123',
        nama: 'Bapak Hendra Wijaya, S.Pd',
        role: 'kepala_sekolah',
        sekolahId: school2.id,
        isActive: true,
      },
    });

    // Create guru for school 2
    const guru2_1 = await db.user.create({
      data: {
        email: 'guru1_sdn2@sekolah.com',
        password: 'guru123',
        nama: 'Ibu Sri Wahyuni, S.Pd',
        role: 'guru_kelas',
        sekolahId: school2.id,
        isActive: true,
      },
    });

    // Create Guru records for school 2
    await db.guru.create({
      data: {
        nip: '197805021',
        nama: 'Bapak Hendra Wijaya, S.Pd',
        email: 'kepsek2@sekolah.com',
        telepon: '08123456800',
        alamat: 'Jl. Merdeka No. 1',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school2.id,
        userId: kepsek2.id,
      },
    });

    await db.guru.create({
      data: {
        nip: '198806023',
        nama: 'Ibu Sri Wahyuni, S.Pd',
        email: 'guru1_sdn2@sekolah.com',
        telepon: '08123456801',
        alamat: 'Jl. Merdeka No. 3',
        status: 'aktif',
        jenisGuru: 'guru_kelas',
        sekolahId: school2.id,
        userId: guru2_1.id,
      },
    });

    // Create sample mata pelajaran for school 1
    const kelas1A = await db.kelas.findFirst({
      where: { sekolahId: school1.id, nama: 'Kelas 1A' },
    });

    const guruMapel1 = await db.guru.findFirst({
      where: { sekolahId: school1.id, jenisGuru: 'guru_mapel' },
    });
    const guruKelas1 = await db.guru.findFirst({
      where: { sekolahId: school1.id, jenisGuru: 'guru_kelas' },
    });

    if (kelas1A && guruMapel1) {
      await db.mataPelajaran.create({
        data: {
          nama: 'Matematika',
          kode: 'MTK',
          deskripsi: 'Matematika untuk SD',
          kelasId: kelas1A.id,
          guruId: guruMapel1.id,
          sekolahId: school1.id,
        },
      });
    }

    if (kelas1A && guruKelas1) {
      await db.mataPelajaran.create({
        data: {
          nama: 'Bahasa Indonesia',
          kode: 'BIN',
          deskripsi: 'Bahasa Indonesia untuk SD',
          kelasId: kelas1A.id,
          guruId: guruKelas1.id,
          sekolahId: school1.id,
        },
      });
    }

    // === CREATE SAMPLE SISWA AND WALI ===

    // Get kelas for siswa
    const kelas1A_SDN1 = await db.kelas.findFirst({
      where: { sekolahId: school1.id, nama: 'Kelas 1A' },
    });
    const kelas2A_SDN1 = await db.kelas.findFirst({
      where: { sekolahId: school1.id, nama: 'Kelas 2A' },
    });

    // Create Wali (Parents)
    const wali1User = await db.user.create({
      data: {
        email: 'wali1@example.com',
        password: 'wali123',
        nama: 'Bapak Susanto',
        role: 'wali',
        isActive: true,
      },
    });

    const wali2User = await db.user.create({
      data: {
        email: 'wali2@example.com',
        password: 'wali123',
        nama: 'Ibu Sri Mulyani',
        role: 'wali',
        isActive: true,
      },
    });

    const wali1 = await db.waliSiswa.create({
      data: {
        nama: 'Bapak Susanto',
        email: 'wali1@example.com',
        telepon: '08123456900',
        alamat: 'Jl. Keluarga No. 1',
        hubungan: 'ayah',
        pekerjaan: 'Wiraswasta',
        userId: wali1User.id,
      },
    });

    const wali2 = await db.waliSiswa.create({
      data: {
        nama: 'Ibu Sri Mulyani',
        email: 'wali2@example.com',
        telepon: '08123456901',
        alamat: 'Jl. Keluarga No. 2',
        hubungan: 'ibu',
        pekerjaan: 'Guru',
        userId: wali2User.id,
      },
    });

    // Create Siswa (Students)
    const siswa1User = await db.user.create({
      data: {
        email: 'siswa1@siswa.com',
        password: 'siswa123',
        nama: 'Andi Pratama',
        role: 'siswa',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    const siswa2User = await db.user.create({
      data: {
        email: 'siswa2@siswa.com',
        password: 'siswa123',
        nama: 'Dewi Lestari',
        role: 'siswa',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    if (kelas1A_SDN1) {
      await db.siswa.create({
        data: {
          nisn: '0012345678',
          nama: 'Andi Pratama',
          jenkel: 'L',
          kelasId: kelas1A_SDN1.id,
          sekolahId: school1.id,
          waliId: wali1.id,
          userId: siswa1User.id,
        },
      });

      await db.siswa.create({
        data: {
          nisn: '0012345679',
          nama: 'Dewi Lestari',
          jenkel: 'P',
          kelasId: kelas1A_SDN1.id,
          sekolahId: school1.id,
          waliId: wali2.id,
          userId: siswa2User.id,
        },
      });
    }

    // Create more siswa for Kelas 2A
    const siswa3User = await db.user.create({
      data: {
        email: 'siswa3@siswa.com',
        password: 'siswa123',
        nama: 'Budi Santoso',
        role: 'siswa',
        sekolahId: school1.id,
        isActive: true,
      },
    });

    if (kelas2A_SDN1) {
      await db.siswa.create({
        data: {
          nisn: '0012345680',
          nama: 'Budi Santoso',
          jenkel: 'L',
          kelasId: kelas2A_SDN1.id,
          sekolahId: school1.id,
          waliId: wali1.id,
          userId: siswa3User.id,
        },
      });
    }

    // Create sample kehadiran for siswa
    const siswa1 = await db.siswa.findFirst({
      where: { nisn: '0012345678' },
    });

    if (siswa1) {
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        await db.kehadiranSiswa.create({
          data: {
            siswaId: siswa1.id,
            tanggal: date,
            status: i === 2 ? 'izin' : 'hadir',
            keterangan: i === 2 ? 'Acara keluarga' : null,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data awal berhasil dibuat',
      data: {
        schools: 2,
        users: 11,
        siswa: 3,
        wali: 2,
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal membuat data awal. Pastikan database sudah dikonfigurasi dengan benar.',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
