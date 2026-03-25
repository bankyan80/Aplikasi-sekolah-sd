import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get anak (child) data for wali
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('wali_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
      include: {
        wali: {
          include: {
            anak: {
              include: {
                sekolah: true,
                kelas: true,
                nilaiQuiz: {
                  include: {
                    quiz: {
                      include: {
                        mapel: true,
                      },
                    },
                  },
                  orderBy: { createdAt: 'desc' },
                },
                kehadiran: {
                  orderBy: { tanggal: 'desc' },
                  take: 30, // Last 30 days
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.wali) {
      return NextResponse.json({ success: false, message: 'Data wali tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      wali: user.wali,
      anak: user.wali.anak,
    });
  } catch (error) {
    console.error('Get wali anak error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data anak' }, { status: 500 });
  }
}
