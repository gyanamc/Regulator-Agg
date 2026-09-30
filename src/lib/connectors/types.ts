export interface RawDocumentCandidate {
  sourceId: string;
  title: string;
  documentNumber?: string;
  documentType: 'MASTER_DIRECTION' | 'CIRCULAR' | 'ADVISORY' | 'NOTIFICATION' | 'GUIDELINE' | 'ORDER';
  publicationDate: Date;
  effectiveDate?: Date;
  officialSourceUrl: string;
  originalFileUrl?: string;
  rawContent?: string;
}

export interface ExtractedDocumentResult {
  title: string;
  documentNumber?: string;
  documentType: string;
  publicationDate: Date;
  effectiveDate?: Date;
  officialSourceUrl: string;
  originalFileUrl?: string;
  originalFileHash: string;
  extractedText: string;
  extractionStatus: 'PENDING' | 'EXTRACTED' | 'PARTIAL' | 'FAILED';
  suggestedTopics: string[];
}

export interface ConnectorHealthReport {
  connectorId: string;
  regulatorShortName: string;
  status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  lastCheckedAt?: Date;
  lastSuccessfulCheckAt?: Date;
  errorMessage?: string;
  totalDocumentsIngested: number;
}

export interface IngestionRunResult {
  connectorId: string;
  jobId: string;
  status: 'COMPLETED' | 'FAILED';
  documentsFound: number;
  documentsCreated: number;
  documentsUpdated: number;
  errorMessage?: string;
}
