import { NextRequest, NextResponse } from 'next/server';

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const { searchParams } = new URL(request.url);
    const sekolahId = searchParams.get('sekolahId');
    const role = searchParams.get('role');

    const whereClause: any = {};
    if (sekolahId) {
      whereClause.sekolahId = sekolahId;
    }
    if (role) {
      whereClause.role = role;
    }

    const users = await db.user.findMany({
      where: whereClause,
      include: {
        sekolah: true,
        guru: true,
        siswa: {
          include: {
            kelas: true,
          },
        },
        wali: {
          include: {
            anak: {
              select: { id: true, nama: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    // Return empty array instead of error for graceful degradation
    return NextResponse.json({ 
      success: true, 
      data: [],
      message: 'Database belum siap. Silakan jalankan migrasi terlebih dahulu.'
    });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const body = await request.json();
    const {
      email, password, nama, role, sekolahId,
      // Guru fields
      nip, telepon, alamat,
      // Siswa fields
      nisn, kelasId, jenkel, tempatLahir, tanggalLahir,
      // Wali fields
      hubungan, pekerjaan, anakIds
    } = body;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password,
        nama,
        role,
        sekolahId: role === 'wali' ? null : sekolahId,
        isActive: true,
      },
    });

    // If role is guru_kelas or guru_mapel, create Guru record
    if (role === 'guru_kelas' || role === 'guru_mapel') {
      await db.guru.create({
        data: {
          nip: nip || `NIP${Date.now()}`,
          nama,
          email,
          telepon: telepon || '',
          alamat: alamat || '',
          status: 'aktif',
          jenisGuru: role,
          sekolahId: sekolahId,
          userId: user.id,
        },
      });
    }

    // If role is siswa, create Siswa record
    if (role === 'siswa' && nisn && kelasId) {
      await db.siswa.create({
        data: {
          nisn,
          nama,
          jenkel: jenkel || null,
          tempatLahir: tempatLahir || null,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat: alamat || null,
          telepon: telepon || null,
          kelasId,
          sekolahId,
          userId: user.id,
        },
      });
    }

    // If role is wali, create WaliSiswa record
    if (role === 'wali') {
      await db.waliSiswa.create({
        data: {
          nama,
          email,
          telepon: telepon || null,
          alamat: alamat || null,
          hubungan: hubungan || 'wali',
          pekerjaan: pekerjaan || null,
          userId: user.id,
        },
      });

      // Link children if provided
      if (anakIds && anakIds.length > 0) {
        for (const anakId of anakIds) {
          await db.siswa.update({
            where: { id: anakId },
            data: { waliId: (await db.waliSiswa.findUnique({ where: { userId: user.id } }))?.id },
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat user baru. Pastikan database sudah dikonfigurasi dengan benar.' },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const body = await request.json();
    const {
      id, nama, email, role, sekolahId, isActive,
      // Guru fields
      nip, telepon, alamat,
      // Siswa fields
      nisn, kelasId, jenkel,
      // Wali fields
      hubungan, pekerjaan, anakIds
    } = body;

    const user = await db.user.update({
      where: { id },
      data: {
        nama,
        email,
        role,
        sekolahId: role === 'wali' ? null : sekolahId,
        isActive,
      },
    });

    // Update related Guru record if exists
    const existingGuru = await db.guru.findUnique({
      where: { userId: id },
    });

    if (existingGuru) {
      await db.guru.update({
        where: { userId: id },
        data: {
          nama,
          email,
          telepon: telepon || existingGuru.telepon,
          alamat: alamat || existingGuru.alamat,
          jenisGuru: role,
        },
      });
    }

    // Update related Siswa record if exists
    const existingSiswa = await db.siswa.findUnique({
      where: { userId: id },
    });

    if (existingSiswa) {
      await db.siswa.update({
        where: { userId: id },
        data: {
          nama,
          nisn: nisn || existingSiswa.nisn,
          kelasId: kelasId || existingSiswa.kelasId,
          jenkel: jenkel || existingSiswa.jenkel,
          alamat: alamat || existingSiswa.alamat,
          telepon: telepon || existingSiswa.telepon,
        },
      });
    }

    // Update related Wali record if exists
    const existingWali = await db.waliSiswa.findUnique({
      where: { userId: id },
    });

    if (existingWali) {
      await db.waliSiswa.update({
        where: { userId: id },
        data: {
          nama,
          email,
          telepon: telepon || existingWali.telepon,
          alamat: alamat || existingWali.alamat,
          hubungan: hubungan || existingWali.hubungan,
          pekerjaan: pekerjaan || existingWali.pekerjaan,
        },
      });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui user' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID user diperlukan' },
        { status: 400 }
      );
    }

    // Delete related Guru record first
    await db.guru.deleteMany({
      where: { userId: id },
    });

    // Delete related Siswa records
    await db.siswa.deleteMany({
      where: { userId: id },
    });

    // Delete related Wali records
    await db.waliSiswa.deleteMany({
      where: { userId: id },
    });

    // Delete related attendance records
    await db.kehadiranGuru.deleteMany({
      where: { userId: id },
    });

    // Delete user
    await db.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus user' },
      { status: 500 }
    );
  }
}

// PATCH for password reset
export async function PATCH(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const body = await request.json();
    const { id, newPassword } = body;

    if (!id || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'ID dan password baru diperlukan' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });

    return NextResponse.json({ success: true, message: 'Password berhasil direset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal reset password' },
      { status: 500 }
    );
  }
}
