import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const queue = await prisma.regulatoryDocument.findMany({
      where: {
        verificationStatus: { in: ['AI_GENERATED', 'PENDING_REVIEW'] },
      },
      include: {
        regulator: true,
        summary: true,
        citations: true,
        documentTopics: {
          include: { topic: true },
        },
      },
      orderBy: { publicationDate: 'desc' },
    });

    return NextResponse.json({ queue, total: queue.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
