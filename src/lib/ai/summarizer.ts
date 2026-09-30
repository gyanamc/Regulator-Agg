import prisma from '../db';
import { getAIProvider } from './provider';
import { PROMPT_VERSIONS } from './prompts';

export async function generateAndStoreSummary(documentId: string): Promise<any> {
  const document = await prisma.regulatoryDocument.findUnique({
    where: { id: documentId },
    include: { regulator: true },
  });

  if (!document) {
    throw new Error(`Document with ID ${documentId} not found.`);
  }

  if (!document.extractedText || document.extractedText.trim().length === 0) {
    throw new Error(`Cannot summarize document ${documentId}: extractedText is missing or empty.`);
  }

  const aiProvider = getAIProvider();
  const summaryPayload = await aiProvider.generateSummary(document.extractedText, {
    title: document.title,
    regulator: document.regulator.shortName,
    docNumber: document.documentNumber || undefined,
  });

  // Store in Layer 3
  const summary = await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: documentId },
    update: {
      shortHeadline: summaryPayload.shortHeadline,
      executiveSummary: summaryPayload.executiveSummary,
      purpose: summaryPayload.purpose,
      affectedEntities: JSON.stringify(summaryPayload.affectedEntities),
      keyRequirements: JSON.stringify(summaryPayload.keyRequirements),
      advisoryRecommendations: JSON.stringify(summaryPayload.advisoryRecommendations),
      importantDates: JSON.stringify(summaryPayload.importantDates),
      cybersecurityImpact: JSON.stringify(summaryPayload.cybersecurityImpact),
      technologyImpact: JSON.stringify(summaryPayload.technologyImpact),
      operationalImpact: JSON.stringify(summaryPayload.operationalImpact),
      suggestedConsiderations: JSON.stringify(summaryPayload.suggestedConsiderations),
      limitations: JSON.stringify(summaryPayload.limitations),
      confidence: summaryPayload.confidence,
      modelName: aiProvider.name,
      promptVersion: PROMPT_VERSIONS.SUMMARIZER,
      reviewStatus: 'PENDING',
    },
    create: {
      regulatoryDocumentId: documentId,
      shortHeadline: summaryPayload.shortHeadline,
      executiveSummary: summaryPayload.executiveSummary,
      purpose: summaryPayload.purpose,
      affectedEntities: JSON.stringify(summaryPayload.affectedEntities),
      keyRequirements: JSON.stringify(summaryPayload.keyRequirements),
      advisoryRecommendations: JSON.stringify(summaryPayload.advisoryRecommendations),
      importantDates: JSON.stringify(summaryPayload.importantDates),
      cybersecurityImpact: JSON.stringify(summaryPayload.cybersecurityImpact),
      technologyImpact: JSON.stringify(summaryPayload.technologyImpact),
      operationalImpact: JSON.stringify(summaryPayload.operationalImpact),
      suggestedConsiderations: JSON.stringify(summaryPayload.suggestedConsiderations),
      limitations: JSON.stringify(summaryPayload.limitations),
      confidence: summaryPayload.confidence,
      modelName: aiProvider.name,
      promptVersion: PROMPT_VERSIONS.SUMMARIZER,
      reviewStatus: 'PENDING',
    },
  });

  // Automatically construct SourceCitation records for key requirements
  for (const req of summaryPayload.keyRequirements) {
    if (req.supportingText) {
      await prisma.sourceCitation.create({
        data: {
          regulatoryDocumentId: documentId,
          regulatorySummaryId: summary.id,
          sectionReference: req.sourceSection,
          paragraphText: req.supportingText,
        },
      });
    }
  }

  // Update verification status on document to AI_GENERATED if still PENDING
  if (document.verificationStatus === 'AI_GENERATED' || document.verificationStatus === 'PENDING_REVIEW') {
    await prisma.regulatoryDocument.update({
      where: { id: documentId },
      data: { verificationStatus: 'PENDING_REVIEW' },
    });
  }

  return summary;
}
