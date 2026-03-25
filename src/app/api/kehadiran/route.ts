import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET kehadiran
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guruId = searchParams.get('guruId');
    const userId = searchParams.get('userId');
    const sekolahId = searchParams.get('sekolahId');
    const tanggal = searchParams.get('tanggal');
    const bulan = searchParams.get('bulan'); // Format: YYYY-MM

    const whereClause: any = {};
    
    if (guruId) whereClause.guruId = guruId;
    if (userId) whereClause.userId = userId;
    
    if (tanggal) {
      const date = new Date(tanggal);
      whereClause.tanggal = date;
    }
    
    if (bulan) {
      const startDate = new Date(`${bulan}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      whereClause.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Filter by school through guru relation
    if (sekolahId) {
      whereClause.guru = { sekolahId };
    }

    const kehadiran = await db.kehadiranGuru.findMany({
      where: whereClause,
      include: {
        guru: true,
        user: true,
      },
      orderBy: { tanggal: 'desc' },
    });

    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    console.error('Get kehadiran error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kehadiran' },
      { status: 500 }
    );
  }
}

// POST create kehadiran
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guruId, userId, tanggal, status, keterangan } = body;

    // Check if already exists for this date
    const existing = await db.kehadiranGuru.findFirst({
      where: {
        guruId,
        tanggal: new Date(tanggal),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Kehadiran untuk tanggal ini sudah ada' },
        { status: 400 }
      );
    }

    const kehadiran = await db.kehadiranGuru.create({
      data: {
        guruId,
        userId,
        tanggal: new Date(tanggal),
        status,
        keterangan,
      },
      include: {
        guru: true,
        user: true,
      },
    });

    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    console.error('Create kehadiran error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat data kehadiran' },
      { status: 500 }
    );
  }
}

// PUT update kehadiran
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, keterangan } = body;

    const kehadiran = await db.kehadiranGuru.update({
      where: { id },
      data: {
        status,
        keterangan,
      },
    });

    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    console.error('Update kehadiran error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui kehadiran' },
      { status: 500 }
    );
  }
}

// DELETE kehadiran
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID kehadiran diperlukan' },
        { status: 400 }
      );
    }

    await db.kehadiranGuru.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete kehadiran error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kehadiran' },
      { status: 500 }
    );
  }
}
