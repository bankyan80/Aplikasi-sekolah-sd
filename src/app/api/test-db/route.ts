import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
    }
  };

  // Test database connection
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Try a simple query
    await prisma.$connect();
    const count = await prisma.sekolah.count();

    results.database = {
      status: 'connected',
      sekolahCount: count,
    };

    await prisma.$disconnect();
  } catch (error: any) {
    results.database = {
      status: 'error',
      message: error.message,
      code: error.code,
    };
  }

  return NextResponse.json(results, { indent: 2 });
}
