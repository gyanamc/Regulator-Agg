import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { generateAndStoreSummary } from '@/lib/ai/summarizer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      regulatorShortName,
      title,
      documentNumber,
      documentType,
      publicationDate,
      effectiveDate,
      officialSourceUrl,
      rawText,
      topicNames,
    } = body;

    if (!regulatorShortName || !title || !rawText || !officialSourceUrl) {
      return NextResponse.json(
        { error: 'regulatorShortName, title, officialSourceUrl, and rawText are required.' },
        { status: 400 }
      );
    }

    const regulator = await prisma.regulator.findUnique({
      where: { shortName: regulatorShortName.toUpperCase() },
    });

    if (!regulator) {
      return NextResponse.json(
        { error: `Regulator ${regulatorShortName} does not exist.` },
        { status: 404 }
      );
    }

    const hash = crypto.createHash('sha256').update(rawText).digest('hex');

    // Duplicate detection
    const existing = await prisma.regulatoryDocument.findFirst({
      where: {
        OR: [
          { originalFileHash: hash },
          ...(documentNumber ? [{ documentNumber }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Document already exists with ID ${existing.id} (${existing.documentNumber || existing.title})` },
        { status: 409 }
      );
    }

    const newDoc = await prisma.regulatoryDocument.create({
      data: {
        regulatorId: regulator.id,
        title: title.trim(),
        documentNumber: documentNumber ? documentNumber.trim() : null,
        documentType: documentType || 'CIRCULAR',
        publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        officialSourceUrl: officialSourceUrl.trim(),
        originalFileHash: hash,
        extractedText: rawText.trim(),
        extractionStatus: 'EXTRACTED',
        ingestionStatus: 'PROCESSED',
        currentStatus: 'NEW',
        verificationStatus: 'AI_GENERATED',
        isDemo: false,
      },
    });

    // Tag topics
    if (Array.isArray(topicNames)) {
      for (const tName of topicNames) {
        const topic = await prisma.topic.findUnique({ where: { name: tName } });
        if (topic) {
          await prisma.documentTopic.create({
            data: {
              regulatoryDocumentId: newDoc.id,
              topicId: topic.id,
              relevanceScore: 1.0,
            },
          });
        }
      }
    }

    // Automatically trigger Layer 3 AI summary generation
    try {
      await generateAndStoreSummary(newDoc.id);
    } catch (e: any) {
      console.warn('Initial summary generation warning:', e.message);
    }

    await prisma.auditLog.create({
      data: {
        action: 'MANUAL_DOCUMENT_INGESTION',
        resourceType: 'RegulatoryDocument',
        resourceId: newDoc.id,
        details: JSON.stringify({ title, regulator: regulatorShortName, hash }),
      },
    });

    return NextResponse.json({ success: true, documentId: newDoc.id });
  } catch (error: any) {
    console.error('Manual ingestion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
