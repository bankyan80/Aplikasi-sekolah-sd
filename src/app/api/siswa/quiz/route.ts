import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get quiz for siswa's class
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('siswa_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
      include: { siswa: true },
    });

    if (!user || !user.siswa) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    // Get mapel ids for siswa's class
    const mapelIds = await db.mataPelajaran.findMany({
      where: { kelasId: user.siswa.kelasId },
      select: { id: true },
    });

    // Get active quizzes
    const quiz = await db.quiz.findMany({
      where: {
        mapelId: { in: mapelIds.map(m => m.id) },
        aktif: true,
      },
      include: {
        mapel: {
          include: {
            kelas: true,
          },
        },
        guru: true,
        _count: { select: { soal: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get siswa's quiz results
    const nilai = await db.nilaiQuiz.findMany({
      where: { siswaId: user.siswa.id },
    });

    return NextResponse.json({
      success: true,
      data: quiz,
      nilai: nilai,
    });
  } catch (error) {
    console.error('Get siswa quiz error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data quiz' }, { status: 500 });
  }
}
