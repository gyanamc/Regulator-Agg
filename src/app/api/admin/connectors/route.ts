import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { connectorRegistry } from '@/lib/connectors/registry';

export async function GET(request: NextRequest) {
  try {
    const connectors = await prisma.sourceConnector.findMany({
      include: {
        regulator: true,
        _count: {
          select: { documents: true, ingestionJobs: true },
        },
      },
    });

    const recentJobs = await prisma.ingestionJob.findMany({
      take: 15,
      orderBy: { startedAt: 'desc' },
      include: {
        sourceConnector: {
          include: { regulator: true },
        },
      },
    });

    const totalDocs = await prisma.regulatoryDocument.count();
    const demoDocs = await prisma.regulatoryDocument.count({ where: { isDemo: true } });
    const liveDocs = await prisma.regulatoryDocument.count({ where: { isDemo: false } });
    const pendingReviewDocs = await prisma.regulatoryDocument.count({
      where: { verificationStatus: { in: ['AI_GENERATED', 'PENDING_REVIEW'] } },
    });

    return NextResponse.json({
      connectors,
      recentJobs,
      stats: {
        totalDocs,
        demoDocs,
        liveDocs,
        pendingReviewDocs,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
