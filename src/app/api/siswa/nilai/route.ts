import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get quiz detail with soal for siswa
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('siswa_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ success: false, message: 'Quiz ID diperlukan' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
      include: { siswa: true },
    });

    if (!user || !user.siswa) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    // Check if siswa already took this quiz
    const existingNilai = await db.nilaiQuiz.findFirst({
      where: {
        siswaId: user.siswa.id,
        quizId: quizId,
      },
    });

    if (existingNilai && existingNilai.selesai) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        nilai: existingNilai,
      });
    }

    // Get quiz with soal (without answers)
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        mapel: true,
        soal: {
          select: {
            id: true,
            pertanyaan: true,
            opsiA: true,
            opsiB: true,
            opsiC: true,
            opsiD: true,
            gambar: true,
            // Don't include jawaban!
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      quiz: quiz,
      existingAttempt: existingNilai,
    });
  } catch (error) {
    console.error('Get quiz detail error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data quiz' }, { status: 500 });
  }
}

// POST - Start quiz attempt
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('siswa_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { quizId } = body;

    const user = await db.user.findUnique({
      where: { id: token },
      include: { siswa: true },
    });

    if (!user || !user.siswa) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    // Check existing attempt
    const existing = await db.nilaiQuiz.findFirst({
      where: { siswaId: user.siswa.id, quizId },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    // Create new attempt
    const nilai = await db.nilaiQuiz.create({
      data: {
        siswaId: user.siswa.id,
        quizId,
        jawaban: '{}',
        nilai: 0,
        waktuMulai: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: nilai });
  } catch (error) {
    console.error('Start quiz error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memulai quiz' }, { status: 500 });
  }
}

// PUT - Submit quiz answers
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('siswa_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { quizId, jawaban, nilaiId } = body;

    const user = await db.user.findUnique({
      where: { id: token },
      include: { siswa: true },
    });

    if (!user || !user.siswa) {
      return NextResponse.json({ success: false, message: 'Data siswa tidak ditemukan' }, { status: 404 });
    }

    // Get quiz with answers
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { soal: true },
    });

    if (!quiz) {
      return NextResponse.json({ success: false, message: 'Quiz tidak ditemukan' }, { status: 404 });
    }

    // Calculate score
    let correct = 0;
    const jawabanObj = typeof jawaban === 'string' ? JSON.parse(jawaban) : jawaban;

    quiz.soal.forEach((soal) => {
      if (jawabanObj[soal.id] === soal.jawaban) {
        correct++;
      }
    });

    const nilai = (correct / quiz.soal.length) * 100;

    // Update nilai
    const updated = await db.nilaiQuiz.update({
      where: { id: nilaiId },
      data: {
        jawaban: typeof jawaban === 'string' ? jawaban : JSON.stringify(jawaban),
        nilai,
        selesai: true,
        waktuSelesai: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      score: nilai,
      correct,
      total: quiz.soal.length,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengirim jawaban' }, { status: 500 });
  }
}
