import prisma from '../db';
import { getAIProvider } from './provider';
import { ChatRetrievalContext, GroundedAssistantResponse } from './types';

export interface AssistantQueryOptions {
  question: string;
  targetDocumentId?: string;
  regulators?: string[];
  topics?: string[];
  conversationId?: string;
}

export async function askRegulatoryAssistant(options: AssistantQueryOptions): Promise<{
  conversationId: string;
  response: GroundedAssistantResponse;
}> {
  const { question, targetDocumentId, regulators, topics } = options;

  // 1. Build document retrieval filter
  const where: any = {
    // Exclude rejected documents from chatbot retrieval
    verificationStatus: { not: 'REJECTED' },
  };

  if (targetDocumentId) {
    where.id = targetDocumentId;
  } else {
    if (regulators && regulators.length > 0) {
      where.regulator = { shortName: { in: regulators } };
    }
    if (topics && topics.length > 0) {
      where.documentTopics = {
        some: { topic: { name: { in: topics } } },
      };
    }
  }

  // Retrieve relevant documents based on question keywords
  const keywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  // If specific target document requested, load it directly
  let matchedDocs: any[] = [];
  if (targetDocumentId) {
    const doc = await prisma.regulatoryDocument.findUnique({
      where: { id: targetDocumentId },
      include: { regulator: true, citations: true },
    });
    if (doc) matchedDocs = [doc];
  } else {
    // Search across title and extracted text
    const orClauses: any[] = [];
    for (const kw of keywords) {
      orClauses.push({ title: { contains: kw } });
      orClauses.push({ extractedText: { contains: kw } });
    }

    if (orClauses.length > 0) {
      where.OR = orClauses;
    }

    matchedDocs = await prisma.regulatoryDocument.findMany({
      where,
      include: { regulator: true, citations: true },
      take: 4,
      orderBy: { publicationDate: 'desc' },
    });
  }

  // 2. Build retrieval context
  const contexts: ChatRetrievalContext[] = matchedDocs.map((doc) => {
    // Extract relevant passages
    const passages: Array<{ sectionReference: string; text: string; pageNumber?: number }> = [];

    if (doc.citations && doc.citations.length > 0) {
      for (const c of doc.citations.slice(0, 3)) {
        passages.push({
          sectionReference: c.sectionReference,
          text: c.paragraphText,
          pageNumber: c.pageNumber || undefined,
        });
      }
    }

    // If citations are sparse, extract paragraphs from extractedText
    if (passages.length === 0 && doc.extractedText) {
      const paragraphs = doc.extractedText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 40);
      for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
        passages.push({
          sectionReference: `Section ${i + 1}`,
          text: paragraphs[i].trim(),
        });
      }
    }

    return {
      documentId: doc.id,
      documentNumber: doc.documentNumber || undefined,
      title: doc.title,
      regulatorShortName: doc.regulator.shortName,
      publicationDate: doc.publicationDate.toISOString(),
      currentStatus: doc.currentStatus,
      isDemo: doc.isDemo,
      officialSourceUrl: doc.officialSourceUrl,
      relevantPassages: passages,
    };
  });

  // 3. Delegate to AI Provider
  const aiProvider = getAIProvider();
  const assistantResponse = await aiProvider.generateAssistantAnswer(question, contexts);

  // 4. Persist conversation history
  let convId = options.conversationId;
  if (!convId) {
    const conv = await prisma.chatConversation.create({
      data: {
        title: question.substring(0, 60),
        documentId: targetDocumentId || null,
      },
    });
    convId = conv.id;
  }

  // Save user message
  await prisma.chatMessage.create({
    data: {
      conversationId: convId,
      role: 'user',
      content: question,
    },
  });

  // Save assistant message
  await prisma.chatMessage.create({
    data: {
      conversationId: convId,
      role: 'assistant',
      content: assistantResponse.directAnswer,
      retrievalMetadata: JSON.stringify({
        applicability: assistantResponse.applicability,
        keyRequirements: assistantResponse.keyRequirements,
        importantDates: assistantResponse.importantDates,
        sourcesAndPassages: assistantResponse.sourcesAndPassages,
        insufficientEvidence: assistantResponse.insufficientEvidence,
        hasWithdrawnOrSupersededWarning: assistantResponse.hasWithdrawnOrSupersededWarning,
      }),
    },
  });

  return {
    conversationId: convId,
    response: assistantResponse,
  };
}
