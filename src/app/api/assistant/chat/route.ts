import { NextRequest, NextResponse } from 'next/server';
import { askRegulatoryAssistant } from '@/lib/ai/assistant';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, targetDocumentId, regulators, topics, conversationId } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const result = await askRegulatoryAssistant({
      question: question.trim(),
      targetDocumentId: targetDocumentId || undefined,
      regulators: Array.isArray(regulators) ? regulators : undefined,
      topics: Array.isArray(topics) ? topics : undefined,
      conversationId: conversationId || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: error.message || 'Assistant execution failed' }, { status: 500 });
  }
}
