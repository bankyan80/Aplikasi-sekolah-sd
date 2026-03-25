import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all mapel or by kelasId/guruId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const guruId = searchParams.get('guruId');
    const sekolahId = searchParams.get('sekolahId');

    const whereClause: any = {};
    
    if (kelasId) whereClause.kelasId = kelasId;
    if (guruId) whereClause.guruId = guruId;
    if (sekolahId) whereClause.sekolahId = sekolahId;

    const mapel = await db.mataPelajaran.findMany({
      where: whereClause,
      include: {
        kelas: true,
        guru: true,
        _count: { select: { materi: true, quiz: true } },
      },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json({ success: true, data: mapel });
  } catch (error) {
    console.error('Get mapel error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data mata pelajaran' },
      { status: 500 }
    );
  }
}

// POST create new mapel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kode, deskripsi, kelasId, guruId, sekolahId } = body;

    const mapel = await db.mataPelajaran.create({
      data: {
        nama,
        kode,
        deskripsi,
        kelasId,
        guruId,
        sekolahId,
      },
      include: {
        kelas: true,
        guru: true,
      },
    });

    return NextResponse.json({ success: true, data: mapel });
  } catch (error) {
    console.error('Create mapel error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat mata pelajaran baru' },
      { status: 500 }
    );
  }
}

// PUT update mapel
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nama, kode, deskripsi, kelasId, guruId } = body;

    const mapel = await db.mataPelajaran.update({
      where: { id },
      data: {
        nama,
        kode,
        deskripsi,
        kelasId,
        guruId,
      },
    });

    return NextResponse.json({ success: true, data: mapel });
  } catch (error) {
    console.error('Update mapel error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui mata pelajaran' },
      { status: 500 }
    );
  }
}

// DELETE mapel
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID mata pelajaran diperlukan' },
        { status: 400 }
      );
    }

    await db.mataPelajaran.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete mapel error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus mata pelajaran' },
      { status: 500 }
    );
  }
}
