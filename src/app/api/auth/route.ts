import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        sekolah: true,
        guru: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email tidak ditemukan' },
        { status: 401 }
      );
    }

    // Simple password check (in production, use bcrypt)
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
        sekolahId: user.sekolahId,
        sekolah: user.sekolah,
        guru: user.guru,
      },
    });

    // Set session cookie
    response.cookies.set('session_token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET - Check session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: token },
      include: {
        sekolah: true,
        guru: true,
      },
    });

    if (!user || !user.isActive) {
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
        sekolahId: user.sekolahId,
        sekolah: user.sekolah,
        guru: user.guru,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// PUT - Update profile (nama, email, foto)
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, email, foto } = body;

    const user = await db.user.update({
      where: { id: token },
      data: {
        nama: nama || undefined,
        email: email || undefined,
        foto: foto,
      },
      include: {
        sekolah: true,
        guru: true,
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
        sekolahId: user.sekolahId,
        sekolah: user.sekolah,
        guru: user.guru,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui profil' }, { status: 500 });
  }
}

// PATCH - Update password
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    const user = await db.user.findUnique({ where: { id: token } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User tidak ditemukan' }, { status: 404 });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ success: false, message: 'Password lama salah' }, { status: 400 });
    }

    // Update password
    await db.user.update({
      where: { id: token },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui password' }, { status: 500 });
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session_token');
  return response;
}
