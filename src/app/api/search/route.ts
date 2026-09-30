import { NextRequest, NextResponse } from 'next/server';
import { searchRegulatoryDocuments } from '@/lib/search/search-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const regulators = searchParams.getAll('regulator');
    const topics = searchParams.getAll('topic');
    const documentTypes = searchParams.getAll('type');
    const currentStatuses = searchParams.getAll('status');
    const verificationStatuses = searchParams.getAll('verification');
    const fromDate = searchParams.get('from') || undefined;
    const toDate = searchParams.get('to') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const { total, results } = await searchRegulatoryDocuments(
      {
        query,
        regulators: regulators.length > 0 ? regulators : undefined,
        topics: topics.length > 0 ? topics : undefined,
        documentTypes: documentTypes.length > 0 ? documentTypes : undefined,
        currentStatuses: currentStatuses.length > 0 ? currentStatuses : undefined,
        verificationStatuses: verificationStatuses.length > 0 ? verificationStatuses : undefined,
        fromDate,
        toDate,
      },
      limit,
      offset
    );

    return NextResponse.json({ total, results, limit, offset });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message || 'Search execution failed' }, { status: 500 });
  }
}
