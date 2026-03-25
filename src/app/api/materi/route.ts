import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all materi or by mapelId/guruId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mapelId = searchParams.get('mapelId');
    const guruId = searchParams.get('guruId');
    const sekolahId = searchParams.get('sekolahId');

    const whereClause: any = {};
    
    if (mapelId) whereClause.mapelId = mapelId;
    if (guruId) whereClause.guruId = guruId;
    
    // Filter by school through mapel relation
    if (sekolahId) {
      whereClause.mapel = { sekolahId };
    }

    const materi = await db.materi.findMany({
      where: whereClause,
      include: {
        mapel: {
          include: { kelas: true }
        },
        guru: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error('Get materi error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data materi' },
      { status: 500 }
    );
  }
}

// POST create new materi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { judul, deskripsi, konten, gambar, fileUrl, kategori, mapelId, guruId } = body;

    const materi = await db.materi.create({
      data: {
        judul,
        deskripsi,
        konten,
        gambar,
        fileUrl,
        kategori: kategori || 'umum',
        mapelId,
        guruId,
      },
      include: {
        mapel: true,
        guru: true,
      },
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error('Create materi error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat materi baru' },
      { status: 500 }
    );
  }
}

// PUT update materi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, judul, deskripsi, konten, gambar, fileUrl, kategori, mapelId } = body;

    const materi = await db.materi.update({
      where: { id },
      data: {
        judul,
        deskripsi,
        konten,
        gambar,
        fileUrl,
        kategori,
        mapelId,
      },
    });

    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error('Update materi error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui materi' },
      { status: 500 }
    );
  }
}

// DELETE materi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID materi diperlukan' },
        { status: 400 }
      );
    }

    await db.materi.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete materi error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus materi' },
      { status: 500 }
    );
  }
}
