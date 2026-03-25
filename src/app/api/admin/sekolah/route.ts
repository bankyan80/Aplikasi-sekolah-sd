import { NextRequest, NextResponse } from 'next/server';

// GET all schools
export async function GET(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const schools = await prisma.sekolah.findMany({
      include: {
        _count: {
          select: { guru: true, kelas: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: schools });
  } catch (error: any) {
    console.error('Get schools error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      debug: {
        errorMessage: error.message,
        errorCode: error.code,
      }
    });
  }
}

// POST create new school
export async function POST(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { nama, npsn, alamat, jenjang, tahunAjaran, logo } = body;

    // Check if NPSN already exists
    const existingSchool = await prisma.sekolah.findUnique({
      where: { npsn },
    });

    if (existingSchool) {
      await prisma.$disconnect();
      return NextResponse.json(
        { success: false, message: 'NPSN sudah terdaftar' },
        { status: 400 }
      );
    }

    const school = await prisma.sekolah.create({
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

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: school });
  } catch (error: any) {
    console.error('Create school error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal membuat sekolah baru',
      debug: {
        errorMessage: error.message,
        errorCode: error.code,
      }
    }, { status: 500 });
  }
}

// PUT update school
export async function PUT(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const body = await request.json();
    const { id, nama, npsn, alamat, tahunAjaran, logo } = body;

    const school = await prisma.sekolah.update({
      where: { id },
      data: {
        nama,
        npsn,
        alamat,
        tahunAjaran,
        logo: logo,
      },
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true, data: school });
  } catch (error: any) {
    console.error('Update school error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal memperbarui data sekolah',
      debug: { errorMessage: error.message }
    }, { status: 500 });
  }
}

// DELETE school
export async function DELETE(request: NextRequest) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID sekolah diperlukan' },
        { status: 400 }
      );
    }

    // Delete all related data
    await prisma.kehadiranGuru.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await prisma.soalQuiz.deleteMany({
      where: { quiz: { guru: { sekolahId: id } } },
    });

    await prisma.quiz.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await prisma.materi.deleteMany({
      where: { guru: { sekolahId: id } },
    });

    await prisma.mataPelajaran.deleteMany({
      where: { sekolahId: id },
    });

    await prisma.guru.deleteMany({
      where: { sekolahId: id },
    });

    await prisma.user.deleteMany({
      where: { sekolahId: id },
    });

    await prisma.kelas.deleteMany({
      where: { sekolahId: id },
    });

    await prisma.sekolah.delete({
      where: { id },
    });

    await prisma.$disconnect();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete school error:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal menghapus sekolah',
      debug: { errorMessage: error.message }
    }, { status: 500 });
  }
}
