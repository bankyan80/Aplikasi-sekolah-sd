import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Login Wali Siswa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user by email with wali relation
    const user = await db.user.findUnique({
      where: { email },
      include: {
        wali: {
          include: {
            anak: {
              include: {
                sekolah: true,
                kelas: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.role !== 'wali') {
      return NextResponse.json(
        { success: false, message: 'Email tidak ditemukan' },
        { status: 401 }
      );
    }

    // Simple password check
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Password salah' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Akun tidak aktif. Hubungi administrator.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        foto: user.foto,
        wali: user.wali,
      },
    });

    // Set session cookie
    response.cookies.set('wali_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Wali auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET - Check session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('wali_session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
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
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive || user.role !== 'wali') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        foto: user.foto,
        wali: user.wali,
      },
    });
  } catch (error) {
    console.error('Wali auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('wali_session');
  return response;
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('wali_session')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, foto } = body;

    const user = await db.user.update({
      where: { id: token },
      data: {
        nama: nama || undefined,
        foto: foto,
      },
      include: {
        wali: {
          include: {
            anak: {
              include: {
                sekolah: true,
                kelas: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        foto: user.foto,
        wali: user.wali,
      },
    });
  } catch (error) {
    console.error('Update wali profile error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
