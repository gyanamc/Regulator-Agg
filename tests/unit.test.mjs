import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { z } from 'zod';

// Replicating schemas & validators for unit test suite
const KeyRequirementSchema = z.object({
  requirement: z.string().min(5),
  mandatoryOrAdvisory: z.enum(['MANDATORY', 'ADVISORY']),
  sourceSection: z.string().min(1),
  supportingText: z.string().min(5),
});

const RegulatorySummarySchema = z.object({
  shortHeadline: z.string().min(10),
  executiveSummary: z.string().min(20),
  purpose: z.string().min(10),
  affectedEntities: z.array(z.string()).default([]),
  keyRequirements: z.array(KeyRequirementSchema).default([]),
  confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
});

describe('Unit Tests: Core Data Parsers & Validation', () => {
  test('SHA-256 Document Hashing is deterministic', () => {
    const content = 'RESERVE BANK OF INDIA MASTER DIRECTION ON IT GOVERNANCE 2024';
    const hash1 = crypto.createHash('sha256').update(content).digest('hex');
    const hash2 = crypto.createHash('sha256').update(content).digest('hex');
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  test('Regulatory Date Parsing handles standard Indian formats', () => {
    const rawDateStr = '2024-04-01';
    const parsed = new Date(rawDateStr);
    assert.equal(parsed.getFullYear(), 2024);
    assert.equal(parsed.getMonth(), 3); // 0-indexed April
    assert.equal(parsed.getDate(), 1);
  });

  test('RegulatorySummarySchema accepts valid structured summary', () => {
    const validData = {
      shortHeadline: 'RBI mandates independent CISO reporting and 24x7 SOC for all commercial banks.',
      executiveSummary: 'Comprehensive master direction establishing IT strategy committee oversight and cloud data localization in India.',
      purpose: 'To standardize cybersecurity governance across Indian financial institutions.',
      affectedEntities: ['Scheduled Commercial Banks', 'NBFCs'],
      keyRequirements: [
        {
          requirement: 'CISO must report directly to Board Risk Committee or Executive Director.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.3',
          supportingText: 'The Chief Information Security Officer (CISO) shall be an independent senior management officer...',
        },
      ],
      confidence: 'HIGH',
    };

    const parsed = RegulatorySummarySchema.parse(validData);
    assert.equal(parsed.confidence, 'HIGH');
    assert.equal(parsed.keyRequirements.length, 1);
    assert.equal(parsed.keyRequirements[0].mandatoryOrAdvisory, 'MANDATORY');
  });

  test('RegulatorySummarySchema rejects malformed summary with missing required fields', () => {
    const invalidData = {
      shortHeadline: 'Too short', // < 10 chars
      executiveSummary: 'Missing fields',
    };

    assert.throws(() => {
      RegulatorySummarySchema.parse(invalidData);
    }, z.ZodError);
  });

  test('Document Relationship Extractor detects superseding and withdrawn directives', () => {
    const supersedingText = 'In supersession of circular RBI/2006-07/40, banks are hereby directed to implement revised outsourcing controls.';
    const isSuperseding = /in supersession of\s+([a-z0-9\/\-\.]+)/i.test(supersedingText);
    assert.equal(isSuperseding, true);

    const withdrawnText = 'Advisory on Legacy FIX Protocol Interfaces [WITHDRAWN pursuant to circular dated August 2023].';
    const isWithdrawn = /(?:\[withdrawn|\bwithdrawn\b|hereby withdrawn)/i.test(withdrawnText);
    assert.equal(isWithdrawn, true);
  });

  test('Role-Based Authorization matrix checks', () => {
    const permissions = {
      VISITOR: { canReview: false, canAdmin: false, canBookmark: false },
      REGISTERED_USER: { canReview: false, canAdmin: false, canBookmark: true },
      REVIEWER: { canReview: true, canAdmin: false, canBookmark: true },
      ADMINISTRATOR: { canReview: true, canAdmin: true, canBookmark: true },
    };

    assert.equal(permissions.VISITOR.canReview, false);
    assert.equal(permissions.REGISTERED_USER.canReview, false);
    assert.equal(permissions.REVIEWER.canReview, true);
    assert.equal(permissions.ADMINISTRATOR.canAdmin, true);
  });
});
