import { z } from 'zod';

export const KeyRequirementSchema = z.object({
  requirement: z.string().min(5),
  mandatoryOrAdvisory: z.enum(['MANDATORY', 'ADVISORY']),
  sourceSection: z.string().min(1),
  supportingText: z.string().min(5),
});

export const ImportantDateSchema = z.object({
  date: z.string(),
  meaning: z.string(),
  sourceSection: z.string(),
});

export const RegulatorySummarySchema = z.object({
  shortHeadline: z.string().min(10),
  executiveSummary: z.string().min(20),
  purpose: z.string().min(10),
  affectedEntities: z.array(z.string()).default([]),
  keyRequirements: z.array(KeyRequirementSchema).default([]),
  advisoryRecommendations: z.array(z.string()).default([]),
  importantDates: z.array(ImportantDateSchema).default([]),
  cybersecurityImpact: z.array(z.string()).default([]),
  technologyImpact: z.array(z.string()).default([]),
  operationalImpact: z.array(z.string()).default([]),
  suggestedConsiderations: z.array(z.string()).default([]),
  documentsAffected: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
});

export type RegulatorySummaryPayload = z.infer<typeof RegulatorySummarySchema>;

export interface ChatRetrievalContext {
  documentId: string;
  documentNumber?: string;
  title: string;
  regulatorShortName: string;
  publicationDate: string;
  currentStatus: string;
  isDemo: boolean;
  officialSourceUrl: string;
  relevantPassages: Array<{
    sectionReference: string;
    text: string;
    pageNumber?: number;
  }>;
}

export interface GroundedAssistantResponse {
  directAnswer: string;
  applicability: string[];
  keyRequirements: Array<{
    text: string;
    mandatory: boolean;
    citation: string;
  }>;
  importantDates: Array<{
    date: string;
    description: string;
    source: string;
  }>;
  operationalConsiderations: string[];
  sourcesAndPassages: Array<{
    documentId: string;
    title: string;
    regulator: string;
    documentNumber?: string;
    officialSourceUrl: string;
    section: string;
    passageSnippet: string;
  }>;
  verificationStatusAndLimitations: string;
  insufficientEvidence?: boolean;
  ambiguityClarification?: string;
  hasWithdrawnOrSupersededWarning?: string;
}
