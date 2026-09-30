import prisma from '../db';

export interface SearchFilters {
  query?: string;
  regulators?: string[];
  topics?: string[];
  documentTypes?: string[];
  currentStatuses?: string[];
  verificationStatuses?: string[];
  fromDate?: string;
  toDate?: string;
  isDemo?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  documentNumber: string | null;
  documentType: string;
  publicationDate: string;
  effectiveDate: string | null;
  officialSourceUrl: string;
  currentStatus: string;
  verificationStatus: string;
  isDemo: boolean;
  regulator: {
    id: string;
    shortName: string;
    name: string;
  };
  topics: string[];
  matchReasons: string[];
  matchedSnippet: string | null;
  summary: {
    shortHeadline: string;
    executiveSummary: string;
    confidence: string;
  } | null;
}

export async function searchRegulatoryDocuments(
  filters: SearchFilters,
  limit: number = 20,
  offset: number = 0
): Promise<{ total: number; results: SearchResultItem[] }> {
  const whereClause: any = {};

  if (filters.regulators && filters.regulators.length > 0) {
    whereClause.regulator = {
      shortName: { in: filters.regulators },
    };
  }

  if (filters.documentTypes && filters.documentTypes.length > 0) {
    whereClause.documentType = { in: filters.documentTypes };
  }

  if (filters.currentStatuses && filters.currentStatuses.length > 0) {
    whereClause.currentStatus = { in: filters.currentStatuses };
  }

  if (filters.verificationStatuses && filters.verificationStatuses.length > 0) {
    whereClause.verificationStatus = { in: filters.verificationStatuses };
  }

  if (filters.fromDate) {
    whereClause.publicationDate = {
      ...(whereClause.publicationDate || {}),
      gte: new Date(filters.fromDate),
    };
  }

  if (filters.toDate) {
    whereClause.publicationDate = {
      ...(whereClause.publicationDate || {}),
      lte: new Date(filters.toDate),
    };
  }

  if (filters.topics && filters.topics.length > 0) {
    whereClause.documentTopics = {
      some: {
        topic: {
          name: { in: filters.topics },
        },
      },
    };
  }

  // Handle Query search
  const q = filters.query?.trim();
  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { documentNumber: { contains: q } },
      { extractedText: { contains: q } },
      {
        summary: {
          OR: [
            { shortHeadline: { contains: q } },
            { executiveSummary: { contains: q } },
            { purpose: { contains: q } },
          ],
        },
      },
    ];
  }

  const [total, docs] = await Promise.all([
    prisma.regulatoryDocument.count({ where: whereClause }),
    prisma.regulatoryDocument.findMany({
      where: whereClause,
      include: {
        regulator: true,
        summary: true,
        documentTopics: {
          include: { topic: true },
        },
      },
      orderBy: { publicationDate: 'desc' },
      take: limit,
      skip: offset,
    }),
  ]);

  const results: SearchResultItem[] = docs.map((doc) => {
    const matchReasons: string[] = [];
    let matchedSnippet: string | null = null;

    if (q) {
      const qLower = q.toLowerCase();
      if (doc.documentNumber && doc.documentNumber.toLowerCase().includes(qLower)) {
        matchReasons.push(`Exact Document Number: "${doc.documentNumber}"`);
      }
      if (doc.title.toLowerCase().includes(qLower)) {
        matchReasons.push('Matched in Official Document Title');
      }
      if (doc.summary && (doc.summary.shortHeadline.toLowerCase().includes(qLower) || doc.summary.executiveSummary.toLowerCase().includes(qLower))) {
        matchReasons.push('Matched in Executive Summary & Key Highlights');
      }
      if (doc.extractedText && doc.extractedText.toLowerCase().includes(qLower)) {
        matchReasons.push('Matched in Extracted Official Provisions');
        // Extract surrounding passage
        const idx = doc.extractedText.toLowerCase().indexOf(qLower);
        const start = Math.max(0, idx - 60);
        const end = Math.min(doc.extractedText.length, idx + q.length + 80);
        matchedSnippet = `...${doc.extractedText.substring(start, end).replace(/\s+/g, ' ')}...`;
      }
    }

    if (matchReasons.length === 0) {
      matchReasons.push('Matched regulatory catalog filters');
    }

    return {
      id: doc.id,
      title: doc.title,
      documentNumber: doc.documentNumber,
      documentType: doc.documentType,
      publicationDate: doc.publicationDate.toISOString(),
      effectiveDate: doc.effectiveDate ? doc.effectiveDate.toISOString() : null,
      officialSourceUrl: doc.officialSourceUrl,
      currentStatus: doc.currentStatus,
      verificationStatus: doc.verificationStatus,
      isDemo: doc.isDemo,
      regulator: {
        id: doc.regulator.id,
        shortName: doc.regulator.shortName,
        name: doc.regulator.name,
      },
      topics: doc.documentTopics.map((dt) => dt.topic.name),
      matchReasons,
      matchedSnippet,
      summary: doc.summary
        ? {
            shortHeadline: doc.summary.shortHeadline,
            executiveSummary: doc.summary.executiveSummary,
            confidence: doc.summary.confidence,
          }
        : null,
    };
  });

  return { total, results };
}
