import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all quiz or by mapelId/guruId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mapelId = searchParams.get('mapelId');
    const guruId = searchParams.get('guruId');
    const sekolahId = searchParams.get('sekolahId');
    const id = searchParams.get('id');

    // Get single quiz with soal
    if (id) {
      const quiz = await db.quiz.findUnique({
        where: { id },
        include: {
          soal: true,
          mapel: {
            include: { kelas: true }
          },
          guru: true,
        },
      });
      return NextResponse.json({ success: true, data: quiz });
    }

    const whereClause: any = {};
    
    if (mapelId) whereClause.mapelId = mapelId;
    if (guruId) whereClause.guruId = guruId;
    
    if (sekolahId) {
      whereClause.mapel = { sekolahId };
    }

    const quizzes = await db.quiz.findMany({
      where: whereClause,
      include: {
        mapel: {
          include: { kelas: true }
        },
        guru: true,
        _count: { select: { soal: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data quiz' },
      { status: 500 }
    );
  }
}

// POST create new quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judul, deskripsi, jenis, durasi, mapelId, guruId, soal, aktif } = body;

    const quiz = await db.quiz.create({
      data: {
        judul,
        deskripsi,
        jenis: jenis || 'harian',
        durasi: durasi || 60,
        mapelId,
        guruId,
        aktif: aktif !== undefined ? aktif : true,
        soal: {
          create: soal?.map((s: any) => ({
            pertanyaan: s.pertanyaan,
            opsiA: s.opsiA,
            opsiB: s.opsiB,
            opsiC: s.opsiC,
            opsiD: s.opsiD,
            jawaban: s.jawaban,
            gambar: s.gambar,
          })) || [],
        },
      },
      include: {
        soal: true,
        mapel: true,
        guru: true,
      },
    });

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat quiz baru' },
      { status: 500 }
    );
  }
}

// PUT update quiz
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, judul, deskripsi, jenis, durasi, mapelId, aktif, soal } = body;

    // Delete existing soal and create new ones
    if (soal) {
      await db.soalQuiz.deleteMany({
        where: { quizId: id },
      });
    }

    const quiz = await db.quiz.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        jenis,
        durasi,
        mapelId,
        aktif,
        soal: soal ? {
          create: soal.map((s: any) => ({
            pertanyaan: s.pertanyaan,
            opsiA: s.opsiA,
            opsiB: s.opsiB,
            opsiC: s.opsiC,
            opsiD: s.opsiD,
            jawaban: s.jawaban,
            gambar: s.gambar,
          })),
        } : undefined,
      },
      include: {
        soal: true,
        mapel: true,
        guru: true,
      },
    });

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui quiz' },
      { status: 500 }
    );
  }
}

// DELETE quiz
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID quiz diperlukan' },
        { status: 400 }
      );
    }

    // Delete soal first
    await db.soalQuiz.deleteMany({
      where: { quizId: id },
    });

    await db.quiz.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus quiz' },
      { status: 500 }
    );
  }
}
