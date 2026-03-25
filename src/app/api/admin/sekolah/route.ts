import { NextRequest, NextResponse } from 'next/server';

// GET all schools
export async function GET(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const schools = await db.sekolah.findMany({
      include: {
        _count: {
          select: { guru: true, kelas: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: schools });
  } catch (error) {
    console.error('Get schools error:', error);
    // Return empty array instead of error for graceful degradation
    return NextResponse.json({ 
      success: true, 
      data: [],
      message: 'Database belum siap. Silakan jalankan migrasi terlebih dahulu.'
    });
  }
}

// POST create new school
export async function POST(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const body = await request.json();
    const { nama, npsn, alamat, jenjang, tahunAjaran, logo } = body;

    // Check if NPSN already exists
    const existingSchool = await db.sekolah.findUnique({
      where: { npsn },
    });

    if (existingSchool) {
      return NextResponse.json(
        { success: false, message: 'NPSN sudah terdaftar' },
        { status: 400 }
      );
    }

    const school = await db.sekolah.create({
      data: {
        nama,
        npsn,
        alamat: alamat || '',
        jenjang: jenjang || 'SD',
        tahunAjaran: tahunAjaran || '2025/2026',
        logo: logo || null,
      },
    });

    // Create default classes for SD (Kelas 1-6 with A and B sections)
    const tingkatList = ['1', '2', '3', '4', '5', '6'];
    const rombelList = ['A', 'B'];

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

    return NextResponse.json({ success: true, data: school });
  } catch (error) {
    console.error('Create school error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat sekolah baru. Pastikan database sudah dikonfigurasi dengan benar.' },
      { status: 500 }
    );
  }
}

// PUT update school
export async function PUT(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const body = await request.json();
    const { id, nama, npsn, alamat, tahunAjaran, logo } = body;

    const school = await db.sekolah.update({
      where: { id },
      data: {
        nama,
        npsn,
        alamat,
        tahunAjaran,
        logo: logo,
      },
    });

    return NextResponse.json({ success: true, data: school });
  } catch (error) {
    console.error('Update school error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui data sekolah' },
      { status: 500 }
    );
  }
}

// DELETE school
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await import('@/lib/db');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID sekolah diperlukan' },
        { status: 400 }
      );
    }

    // Delete all related data
    await db.kehadiranGuru.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await db.soalQuiz.deleteMany({
      where: { quiz: { guru: { sekolahId: id } } },
    });

    await db.quiz.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await db.materi.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await db.mataPelajaran.deleteMany({
      where: { sekolahId: id },
    });

    await db.guru.deleteMany({
      where: { sekolahId: id },
    });

    await db.user.deleteMany({
      where: { sekolahId: id },
    });

    await db.kelas.deleteMany({
      where: { sekolahId: id },
    });

    await db.sekolah.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete school error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus sekolah' },
      { status: 500 }
    );
  }
}
