import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all kelas or by sekolahId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sekolahId = searchParams.get('sekolahId');

    const whereClause: any = {};
    if (sekolahId) whereClause.sekolahId = sekolahId;

    const kelas = await db.kelas.findMany({
      where: whereClause,
      include: {
        sekolah: true,
        guruKelas: true,
        mataPelajaran: true,
        _count: { select: { mataPelajaran: true } },
      },
      orderBy: [{ tingkat: 'asc' }, { rombel: 'asc' }],
    });

    return NextResponse.json({ success: true, data: kelas });
  } catch (error) {
    console.error('Get kelas error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data kelas' },
      { status: 500 }
    );
  }
}

// POST create new kelas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, tingkat, rombel, sekolahId, guruKelasIds } = body;

    const kelas = await db.kelas.create({
      data: {
        nama,
        tingkat,
        rombel,
        sekolahId,
        guruKelas: guruKelasIds ? {
          connect: guruKelasIds.map((id: string) => ({ id }))
        } : undefined,
      },
      include: {
        sekolah: true,
        guruKelas: true,
      },
    });

    return NextResponse.json({ success: true, data: kelas });
  } catch (error) {
    console.error('Create kelas error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat kelas baru' },
      { status: 500 }
    );
  }
}

// PUT update kelas
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nama, tingkat, rombel, guruKelasIds } = body;

    const kelas = await db.kelas.update({
      where: { id },
      data: {
        nama,
        tingkat,
        rombel,
        guruKelas: guruKelasIds ? {
          set: guruKelasIds.map((id: string) => ({ id }))
        } : undefined,
      },
    });

    return NextResponse.json({ success: true, data: kelas });
  } catch (error) {
    console.error('Update kelas error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui kelas' },
      { status: 500 }
    );
  }
}

// DELETE kelas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID kelas diperlukan' },
        { status: 400 }
      );
    }

    await db.kelas.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete kelas error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus kelas' },
      { status: 500 }
    );
  }
}
