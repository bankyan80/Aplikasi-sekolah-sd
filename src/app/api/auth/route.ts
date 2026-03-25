import { NextRequest, NextResponse } from 'next/server';

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          sekolah: true,
          guru: true,
        },
      });

      if (!user) {
        await prisma.$disconnect();
        return NextResponse.json(
          { success: false, message: 'Email tidak ditemukan' },
          { status: 401 }
        );
      }

      // Simple password check
      if (user.password !== password) {
        await prisma.$disconnect();
        return NextResponse.json(
          { success: false, message: 'Password salah' },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        await prisma.$disconnect();
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

      await prisma.$disconnect();
      return response;

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      await prisma.$disconnect();

      return NextResponse.json(
        {
          success: false,
          message: 'Database tidak terhubung. Pastikan konfigurasi database sudah benar.',
          debug: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
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

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: token },
      include: {
        sekolah: true,
        guru: true,
      },
    });

    await prisma.$disconnect();

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

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session_token');
  return response;
}
