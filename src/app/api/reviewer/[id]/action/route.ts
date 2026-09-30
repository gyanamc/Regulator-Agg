import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateAndStoreSummary } from '@/lib/ai/summarizer';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, notes, reviewerName } = body;

    const document = await prisma.regulatoryDocument.findUnique({
      where: { id },
      include: { summary: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const reviewer = reviewerName || 'Senior Compliance Reviewer';

    if (action === 'APPROVE') {
      await prisma.regulatoryDocument.update({
        where: { id },
        data: { verificationStatus: 'HUMAN_REVIEWED' },
      });

      if (document.summary) {
        await prisma.regulatorySummary.update({
          where: { id: document.summary.id },
          data: {
            reviewStatus: 'APPROVED',
            reviewedBy: reviewer,
            reviewedAt: new Date(),
            reviewerNotes: notes || 'Approved by compliance reviewer after cross-verification with authoritative source text.',
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: 'REVIEW_APPROVE',
          resourceType: 'RegulatoryDocument',
          resourceId: id,
          details: JSON.stringify({ reviewer, notes, previousStatus: document.verificationStatus }),
        },
      });

      return NextResponse.json({ success: true, status: 'HUMAN_REVIEWED' });
    } else if (action === 'REJECT') {
      await prisma.regulatoryDocument.update({
        where: { id },
        data: { verificationStatus: 'REJECTED' },
      });

      if (document.summary) {
        await prisma.regulatorySummary.update({
          where: { id: document.summary.id },
          data: {
            reviewStatus: 'REJECTED',
            reviewedBy: reviewer,
            reviewedAt: new Date(),
            reviewerNotes: notes || 'Rejected due to discrepancies or unverified interpretation.',
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          action: 'REVIEW_REJECT',
          resourceType: 'RegulatoryDocument',
          resourceId: id,
          details: JSON.stringify({ reviewer, notes }),
        },
      });

      return NextResponse.json({ success: true, status: 'REJECTED' });
    } else if (action === 'REGENERATE') {
      const newSummary = await generateAndStoreSummary(id);

      await prisma.auditLog.create({
        data: {
          action: 'REGENERATE_SUMMARY',
          resourceType: 'RegulatorySummary',
          resourceId: newSummary.id,
          details: JSON.stringify({ reviewer, notes }),
        },
      });

      return NextResponse.json({ success: true, status: 'PENDING_REVIEW', summary: newSummary });
    }

    return NextResponse.json({ error: 'Invalid reviewer action' }, { status: 400 });
  } catch (error: any) {
    console.error('Reviewer action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
