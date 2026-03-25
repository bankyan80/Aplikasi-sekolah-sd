import { NextRequest, NextResponse } from 'next/server';

// Admin credentials (hardcoded for super admin - works without database)
const ADMIN_EMAIL = 'admin@sekolah.com';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email });

    // Check if it's the super admin (always works - NO DATABASE NEEDED)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      console.log('Super admin login successful');
      
      const response = NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          email: ADMIN_EMAIL,
          nama: 'Administrator',
          role: 'admin',
        },
        token: 'admin-token-' + Date.now(),
      });

      // Set cookie with proper settings for production
      response.cookies.set('admin_token', 'admin-session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    // For other users, try to check database
    try {
      const { db } = await import('@/lib/db');
      
      const user = await db.user.findUnique({
        where: { email },
        include: { sekolah: true },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Email tidak ditemukan' },
          { status: 401 }
        );
      }

      if (user.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Password salah' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: 'Akun tidak aktif' },
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
          sekolahId: user.sekolahId,
          sekolah: user.sekolah,
        },
      });

      response.cookies.set('admin_token', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Kredensial tidak valid' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check if it's super admin
    if (token === 'admin-session') {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'admin',
          email: 'admin@sekolah.com',
          nama: 'Administrator',
          role: 'admin',
        },
      });
    }

    // Check user in database
    try {
      const { db } = await import('@/lib/db');
      
      const user = await db.user.findUnique({
        where: { id: token },
        include: { sekolah: true },
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
          sekolahId: user.sekolahId,
          sekolah: user.sekolah,
        },
      });
    } catch (dbError) {
      console.error('Database error in auth check:', dbError);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
