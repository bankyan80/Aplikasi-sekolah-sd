import { NextRequest, NextResponse } from 'next/server';

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const sekolahId = searchParams.get('sekolahId');
    const role = searchParams.get('role');

    const whereClause: any = {};
    if (sekolahId) whereClause.sekolahId = sekolahId;
    if (role) whereClause.role = role;

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        sekolah: true,
        guru: true,
        siswa: { include: { kelas: true } },
        wali: { include: { anak: { select: { id: true, nama: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json({ success: true, data: [], debug: { errorMessage: error.message } });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { email, password, nama, role, sekolahId, nip, telepon, alamat, nisn, kelasId, jenkel, tempatLahir, tanggalLahir, hubungan, pekerjaan, anakIds } = body;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.$disconnect();
      return NextResponse.json({ success: false, message: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email, password, nama, role,
        sekolahId: role === 'wali' ? null : sekolahId,
        isActive: true,
      },
    });

    // Create Guru record
    if (role === 'guru_kelas' || role === 'guru_mapel') {
      await prisma.guru.create({
        data: {
          nip: nip || `NIP${Date.now()}`, nama, email,
          telepon: telepon || '', alamat: alamat || '',
          status: 'aktif', jenisGuru: role,
          sekolahId, userId: user.id,
        },
      });
    }

    // Create Siswa record
    if (role === 'siswa' && nisn && kelasId) {
      await prisma.siswa.create({
        data: {
          nisn, nama,
          jenkel: jenkel || null,
          tempatLahir: tempatLahir || null,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat: alamat || null, telepon: telepon || null,
          kelasId, sekolahId, userId: user.id,
        },
      });
    }

    // Create Wali record
    if (role === 'wali') {
      await prisma.waliSiswa.create({
        data: {
          nama, email,
          telepon: telepon || null, alamat: alamat || null,
          hubungan: hubungan || 'wali', pekerjaan: pekerjaan || null,
          userId: user.id,
        },
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, message: 'Gagal membuat user', debug: { errorMessage: error.message } }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { id, nama, email, role, sekolahId, isActive, nip, telepon, alamat } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { nama, email, role, sekolahId: role === 'wali' ? null : sekolahId, isActive },
    });

    // Update Guru record if exists
    const existingGuru = await prisma.guru.findUnique({ where: { userId: id } });
    if (existingGuru) {
      await prisma.guru.update({
        where: { userId: id },
        data: { nama, email, telepon: telepon || existingGuru.telepon, alamat: alamat || existingGuru.alamat, jenisGuru: role },
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui user' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID user diperlukan' }, { status: 400 });
    }

    await prisma.guru.deleteMany({ where: { userId: id } });
    await prisma.siswa.deleteMany({ where: { userId: id } });
    await prisma.waliSiswa.deleteMany({ where: { userId: id } });
    await prisma.kehadiranGuru.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    await prisma.$disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, message: 'Gagal menghapus user' }, { status: 500 });
  }
}

// PATCH for password reset
export async function PATCH(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { id, newPassword } = body;

    if (!id || !newPassword) {
      return NextResponse.json({ success: false, message: 'ID dan password baru diperlukan' }, { status: 400 });
    }

    await prisma.user.update({ where: { id }, data: { password: newPassword } });
    await prisma.$disconnect();

    return NextResponse.json({ success: true, message: 'Password berhasil direset' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Gagal reset password' }, { status: 500 });
  }
}
