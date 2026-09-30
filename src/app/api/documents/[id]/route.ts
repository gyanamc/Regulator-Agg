import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const document = await prisma.regulatoryDocument.findUnique({
      where: { id },
      include: {
        regulator: true,
        sourceConnector: true,
        summary: true,
        citations: {
          orderBy: { createdAt: 'asc' },
        },
        documentTopics: {
          include: { topic: true },
        },
        supersedesDocument: {
          select: { id: true, title: true, documentNumber: true, publicationDate: true, currentStatus: true },
        },
        supersededBy: {
          select: { id: true, title: true, documentNumber: true, publicationDate: true, currentStatus: true },
        },
        amendedDocument: {
          select: { id: true, title: true, documentNumber: true, publicationDate: true, currentStatus: true },
        },
        amendedBy: {
          select: { id: true, title: true, documentNumber: true, publicationDate: true, currentStatus: true },
        },
        bookmarks: {
          take: 1,
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Regulatory document not found.' }, { status: 404 });
    }

    return NextResponse.json({
      document: {
        ...document,
        isBookmarked: document.bookmarks.length > 0,
      },
    });
  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
