import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';

// GET - Download template
export async function GET(request: NextRequest) {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'TEMPLATE MATERI AJAR - SD',
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Aplikasi Sekolah SD',
                  italics: true,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ children: [] }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Petunjuk Pengisian:',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '1. Isi data materi sesuai dengan format yang disediakan',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '2. Judul dan Deskripsi wajib diisi',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '3. Konten materi dapat berupa teks panjang',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '4. Kategori: "umum" atau "template"',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '5. Upload file ini untuk menambah materi baru',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({ children: [] }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'DATA MATERI',
                  bold: true,
                  size: 26,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            }),
            // Table for template
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Judul Materi', bold: true })],
                        }),
                      ],
                      width: { size: 30, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: '[ISI JUDUL MATERI DI SINI]' })],
                        }),
                      ],
                      width: { size: 70, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Deskripsi', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: '[ISI DESKRIPSI SINGKAT MATERI]' })],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Kategori', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'umum' })],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Mata Pelajaran', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: '[NAMA MATA PELAJARAN]' })],
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: 'Konten Materi', bold: true })],
                        }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: '' })],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '[TULIS KONTEN MATERI LENGKAP DI SINI]',
                              italics: true,
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Anda dapat menulis paragraf panjang.',
                            }),
                          ],
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Mendukung format HTML sederhana.',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="template_materi_sd.docx"',
      },
    });
  } catch (error) {
    console.error('Generate template error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membuat template' },
      { status: 500 }
    );
  }
}

// POST - Parse uploaded template
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Read file content as text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For simplicity, we'll extract text from the docx
    // In production, you'd use a proper docx parser like mammoth.js
    const content = buffer.toString('utf-8');

    // Simple extraction - look for patterns in the XML
    let judul = '';
    let deskripsi = '';
    let kategori = 'umum';
    let mapel = '';
    let konten = '';

    // Extract values between tags (simplified approach)
    const extractValue = (text: string, marker: string): string => {
      const regex = new RegExp(`\\[${marker}([^\\]]*)\\]`, 'i');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    // For now, return a simple structure
    // In production, use mammoth or similar library for proper parsing
    return NextResponse.json({
      success: true,
      message: 'File diterima. Silakan isi form secara manual.',
      data: {
        judul: '',
        deskripsi: '',
        kategori: 'umum',
        mapel: '',
        konten: '',
      },
    });
  } catch (error) {
    console.error('Parse template error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membaca file' },
      { status: 500 }
    );
  }
}
