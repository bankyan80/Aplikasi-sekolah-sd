import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get current user's school
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
      include: { sekolah: true },
    });

    if (!user || !user.sekolahId) {
      return NextResponse.json({ success: false, message: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user.sekolah });
  } catch (error) {
    console.error('Get sekolah error:', error);
    return NextResponse.json({ success: false, message: 'Gagal mengambil data sekolah' }, { status: 500 });
  }
}

// PUT - Update school settings (nama, alamat, tahunAjaran, logo)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
    });

    if (!user || !user.sekolahId) {
      return NextResponse.json({ success: false, message: 'Sekolah tidak ditemukan' }, { status: 404 });
    }

    const body = await request.json();
    const { nama, alamat, tahunAjaran, logo } = body;

    const school = await db.sekolah.update({
      where: { id: user.sekolahId },
      data: {
        nama: nama || undefined,
        alamat: alamat,
        tahunAjaran: tahunAjaran || undefined,
        logo: logo,
      },
    });

    return NextResponse.json({ success: true, data: school });
  } catch (error) {
    console.error('Update sekolah error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui data sekolah' }, { status: 500 });
  }
}
