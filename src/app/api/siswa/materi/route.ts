import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get materi for siswa's class
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

    // Get materi from mapel in siswa's class
    const mapelIds = await db.mataPelajaran.findMany({
      where: { kelasId: user.siswa.kelasId },
      select: { id: true },
    });

    const materi = await db.materi.findMany({
      where: {
        mapelId: { in: mapelIds.map(m => m.id) },
      },
      include: {
        mapel: {
          include: {
            kelas: true,
            guru: true,
          },
        },
        guru: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error('Get siswa materi error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data materi' }, { status: 500 });
  }
}
