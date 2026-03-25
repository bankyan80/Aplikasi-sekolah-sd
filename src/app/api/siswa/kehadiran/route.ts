import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get kehadiran siswa
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

    const kehadiran = await db.kehadiranSiswa.findMany({
      where: { siswaId: user.siswa.id },
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    console.error('Get siswa kehadiran error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data kehadiran' }, { status: 500 });
  }
}
