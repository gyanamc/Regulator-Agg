import crypto from 'crypto';
import prisma from '../db';
import { RawDocumentCandidate, ExtractedDocumentResult, ConnectorHealthReport, IngestionRunResult } from './types';

export abstract class BaseSourceConnector {
  public abstract readonly regulatorShortName: string;
  public abstract readonly sourceName: string;
  public abstract readonly defaultSourceUrl: string;

  /**
   * Check for updates on the official regulatory portal/feed.
   */
  public abstract checkForUpdates(): Promise<RawDocumentCandidate[]>;

  /**
   * List candidates published since a specified date.
   */
  public abstract listDocuments(since?: Date): Promise<RawDocumentCandidate[]>;

  /**
   * Fetch complete metadata for a candidate item.
   */
  public abstract fetchDocumentMetadata(idOrUrl: string): Promise<RawDocumentCandidate>;

  /**
   * Download the raw artifact or fetch official HTML.
   */
  public abstract downloadOriginalDocument(url: string): Promise<{ buffer: Buffer; mimeType: string }>;

  /**
   * Extract authoritative normalized plain text.
   */
  public abstract extractText(content: Buffer | string, mimeType: string): Promise<{
    text: string;
    extractionStatus: 'EXTRACTED' | 'PARTIAL' | 'FAILED';
  }>;

  /**
   * Compute cryptographic SHA-256 fingerprint of the document content.
   */
  public generateFingerprint(content: Buffer | string): string {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Detect duplicate or already ingested document.
   */
  public async detectDuplicate(hash: string, docNumber?: string): Promise<{ isDuplicate: boolean; existingId?: string }> {
    const match = await prisma.regulatoryDocument.findFirst({
      where: {
        OR: [
          { originalFileHash: hash },
          ...(docNumber ? [{ documentNumber: docNumber }] : []),
        ],
      },
      select: { id: true, documentNumber: true, originalFileHash: true },
    });

    if (match) {
      return { isDuplicate: true, existingId: match.id };
    }
    return { isDuplicate: false };
  }

  /**
   * Detect relationships like superseding or amending older documents.
   */
  public detectDocumentRelationships(text: string, title: string): {
    supersedesPattern?: string;
    amendsPattern?: string;
    isWithdrawn?: boolean;
  } {
    const combined = `${title} \n ${text}`.toLowerCase();

    let supersedesPattern: string | undefined;
    let amendsPattern: string | undefined;
    let isWithdrawn = false;

    if (combined.includes('in supersession of') || combined.includes('supersedes circular') || combined.includes('supersedes direction')) {
      const match = combined.match(/(?:in supersession of|supersedes circular|supersedes direction)\s+([a-z0-9\/\-\.]+)/i);
      if (match && match[1]) {
        supersedesPattern = match[1].trim();
      }
    }

    if (combined.includes('amendment to') || combined.includes('amends circular') || combined.includes('partially modified')) {
      const match = combined.match(/(?:amendment to|amends circular|partially modified)\s+([a-z0-9\/\-\.]+)/i);
      if (match && match[1]) {
        amendsPattern = match[1].trim();
      }
    }

    if (combined.includes('[withdrawn]') || combined.includes('hereby withdrawn') || combined.includes('has been revoked')) {
      isWithdrawn = true;
    }

    return { supersedesPattern, amendsPattern, isWithdrawn };
  }

  /**
   * Health report for connector monitoring.
   */
  public async reportHealth(): Promise<ConnectorHealthReport> {
    const connector = await prisma.sourceConnector.findFirst({
      where: { sourceName: this.sourceName },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!connector) {
      return {
        connectorId: 'unknown',
        regulatorShortName: this.regulatorShortName,
        status: 'DEGRADED',
        errorMessage: 'Connector not registered in database',
        totalDocumentsIngested: 0,
      };
    }

    return {
      connectorId: connector.id,
      regulatorShortName: this.regulatorShortName,
      status: (connector.status as any) || 'HEALTHY',
      lastCheckedAt: connector.lastCheckedAt || undefined,
      lastSuccessfulCheckAt: connector.lastSuccessfulCheckAt || undefined,
      errorMessage: connector.errorMessage || undefined,
      totalDocumentsIngested: connector._count.documents,
    };
  }

  /**
   * Orchestrates the complete ingestion lifecycle for this connector.
   */
  public async runIngestionCycle(isManual: boolean = false): Promise<IngestionRunResult> {
    const connector = await prisma.sourceConnector.findFirst({
      where: { sourceName: this.sourceName },
    });

    if (!connector) {
      throw new Error(`Connector ${this.sourceName} not found in database.`);
    }

    const job = await prisma.ingestionJob.create({
      data: {
        sourceConnectorId: connector.id,
        jobType: isManual ? 'MANUAL_UPLOAD' : 'POLL',
        status: 'RUNNING',
      },
    });

    let documentsFound = 0;
    let documentsCreated = 0;
    let documentsUpdated = 0;

    try {
      const candidates = await this.checkForUpdates();
      documentsFound = candidates.length;

      for (const candidate of candidates) {
        // Fetch original content
        const { buffer, mimeType } = await this.downloadOriginalDocument(candidate.officialSourceUrl);
        const hash = this.generateFingerprint(buffer);

        // Check for duplicates
        const { isDuplicate, existingId } = await this.detectDuplicate(hash, candidate.documentNumber);
        if (isDuplicate && existingId) {
          documentsUpdated++;
          continue;
        }

        // Extract text
        const { text, extractionStatus } = await this.extractText(buffer, mimeType);

        // Detect document relationships
        const rels = this.detectDocumentRelationships(text, candidate.title);

        let currentStatus = 'NEW';
        if (rels.isWithdrawn) currentStatus = 'WITHDRAWN';

        // Check if there is an existing superseded doc in DB
        let supersedesDocId: string | null = null;
        if (rels.supersedesPattern) {
          const older = await prisma.regulatoryDocument.findFirst({
            where: {
              documentNumber: { contains: rels.supersedesPattern },
            },
          });
          if (older) {
            supersedesDocId = older.id;
            await prisma.regulatoryDocument.update({
              where: { id: older.id },
              data: { currentStatus: 'SUPERSEDED' },
            });
          }
        }

        // Create new RegulatoryDocument in Layer 1 & 2
        await prisma.regulatoryDocument.create({
          data: {
            regulatorId: connector.regulatorId,
            sourceConnectorId: connector.id,
            title: candidate.title,
            documentNumber: candidate.documentNumber,
            documentType: candidate.documentType,
            publicationDate: candidate.publicationDate,
            effectiveDate: candidate.effectiveDate,
            officialSourceUrl: candidate.officialSourceUrl,
            originalFileUrl: candidate.originalFileUrl || candidate.officialSourceUrl,
            originalFileHash: hash,
            extractedText: text,
            extractionStatus: extractionStatus,
            ingestionStatus: 'PROCESSED',
            currentStatus: currentStatus,
            verificationStatus: 'AI_GENERATED',
            supersedesDocumentId: supersedesDocId,
            isDemo: false,
          },
        });

        documentsCreated++;
      }

      await prisma.sourceConnector.update({
        where: { id: connector.id },
        data: {
          lastCheckedAt: new Date(),
          lastSuccessfulCheckAt: new Date(),
          status: 'HEALTHY',
          errorMessage: null,
        },
      });

      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          documentsFound,
          documentsCreated,
          documentsUpdated,
        },
      });

      return {
        connectorId: connector.id,
        jobId: job.id,
        status: 'COMPLETED',
        documentsFound,
        documentsCreated,
        documentsUpdated,
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      await prisma.sourceConnector.update({
        where: { id: connector.id },
        data: {
          lastCheckedAt: new Date(),
          status: 'ERROR',
          errorMessage: errMsg,
        },
      });

      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          documentsFound,
          documentsCreated,
          documentsUpdated,
          errorMessage: errMsg,
          retryCount: { increment: 1 },
        },
      });

      return {
        connectorId: connector.id,
        jobId: job.id,
        status: 'FAILED',
        documentsFound,
        documentsCreated,
        documentsUpdated,
        errorMessage: errMsg,
      };
    }
  }
}
