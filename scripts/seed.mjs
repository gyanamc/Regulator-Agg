import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Regulatory Intelligence Hub database...');

  // 1. Seed Topics
  const topicsData = [
    { name: 'Cybersecurity', description: 'Defensive controls, network protection, SOC operations, vulnerability management, and breach readiness.' },
    { name: 'Technology Risk', description: 'Systemic IT failures, legacy architecture hazards, obsolescence, and technological risk appetites.' },
    { name: 'Artificial Intelligence', description: 'Responsible AI, model bias, algorithmic transparency, automated decision-making controls.' },
    { name: 'Cloud', description: 'Cloud security posture, multi-tenant risk, cryptographic key management, and cloud migration governance.' },
    { name: 'Outsourcing', description: 'Third-party vendor management, intra-group service arrangements, and operational independence.' },
    { name: 'Third-Party Risk', description: 'Supply chain security, SaaS risk evaluations, and fourth-party dependency tracking.' },
    { name: 'Data Protection', description: 'Digital Personal Data Protection (DPDP) compliance, customer data localisation, and encryption.' },
    { name: 'Digital Payments', description: 'UPI, NEFT/RTGS, payment aggregators, tokenisation, fraud monitoring, and settlement security.' },
    { name: 'Incident Reporting', description: 'Mandatory 6-hour CERT-In reporting, regulatory notification windows, and root cause reporting.' },
    { name: 'Operational Resilience', description: 'Severe operational disruption tolerance, scenario testing, and critical service mapping.' },
    { name: 'Business Continuity', description: 'Disaster Recovery (DR), RTO/RPO metrics, failover drill testing, and alternate site readiness.' },
    { name: 'IT Governance', description: 'Board oversight, IT steering committees, CIO/CISO mandates, and technology audit frameworks.' },
  ];

  const topicsMap = {};
  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: t,
    });
    topicsMap[t.name] = topic.id;
  }
  console.log(`✓ Seeded ${topicsData.length} topics`);

  // 2. Seed Regulators
  const regulatorsData = [
    {
      shortName: 'RBI',
      name: 'Reserve Bank of India',
      officialWebsite: 'https://www.rbi.org.in',
      description: 'India\'s central bank and regulatory authority governing scheduled commercial banks, non-banking financial companies (NBFCs), payment system operators, and primary dealers.',
      active: true,
    },
    {
      shortName: 'SEBI',
      name: 'Securities and Exchange Board of India',
      officialWebsite: 'https://www.sebi.gov.in',
      description: 'Regulator for the securities, commodity, and capital markets in India, safeguarding investor interests and supervising stock exchanges, depositories, and intermediaries.',
      active: true,
    },
    {
      shortName: 'CERT-In',
      name: 'Indian Computer Emergency Response Team',
      officialWebsite: 'https://www.cert-in.org.in',
      description: 'The national nodal agency under the Ministry of Electronics and Information Technology (MeitY) for responding to computer security incidents and issuing cyber advisories.',
      active: true,
    },
    {
      shortName: 'NPCI',
      name: 'National Payments Corporation of India',
      officialWebsite: 'https://www.npci.org.in',
      description: 'Umbrella organisation for operating retail payments and settlement systems in India, including UPI, IMPS, RuPay, AePS, and NACH.',
      active: true,
    },
    {
      shortName: 'IRDAI',
      name: 'Insurance Regulatory and Development Authority of India',
      officialWebsite: 'https://irdai.gov.in',
      description: 'Statutory body charged with regulating and promoting the insurance and re-insurance industries throughout India.',
      active: true,
    },
  ];

  const regulatorsMap = {};
  for (const r of regulatorsData) {
    const reg = await prisma.regulator.upsert({
      where: { shortName: r.shortName },
      update: { name: r.name, officialWebsite: r.officialWebsite, description: r.description },
      create: r,
    });
    regulatorsMap[r.shortName] = reg.id;
  }
  console.log(`✓ Seeded ${regulatorsData.length} regulators`);

  // 3. Seed Source Connectors
  const connectorsData = [
    {
      regulatorId: regulatorsMap['CERT-In'],
      sourceName: 'CERT-In Security Advisories & Vulnerability Feed',
      sourceUrl: 'https://www.cert-in.org.in/s2cIOs?action=advisories',
      sourceType: 'RSS',
      checkFrequency: 'HOURLY',
      status: 'HEALTHY',
    },
    {
      regulatorId: regulatorsMap['RBI'],
      sourceName: 'RBI Notifications & Master Directions Feed',
      sourceUrl: 'https://www.rbi.org.in/Scripts/BS_NotificationsDisplay.aspx',
      sourceType: 'HTML_TABLE',
      checkFrequency: 'DAILY',
      status: 'HEALTHY',
    },
    {
      regulatorId: regulatorsMap['SEBI'],
      sourceName: 'SEBI Circulars & Regulatory Instructions',
      sourceUrl: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&smid=0&ssid=7',
      sourceType: 'HTML_TABLE',
      checkFrequency: 'DAILY',
      status: 'HEALTHY',
    },
    {
      regulatorId: regulatorsMap['NPCI'],
      sourceName: 'NPCI UPI & Payment Security Circulars',
      sourceUrl: 'https://www.npci.org.in/what-we-do/upi/circulars',
      sourceType: 'HTML_TABLE',
      checkFrequency: 'DAILY',
      status: 'HEALTHY',
    },
    {
      regulatorId: regulatorsMap['IRDAI'],
      sourceName: 'IRDAI Cyber Security & IT Circulars',
      sourceUrl: 'https://irdai.gov.in/circulars',
      sourceType: 'HTML_TABLE',
      checkFrequency: 'DAILY',
      status: 'HEALTHY',
    },
  ];

  const connectorsMap = {};
  for (const c of connectorsData) {
    const existing = await prisma.sourceConnector.findFirst({
      where: { sourceName: c.sourceName, regulatorId: c.regulatorId },
    });
    if (existing) {
      connectorsMap[c.sourceName] = existing.id;
    } else {
      const created = await prisma.sourceConnector.create({
        data: {
          ...c,
          lastCheckedAt: new Date(),
          lastSuccessfulCheckAt: new Date(),
        },
      });
      connectorsMap[c.sourceName] = created.id;
    }
  }
  console.log(`✓ Seeded ${connectorsData.length} source connectors`);

  // 4. Seed Users for Role Testing
  const usersData = [
    {
      email: 'visitor@regintel.in',
      name: 'Public Visitor',
      role: 'VISITOR',
      organisation: 'General Public / Guest',
    },
    {
      email: 'analyst@bank.in',
      name: 'Sunita Sharma (Compliance Lead)',
      role: 'REGISTERED_USER',
      organisation: 'National Banking Group',
    },
    {
      email: 'reviewer@finreg.gov.in',
      name: 'Amitabh Sen (Senior Regulatory Reviewer)',
      role: 'REVIEWER',
      organisation: 'Financial Regulatory Review Board',
    },
    {
      email: 'admin@regintel.in',
      name: 'Priya Iyer (System Administrator)',
      role: 'ADMINISTRATOR',
      organisation: 'Regulatory Intelligence Hub Operations',
    },
  ];

  const usersMap = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, organisation: u.organisation },
      create: u,
    });
    usersMap[u.email] = user.id;
  }
  console.log(`✓ Seeded ${usersData.length} enterprise users across 4 RBAC roles`);

  // 5. Seed Documents with Exact 3-Layer Separation, Citations, & Relationships
  // Document 1: RBI IT Governance Master Direction (Current)
  const doc1ExtractedText = `RESERVE BANK OF INDIA
MASTER DIRECTION – INFORMATION TECHNOLOGY GOVERNANCE, RISK, CONTROLS AND ASSURANCE PRACTICES

1. PRELIMINARY
1.1 In exercise of powers conferred under Section 35A of the Banking Regulation Act, 1949, the Reserve Bank of India hereby issues this Master Direction to scheduled commercial banks, non-banking financial companies (NBFCs), and all payment system operators.

2. IT GOVERNANCE & BOARD OVERSIGHT
2.1 Every Regulated Entity (RE) shall establish an IT Strategy Committee of the Board headed by an Independent Director.
2.2 The IT Strategy Committee shall review the cybersecurity posture, IT investments, and operational resilience at least once every quarter.
2.3 The Chief Information Security Officer (CISO) shall be an independent senior management officer who shall report directly to the Executive Director or the Board Risk Committee without operational reporting to the CIO.

3. CYBERSECURITY CONTROLS & CONTINUOUS MONITORING
3.1 REs shall deploy automated Security Operations Centre (SOC) capabilities operating on a 24x7x365 basis with real-time SIEM alerting.
3.2 Privileged Access Management (PAM) with multi-factor authentication (MFA) shall be mandatory for all administrative and production access.
3.3 Critical cyber incidents shall be notified to the RBI Cyber Security and IT Risk Cell within 6 hours of detection, with a comprehensive root cause analysis (RCA) submitted within 21 calendar days.

4. THIRD-PARTY RISK & CLOUD ADOPTION
4.1 Any outsourcing of material IT operations to cloud service providers (CSPs) shall ensure that customer data remains within the territory of India as per applicable data localization directives.
4.2 REs shall retain unconditional audit rights, including forensic examination rights, across primary CSP data centres and alternate disaster recovery sites.
4.3 Exit strategies and operational migration playbooks must be tested annually to prevent single-vendor lock-in.

5. IMPLEMENTATION TIMELINE
5.1 These directions shall take effect from April 1, 2024. All REs must attain compliance within 90 days of the effective date.`;

  const doc1Hash = crypto.createHash('sha256').update(doc1ExtractedText).digest('hex');

  const doc1 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-rbi-it-gov-2024' },
    update: {},
    create: {
      id: 'doc-rbi-it-gov-2024',
      regulatorId: regulatorsMap['RBI'],
      sourceConnectorId: connectorsMap['RBI Notifications & Master Directions Feed'],
      title: '[DEMO_DATA] Master Direction – Information Technology Governance, Risk, Controls and Assurance Practices',
      documentNumber: 'DEMO-RBI-2023-24-107',
      documentType: 'MASTER_DIRECTION',
      publicationDate: new Date('2024-01-15T10:00:00Z'),
      effectiveDate: new Date('2024-04-01T00:00:00Z'),
      officialSourceUrl: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12560',
      originalFileUrl: '/fixtures/rbi-it-gov-2024.pdf',
      originalFileHash: doc1Hash,
      extractedText: doc1ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'CURRENT',
      verificationStatus: 'HUMAN_REVIEWED',
      isDemo: true,
    },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc1.id },
    update: {},
    create: {
      regulatoryDocumentId: doc1.id,
      shortHeadline: 'Mandatory IT governance framework establishing Board oversight, independent CISO reporting, and 6-hour cyber incident notification windows for banks and NBFCs.',
      executiveSummary: 'The Reserve Bank of India has issued comprehensive directions establishing governance standards for IT and cybersecurity across regulated financial entities. The guidelines mandate an independent Board IT Strategy Committee, direct reporting of the CISO to the Board Risk Committee, 24x7 SOC requirements, strict cloud data residency in India, and a 6-hour initial incident notification window.',
      purpose: 'To enhance systemic cyber resilience, standardize technology risk governance, and mandate rigorous third-party and cloud risk oversight across Indian banking institutions.',
      affectedEntities: JSON.stringify(['Scheduled Commercial Banks', 'Non-Banking Financial Companies (NBFCs)', 'Payment System Operators', 'Primary Dealers']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Establish an IT Strategy Committee of the Board chaired by an Independent Director, convening at least quarterly.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.1 & 2.2',
          supportingText: 'Every Regulated Entity (RE) shall establish an IT Strategy Committee of the Board headed by an Independent Director... review at least once every quarter.'
        },
        {
          requirement: 'CISO must report directly to the Executive Director or Board Risk Committee without operational reporting to the CIO.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.3',
          supportingText: 'The Chief Information Security Officer (CISO) shall be an independent senior management officer who shall report directly to the Executive Director or the Board Risk Committee.'
        },
        {
          requirement: 'Notify cyber incidents to RBI within 6 hours of detection; submit Root Cause Analysis within 21 days.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 3.3',
          supportingText: 'Critical cyber incidents shall be notified to the RBI Cyber Security and IT Risk Cell within 6 hours of detection, with a comprehensive root cause analysis (RCA) submitted within 21 calendar days.'
        },
        {
          requirement: 'Maintain cloud customer data residency in India and retain unconditional physical and forensic audit rights.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 4.1 & 4.2',
          supportingText: 'Ensure that customer data remains within the territory of India... retain unconditional audit rights, including forensic examination rights.'
        }
      ]),
      advisoryRecommendations: JSON.stringify([
        'Test multi-cloud exit playbooks annually to prevent single-vendor concentration risk.',
        'Adopt automated privileged session recording tools.'
      ]),
      importantDates: JSON.stringify([
        { date: '2024-01-15', meaning: 'Date of official issuance by Reserve Bank of India', sourceSection: 'Document Header' },
        { date: '2024-04-01', meaning: 'Effective enforcement date across all regulated entities', sourceSection: 'Section 5.1' },
        { date: '2024-06-30', meaning: 'End of 90-day transitional compliance window', sourceSection: 'Section 5.1' }
      ]),
      cybersecurityImpact: JSON.stringify([
        'Mandatory 24x7x365 automated SOC with real-time SIEM alerts.',
        'MFA-enforced Privileged Access Management across all production infrastructure.',
        'Strict 6-hour incident disclosure timeline.'
      ]),
      technologyImpact: JSON.stringify([
        'Strict data localization verification for cloud-hosted environments.',
        'Requirement for vendor-agnostic architecture and portable disaster recovery workloads.'
      ]),
      operationalImpact: JSON.stringify([
        'Board calendar restructuring for quarterly IT Strategy reviews.',
        'Independent CISO reporting line restructuring.',
        'Annual third-party cloud exit simulation drills.'
      ]),
      suggestedConsiderations: JSON.stringify([
        'Review current CISO reporting hierarchy to eliminate conflicts of interest with CIO KPI delivery.',
        'Conduct contractual reviews of cloud provider agreements to verify forensic audit rights and data localization clauses.'
      ]),
      limitations: JSON.stringify([
        'Applies only to RBI regulated entities. Mutual funds and stockbrokers remain governed by SEBI CSCRF framework.'
      ]),
      confidence: 'HIGH',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewedBy: 'Amitabh Sen',
      reviewedAt: new Date('2024-01-18T14:30:00Z'),
      reviewStatus: 'APPROVED',
      reviewerNotes: 'Verified against authoritative Master Direction text. Citations and mandatory/advisory splits confirmed accurate.',
    },
  });

  // Link citations for doc1 if not already present
  const existingCitations = await prisma.sourceCitation.count({ where: { regulatoryDocumentId: doc1.id } });
  if (existingCitations === 0) {
    await prisma.sourceCitation.createMany({
      data: [
        {
          regulatoryDocumentId: doc1.id,
          sectionReference: 'Section 2.3',
          pageNumber: 1,
          paragraphText: 'The Chief Information Security Officer (CISO) shall be an independent senior management officer who shall report directly to the Executive Director or the Board Risk Committee without operational reporting to the CIO.',
          textStartOffset: 574,
          textEndOffset: 808,
        },
        {
          regulatoryDocumentId: doc1.id,
          sectionReference: 'Section 3.3',
          pageNumber: 1,
          paragraphText: 'Critical cyber incidents shall be notified to the RBI Cyber Security and IT Risk Cell within 6 hours of detection, with a comprehensive root cause analysis (RCA) submitted within 21 calendar days.',
          textStartOffset: 1045,
          textEndOffset: 1241,
        },
      ],
    });
  }

  // Link topics for doc1
  for (const tName of ['IT Governance', 'Cybersecurity', 'Cloud', 'Third-Party Risk', 'Incident Reporting']) {
    if (topicsMap[tName]) {
      await prisma.documentTopic.upsert({
        where: { regulatoryDocumentId_topicId: { regulatoryDocumentId: doc1.id, topicId: topicsMap[tName] } },
        update: {},
        create: { regulatoryDocumentId: doc1.id, topicId: topicsMap[tName], relevanceScore: 0.95 },
      });
    }
  }

  // Document 2: SEBI CSCRF Framework (Current)
  const doc2ExtractedText = `SECURITIES AND EXCHANGE BOARD OF INDIA
CIRCULAR: SEBI/HO/MIRSD/CRF/CIR/2024/0088

TO:
1. All Recognized Stock Exchanges, Clearing Corporations, and Depositories
2. Registered Stock Brokers, Depository Participants, Asset Management Companies (AMCs)
3. Qualified Registrars to an Issue and Share Transfer Agents (QRTAs)

SUBJECT: CYBERSECURITY AND CYBER RESILIENCE FRAMEWORK (CSCRF) FOR SEBI REGULATED ENTITIES

1. APPLICABILITY & GRADED RISK CLASSIFICATION
1.1 Market Infrastructure Institutions (MIIs) and Qualified REs are classified under Qualified Category with heightened cyber resilience mandates.
1.2 Mid-tier and small intermediaries are classified under Basic and Mid categories with proportionate controls.

2. CYBER INCIDENT REPORTING
2.1 All cyber incidents impacting availability, confidentiality, or integrity of market systems shall be reported to SEBI and CERT-In within 6 hours of detection.
2.2 Quarterly cyber audit reports by CERT-In empaneled auditors must be submitted to SEBI within 30 days from the close of each calendar quarter.

3. SUPPLY CHAIN & APPLICATION SECURITY
3.1 REs shall maintain a Software Bill of Materials (SBOM) for all algorithmic trading and client-facing internet applications.
3.2 Continuous penetration testing (VAPT) must be carried out bi-annually, with high and critical vulnerabilities remediated within 15 calendar days.

4. EFFECTIVE DATE
4.1 This framework supersedes earlier circulars on cybersecurity guidelines for stock brokers and depositories and shall take effect from January 1, 2025.`;

  const doc2Hash = crypto.createHash('sha256').update(doc2ExtractedText).digest('hex');

  const doc2 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-sebi-cscrf-2024' },
    update: {},
    create: {
      id: 'doc-sebi-cscrf-2024',
      regulatorId: regulatorsMap['SEBI'],
      sourceConnectorId: connectorsMap['SEBI Circulars & Regulatory Instructions'],
      title: '[DEMO_DATA] Cybersecurity and Cyber Resilience Framework (CSCRF) for Regulated Entities',
      documentNumber: 'DEMO-SEBI-CIR-2024-0088',
      documentType: 'CIRCULAR',
      publicationDate: new Date('2024-06-20T11:00:00Z'),
      effectiveDate: new Date('2025-01-01T00:00:00Z'),
      officialSourceUrl: 'https://www.sebi.gov.in/legal/circulars/jun-2024/cscrf.html',
      originalFileUrl: '/fixtures/sebi-cscrf-2024.pdf',
      originalFileHash: doc2Hash,
      extractedText: doc2ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'CURRENT',
      verificationStatus: 'HUMAN_REVIEWED',
      isDemo: true,
    },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc2.id },
    update: {},
    create: {
      regulatoryDocumentId: doc2.id,
      shortHeadline: 'Standardized Cyber Resilience Framework establishing graded controls, SBOM requirements, and quarterly CERT-In audits for capital market participants.',
      executiveSummary: 'SEBI has introduced the comprehensive Cybersecurity and Cyber Resilience Framework (CSCRF), replacing fragmented legacy cyber circulars. The framework introduces graded requirements for Market Infrastructure Institutions (MIIs) versus smaller brokers, mandates a 6-hour incident disclosure to SEBI and CERT-In, requires Software Bill of Materials (SBOM) tracking, and enforces bi-annual VAPT.',
      purpose: 'To strengthen cyber defense preparedness, secure capital market infrastructure against nation-state threat actors, and enforce supply chain software transparency.',
      affectedEntities: JSON.stringify(['Stock Exchanges', 'Clearing Corporations', 'Depositories', 'Stock Brokers', 'Asset Management Companies (AMCs)', 'QRTAs']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Report all cyber incidents to SEBI and CERT-In within 6 hours of discovery.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.1',
          supportingText: 'All cyber incidents impacting availability, confidentiality, or integrity of market systems shall be reported to SEBI and CERT-In within 6 hours of detection.'
        },
        {
          requirement: 'Maintain Software Bill of Materials (SBOM) for algorithmic trading and client-facing internet applications.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 3.1',
          supportingText: 'REs shall maintain a Software Bill of Materials (SBOM) for all algorithmic trading and client-facing internet applications.'
        },
        {
          requirement: 'Remediate high and critical VAPT vulnerabilities within 15 calendar days.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 3.2',
          supportingText: 'high and critical vulnerabilities remediated within 15 calendar days.'
        }
      ]),
      advisoryRecommendations: JSON.stringify([
        'Implement zero-trust network architectures across remote trader access endpoints.',
        'Participate in simulated market-wide cyber crisis drills organized by MIIs.'
      ]),
      importantDates: JSON.stringify([
        { date: '2024-06-20', meaning: 'Date of official issuance', sourceSection: 'Header' },
        { date: '2025-01-01', meaning: 'Effective compliance date for all SEBI registered entities', sourceSection: 'Section 4.1' }
      ]),
      cybersecurityImpact: JSON.stringify([
        'Mandatory SBOM for third-party trading libraries and algorithmic components.',
        'Strict 15-day remediation window for severe vulnerabilities.',
        'Continuous automated vulnerability testing.'
      ]),
      technologyImpact: JSON.stringify([
        'Integration of automated SBOM generation in CI/CD build pipelines.',
        'Hardened network segmentation between trading engines and public web frontends.'
      ]),
      operationalImpact: JSON.stringify([
        'Quarterly cyber audits executed by CERT-In empaneled external auditors.',
        'Rapid 6-hour notification coordination involving both SEBI and CERT-In.'
      ]),
      suggestedConsiderations: JSON.stringify([
        'Incorporate automated Software Bill of Materials (SBOM) scans into development toolchains.',
        'Establish direct alert webhooks to bridge SOC incident ticketing with regulatory reporting workflows.'
      ]),
      limitations: JSON.stringify([
        'Graded compliance thresholds apply depending on entity classification (Qualified vs Basic).'
      ]),
      confidence: 'HIGH',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewedBy: 'Amitabh Sen',
      reviewedAt: new Date('2024-06-25T16:00:00Z'),
      reviewStatus: 'APPROVED',
      reviewerNotes: 'Approved. Cross-referenced with CERT-In 6-hour reporting mandates.',
    },
  });

  // Link topics for doc2
  for (const tName of ['Cybersecurity', 'Incident Reporting', 'Operational Resilience', 'Third-Party Risk', 'Technology Risk']) {
    if (topicsMap[tName]) {
      await prisma.documentTopic.upsert({
        where: { regulatoryDocumentId_topicId: { regulatoryDocumentId: doc2.id, topicId: topicsMap[tName] } },
        update: {},
        create: { regulatoryDocumentId: doc2.id, topicId: topicsMap[tName], relevanceScore: 0.98 },
      });
    }
  }

  // Document 3: CERT-In Cyber Direction on Incident Reporting (Current)
  const doc3ExtractedText = `MINISTRY OF ELECTRONICS AND INFORMATION TECHNOLOGY
INDIAN COMPUTER EMERGENCY RESPONSE TEAM (CERT-In)
DIRECTION UNDER SUB-SECTION (6) OF SECTION 70B OF THE INFORMATION TECHNOLOGY ACT, 2000

SUBJECT: DIRECTIONS RELATING TO INFORMATION SECURITY PRACTICES, PROCEDURE, PREVENTION, DETECTION, RESPONSE AND REPORTING OF CYBER INCIDENTS

1. MANDATORY REPORTING OF CYBER INCIDENTS
1.1 Any service provider, intermediary, data centre, body corporate and government organisation shall report cyber incidents of the specified 20 categories to CERT-In within 6 hours of noticing such incidents or being brought to notice about such incidents.
1.2 The incidents shall be reported to CERT-In via email (incident@cert-in.org.in), telephone, or web portal.

2. SYNCHRONISATION OF SYSTEM CLOCKS
2.1 All service providers, intermediaries, and bodies corporate shall connect to the Network Time Protocol (NTP) servers of National Physical Laboratory (NPL) or National Informatics Centre (NIC) or servers synchronized thereto.
2.2 System clocks across all enterprise servers, firewalls, and cloud instances must be strictly synchronized to Indian Standard Time (IST).

3. LOG RETENTION MANDATE
3.1 All service providers, intermediaries, and bodies corporate shall securely maintain logs of all their ICT systems for a rolling duration of 180 calendar days.
3.2 Such logs shall be maintained within the Indian jurisdiction and provided to CERT-In upon lawful requisition.

4. VIRTUAL PRIVATE NETWORK (VPN) & CLOUD LOGGING
4.1 Data centres, virtual private server (VPS) providers, and cloud service providers shall maintain verified subscriber information for a period of 5 years.`;

  const doc3Hash = crypto.createHash('sha256').update(doc3ExtractedText).digest('hex');

  const doc3 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-certin-reporting-2022' },
    update: {},
    create: {
      id: 'doc-certin-reporting-2022',
      regulatorId: regulatorsMap['CERT-In'],
      sourceConnectorId: connectorsMap['CERT-In Security Advisories & Vulnerability Feed'],
      title: '[DEMO_DATA] CERT-In Cyber Incident Reporting and System Clock Synchronisation Directions',
      documentNumber: 'DEMO-CERTIN-DIR-2022-70B',
      documentType: 'ORDER',
      publicationDate: new Date('2022-04-28T09:00:00Z'),
      effectiveDate: new Date('2022-06-28T00:00:00Z'),
      officialSourceUrl: 'https://www.cert-in.org.in/directions2022.html',
      originalFileUrl: '/fixtures/certin-directions-2022.pdf',
      originalFileHash: doc3Hash,
      extractedText: doc3ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'CURRENT',
      verificationStatus: 'VERIFIED',
      isDemo: true,
    },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc3.id },
    update: {},
    create: {
      regulatoryDocumentId: doc3.id,
      shortHeadline: 'National cybersecurity direction mandating 6-hour incident disclosure, 180-day domestic log retention, and NTP clock synchronization with NPL/NIC.',
      executiveSummary: 'Issued under Section 70B of the IT Act, these binding directions require all Indian corporate entities, cloud providers, and intermediaries to report cyber incidents from 20 specified categories to CERT-In within 6 hours. The directions additionally mandate NTP clock synchronization with official Indian time servers (NPL/NIC) and enforce domestic log retention for 180 days.',
      purpose: 'To ensure rapid situational awareness during cyber attacks, facilitate coordinated national defense, and establish forensic non-repudiation.',
      affectedEntities: JSON.stringify(['All Indian Corporate Entities', 'Intermediaries', 'Cloud Service Providers', 'Data Centres', 'VPN Providers']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Report cyber incidents from 20 specified categories to CERT-In within 6 hours of discovery.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 1.1',
          supportingText: 'shall report cyber incidents of the specified 20 categories to CERT-In within 6 hours of noticing such incidents'
        },
        {
          requirement: 'Synchronize ICT system clocks with NTP servers of NPL or NIC to IST.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.1',
          supportingText: 'connect to the Network Time Protocol (NTP) servers of National Physical Laboratory (NPL) or National Informatics Centre (NIC)'
        },
        {
          requirement: 'Retain all ICT system logs within Indian jurisdiction for 180 calendar days.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 3.1 & 3.2',
          supportingText: 'securely maintain logs of all their ICT systems for a rolling duration of 180 calendar days... within the Indian jurisdiction'
        }
      ]),
      advisoryRecommendations: JSON.stringify([
        'Pre-configure automated log shipping to tamper-proof WORM storage within Indian data centres.',
        'Maintain incident reporting templates pre-formatted according to CERT-In incident intake forms.'
      ]),
      importantDates: JSON.stringify([
        { date: '2022-04-28', meaning: 'Date of enactment under Section 70B', sourceSection: 'Header' },
        { date: '2022-06-28', meaning: 'Enforcement and compliance commencement date', sourceSection: 'Section 4' }
      ]),
      cybersecurityImpact: JSON.stringify([
        'Strict 6-hour disclosure SLA to CERT-In.',
        '180-day secure log archive requirement for forensic readiness.',
        'Mandatory coverage of ransomware, data leaks, and identity compromise.'
      ]),
      technologyImpact: JSON.stringify([
        'Configuring enterprise DNS/firewalls to sync NTP with NPL/NIC.',
        'Scaling centralized log analytics storage to retain 180 days of activity.'
      ]),
      operationalImpact: JSON.stringify([
        'Continuous on-call security duty to fulfill 6-hour notification deadlines.',
        'Standard Operating Procedures for log preservation under lawful notice.'
      ]),
      suggestedConsiderations: JSON.stringify([
        'Verify that all cloud and microservice containers inherit synchronized NTP time.',
        'Audit cold-storage log retention policies to ensure they do not delete data before 180 days.'
      ]),
      limitations: JSON.stringify([
        'Covers all corporate entities operating in India, regardless of financial sector status.'
      ]),
      confidence: 'HIGH',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewedBy: 'Amitabh Sen',
      reviewedAt: new Date('2024-02-10T10:00:00Z'),
      reviewStatus: 'APPROVED',
      reviewerNotes: 'Binding national direction. Citations validated.',
    },
  });

  // Link topics for doc3
  for (const tName of ['Incident Reporting', 'Cybersecurity', 'Cloud', 'Data Protection']) {
    if (topicsMap[tName]) {
      await prisma.documentTopic.upsert({
        where: { regulatoryDocumentId_topicId: { regulatoryDocumentId: doc3.id, topicId: topicsMap[tName] } },
        update: {},
        create: { regulatoryDocumentId: doc3.id, topicId: topicsMap[tName], relevanceScore: 1.0 },
      });
    }
  }

  // Document 4: NPCI Circular on Tokenisation and Third-Party Risk in UPI (Current, Pending Review for Reviewer Workbench)
  const doc4ExtractedText = `NATIONAL PAYMENTS CORPORATION OF INDIA
CIRCULAR REF: NPCI/UPI/2024-25/042

TO: ALL UPI MEMBER BANKS, PAYMENT SERVICE PROVIDERS (PSPs), AND THIRD-PARTY APPLICATION PROVIDERS (TPAPs)

SUBJECT: ENHANCED RISK MANAGEMENT AND MULTI-FACTOR AUTHENTICATION FOR HIGH-VALUE UPI TRANSACTIONS

1. CONTEXT & OBJECTIVE
1.1 With exponential growth in digital payments, NPCI issues this directive to reinforce technical security controls across the UPI participant ecosystem.

2. MANDATORY RISK CONTROLS
2.1 TPAPs and PSP Banks shall implement biometric device-binding and hardware-backed keystore integration for all registered UPI handles.
2.2 Transactions exceeding INR 100,000 shall be subject to dynamic risk scoring and velocity checks before dispatching debit requests to switch.
2.3 Any security breach involving customer credentials or unauthorized transactional spoofing must be reported to NPCI SOC within 2 hours of detection.

3. EFFECTIVE DATE
3.1 All member entities must implement these technical requirements no later than November 30, 2024.`;

  const doc4Hash = crypto.createHash('sha256').update(doc4ExtractedText).digest('hex');

  const doc4 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-npci-upi-risk-2024' },
    update: {},
    create: {
      id: 'doc-npci-upi-risk-2024',
      regulatorId: regulatorsMap['NPCI'],
      sourceConnectorId: connectorsMap['NPCI UPI & Payment Security Circulars'],
      title: '[DEMO_DATA] Enhanced Risk Management and Device-Binding for High-Value UPI Transactions',
      documentNumber: 'DEMO-NPCI-UPI-2024-25-042',
      documentType: 'CIRCULAR',
      publicationDate: new Date('2024-08-14T12:00:00Z'),
      effectiveDate: new Date('2024-11-30T00:00:00Z'),
      officialSourceUrl: 'https://www.npci.org.in/circulars/upi-security-2024.html',
      originalFileUrl: '/fixtures/npci-upi-risk-2024.pdf',
      originalFileHash: doc4Hash,
      extractedText: doc4ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'NEW',
      verificationStatus: 'PENDING_REVIEW', // Queued for Reviewer Workbench testing!
      isDemo: true,
    },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc4.id },
    update: {},
    create: {
      regulatoryDocumentId: doc4.id,
      shortHeadline: 'NPCI mandates hardware device-binding, automated velocity checks on transactions over INR 1 Lakh, and 2-hour breach reporting for UPI apps.',
      executiveSummary: 'NPCI requires all member banks and third-party application providers (TPAPs) to implement biometric device-binding and dynamic risk evaluation for transactions exceeding INR 100,000. Security breaches must be reported to NPCI SOC within 2 hours.',
      purpose: 'To mitigate rising transactional fraud and unauthorized handle hijacking across the UPI payment ecosystem.',
      affectedEntities: JSON.stringify(['UPI Member Banks', 'Payment Service Providers (PSPs)', 'Third-Party Application Providers (TPAPs)']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Implement biometric device-binding and hardware-backed keystore integration for UPI mobile applications.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.1',
          supportingText: 'TPAPs and PSP Banks shall implement biometric device-binding and hardware-backed keystore integration'
        },
        {
          requirement: 'Apply dynamic risk scoring and velocity checks on transactions exceeding INR 100,000.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.2',
          supportingText: 'Transactions exceeding INR 100,000 shall be subject to dynamic risk scoring and velocity checks'
        },
        {
          requirement: 'Report customer credential breaches to NPCI SOC within 2 hours.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.3',
          supportingText: 'must be reported to NPCI SOC within 2 hours of detection'
        }
      ]),
      advisoryRecommendations: JSON.stringify([
        'Adopt behavioral biometrics to detect remote-access app overlays during payment PIN entry.'
      ]),
      importantDates: JSON.stringify([
        { date: '2024-08-14', meaning: 'Circular publication date', sourceSection: 'Header' },
        { date: '2024-11-30', meaning: 'Strict technical implementation deadline', sourceSection: 'Section 3.1' }
      ]),
      cybersecurityImpact: JSON.stringify([
        'Hardware keystore integration prevents software cloning of authentication tokens.',
        'Urgent 2-hour breach reporting window to NPCI SOC.'
      ]),
      technologyImpact: JSON.stringify([
        'Mobile SDK updates to incorporate secure enclave and Android Keystore APIs.',
        'Real-time fraud scoring engine deployment before switch forwarding.'
      ]),
      operationalImpact: JSON.stringify([
        'Customer support escalation playbooks for flagged high-velocity transactions.',
        'Coordination with partner banks for joint fraud telemetry.'
      ]),
      suggestedConsiderations: JSON.stringify([
        'Evaluate impact on user checkout latency when integrating real-time risk scoring modules.'
      ]),
      limitations: JSON.stringify([
        'Applies specifically to UPI rails; does not cover IMPS or AePS channels directly.'
      ]),
      confidence: 'MEDIUM',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewStatus: 'PENDING',
    },
  });

  // Link topics for doc4
  for (const tName of ['Digital Payments', 'Cybersecurity', 'Third-Party Risk', 'Incident Reporting']) {
    if (topicsMap[tName]) {
      await prisma.documentTopic.upsert({
        where: { regulatoryDocumentId_topicId: { regulatoryDocumentId: doc4.id, topicId: topicsMap[tName] } },
        update: {},
        create: { regulatoryDocumentId: doc4.id, topicId: topicsMap[tName], relevanceScore: 0.99 },
      });
    }
  }

  // Document 5: IRDAI Cyber Security Guidelines (Current, AI_GENERATED for Reviewer Testing)
  const doc5ExtractedText = `INSURANCE REGULATORY AND DEVELOPMENT AUTHORITY OF INDIA
GUIDELINES ON INFORMATION AND CYBER SECURITY FOR INSURERS
REF: IRDAI/IT/GDL/2023/15

1. APPLICABILITY
These guidelines apply to all direct insurers, reinsurers, and insurance intermediaries operating within India.

2. CHIEF INFORMATION SECURITY OFFICER (CISO) & CRISIS MANAGEMENT
2.1 An insurer shall designate an independent CISO who shall head the Information Security team.
2.2 The insurer shall constitute a Cyber Crisis Management Plan (CCMP) to handle major cyber disruptions.
2.3 Cyber insurance underwriting guidelines must mandate baseline cyber health assessments of corporate policyholders.

3. ANNUAL CYBER AUDIT
3.1 An annual cyber security audit shall be conducted by an external CERT-In empaneled auditing firm.
3.2 The audit report along with compliance status shall be submitted to IRDAI within 90 days of the financial year close.`;

  const doc5Hash = crypto.createHash('sha256').update(doc5ExtractedText).digest('hex');

  const doc5 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-irdai-cyber-2023' },
    update: {},
    create: {
      id: 'doc-irdai-cyber-2023',
      regulatorId: regulatorsMap['IRDAI'],
      sourceConnectorId: connectorsMap['IRDAI Cyber Security & IT Circulars'],
      title: '[DEMO_DATA] Guidelines on Information and Cyber Security for Insurers and Intermediaries',
      documentNumber: 'DEMO-IRDAI-IT-GDL-2023-15',
      documentType: 'GUIDELINE',
      publicationDate: new Date('2023-04-18T10:00:00Z'),
      effectiveDate: new Date('2023-07-01T00:00:00Z'),
      officialSourceUrl: 'https://irdai.gov.in/guidelines/cyber-security-2023.html',
      originalFileUrl: '/fixtures/irdai-cyber-2023.pdf',
      originalFileHash: doc5Hash,
      extractedText: doc5ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'CURRENT',
      verificationStatus: 'AI_GENERATED', // Fresh AI generated document for reviewer workbench testing
      isDemo: true,
    },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc5.id },
    update: {},
    create: {
      regulatoryDocumentId: doc5.id,
      shortHeadline: 'IRDAI mandates independent CISO, Cyber Crisis Management Plan, and annual CERT-In external audit for all insurance entities.',
      executiveSummary: 'IRDAI has instituted standardized information and cybersecurity guidelines requiring all insurers, reinsurers, and insurance brokers to appoint an independent CISO, formulate a formal Cyber Crisis Management Plan (CCMP), and undergo annual external cyber audits by CERT-In empaneled security auditors.',
      purpose: 'To safeguard policyholder confidential health and financial records and protect the Indian insurance sector from destructive cyber incursions.',
      affectedEntities: JSON.stringify(['Life Insurers', 'General Insurers', 'Health Insurers', 'Reinsurers', 'Insurance Brokers']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Designate an independent CISO heading the Information Security department.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 2.1',
          supportingText: 'An insurer shall designate an independent CISO who shall head the Information Security team.'
        },
        {
          requirement: 'Submit annual CERT-In empaneled cyber audit reports to IRDAI within 90 days of fiscal close.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Section 3.2',
          supportingText: 'The audit report along with compliance status shall be submitted to IRDAI within 90 days of the financial year close.'
        }
      ]),
      advisoryRecommendations: JSON.stringify([
        'Incorporate cyber hygiene criteria into underwriting evaluations for corporate cyber risk policies.'
      ]),
      importantDates: JSON.stringify([
        { date: '2023-04-18', meaning: 'Guideline issuance date', sourceSection: 'Header' },
        { date: '2023-07-01', meaning: 'Formal enforcement date', sourceSection: 'Section 1' }
      ]),
      cybersecurityImpact: JSON.stringify([
        'Mandatory formulation of Cyber Crisis Management Plan (CCMP).',
        'Independent CISO oversight.'
      ]),
      technologyImpact: JSON.stringify([
        'Data encryption for sensitive policyholder personal records at rest and in transit.'
      ]),
      operationalImpact: JSON.stringify([
        'Engagement of CERT-In empaneled auditing firm for annual independent evaluations.'
      ]),
      suggestedConsiderations: JSON.stringify([
        'Verify whether current internal audit schedules align with the 90-day post-fiscal submission requirement.'
      ]),
      limitations: JSON.stringify([
        'Exclusive to insurance domain entities regulated under the Insurance Act, 1938.'
      ]),
      confidence: 'HIGH',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewStatus: 'PENDING',
    },
  });

  // Link topics for doc5
  for (const tName of ['Cybersecurity', 'IT Governance', 'Business Continuity', 'Operational Resilience']) {
    if (topicsMap[tName]) {
      await prisma.documentTopic.upsert({
        where: { regulatoryDocumentId_topicId: { regulatoryDocumentId: doc5.id, topicId: topicsMap[tName] } },
        update: {},
        create: { regulatoryDocumentId: doc5.id, topicId: topicsMap[tName], relevanceScore: 0.92 },
      });
    }
  }

  // Document 6: Superseded Document Example (RBI Legacy Circular)
  const doc6ExtractedText = `RESERVE BANK OF INDIA
CIRCULAR DBOD.NO.BP.40/21.04.158/2006-07
GUIDELINES ON MANAGING RISKS AND CODE OF CONDUCT IN OUTSOURCING OF FINANCIAL SERVICES BY BANKS
[SUPERSEDED BY MASTER DIRECTION ON IT GOVERNANCE AND OUTSOURCING 2024]

Banks are advised that outsourcing of financial services must conform to the 2006 guidelines. Note: This circular has been completely superseded by newer Master Directions.`;

  const doc6 = await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-rbi-outsourcing-2006' },
    update: {},
    create: {
      id: 'doc-rbi-outsourcing-2006',
      regulatorId: regulatorsMap['RBI'],
      sourceConnectorId: connectorsMap['RBI Notifications & Master Directions Feed'],
      title: '[DEMO_DATA] (SUPERSEDED) Guidelines on Managing Risks in Outsourcing of Financial Services by Banks',
      documentNumber: 'DEMO-RBI-2006-07-40',
      documentType: 'CIRCULAR',
      publicationDate: new Date('2006-11-03T10:00:00Z'),
      effectiveDate: new Date('2006-11-03T00:00:00Z'),
      officialSourceUrl: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=3148',
      originalFileUrl: '/fixtures/rbi-outsourcing-2006.pdf',
      originalFileHash: crypto.createHash('sha256').update(doc6ExtractedText).digest('hex'),
      extractedText: doc6ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'SUPERSEDED',
      verificationStatus: 'HUMAN_REVIEWED',
      supersedesDocumentId: null,
      isDemo: true,
    },
  });

  // Mark doc1 as superseding doc6
  await prisma.regulatoryDocument.update({
    where: { id: doc1.id },
    data: { supersedesDocumentId: doc6.id },
  });

  await prisma.regulatorySummary.upsert({
    where: { regulatoryDocumentId: doc6.id },
    update: {},
    create: {
      regulatoryDocumentId: doc6.id,
      shortHeadline: 'HISTORICAL/SUPERSEDED: 2006 legacy banking outsourcing guidelines superseded by recent RBI Master Directions.',
      executiveSummary: 'This circular outlined foundational outsourcing rules in 2006 but has now been formally superseded by modern comprehensive IT Governance and Outsourcing Master Directions.',
      purpose: 'Historical reference for legacy outsourcing contracts.',
      affectedEntities: JSON.stringify(['Commercial Banks']),
      keyRequirements: JSON.stringify([
        {
          requirement: 'Historical provision: Core management functions cannot be outsourced.',
          mandatoryOrAdvisory: 'MANDATORY',
          sourceSection: 'Paragraph 3',
          supportingText: 'Core management functions cannot be outsourced.'
        }
      ]),
      advisoryRecommendations: JSON.stringify(['Refer to modern 2024 Master Direction for active compliance.']),
      importantDates: JSON.stringify([{ date: '2006-11-03', meaning: 'Issued date', sourceSection: 'Header' }]),
      cybersecurityImpact: JSON.stringify(['Legacy baseline']),
      technologyImpact: JSON.stringify(['Legacy baseline']),
      operationalImpact: JSON.stringify(['Transited to 2024 Master Direction']),
      suggestedConsiderations: JSON.stringify(['Do not rely on this circular for active compliance; refer to 2024 Master Direction.']),
      limitations: JSON.stringify(['DOCUMENT SUPERSEDED - Inactive']),
      confidence: 'HIGH',
      modelName: 'local-rule-grounded',
      promptVersion: 'v1.0.0',
      reviewStatus: 'APPROVED',
    },
  });

  // Document 7: Withdrawn Advisory Example (SEBI Withdrawn Advisory)
  const doc7ExtractedText = `SECURITIES AND EXCHANGE BOARD OF INDIA
ADVISORY REF: SEBI/MRD/ADV/2021/04
ADVISORY ON LEGACY FIX TRADING PROTOCOL INTERFACES
[WITHDRAWN PURSUANT TO CIRCULAR SEBI/HO/MIRSD/2023/12]

This advisory regarding legacy FIX trading protocols has been formally withdrawn and revoked by the Securities and Exchange Board of India.`;

  await prisma.regulatoryDocument.upsert({
    where: { id: 'doc-sebi-legacy-withdrawn' },
    update: {},
    create: {
      id: 'doc-sebi-legacy-withdrawn',
      regulatorId: regulatorsMap['SEBI'],
      sourceConnectorId: connectorsMap['SEBI Circulars & Regulatory Instructions'],
      title: '[DEMO_DATA] (WITHDRAWN) Advisory on Legacy FIX Trading Protocol Interfaces',
      documentNumber: 'DEMO-SEBI-ADV-2021-04',
      documentType: 'ADVISORY',
      publicationDate: new Date('2021-05-12T10:00:00Z'),
      withdrawnDate: new Date('2023-08-01T00:00:00Z'),
      officialSourceUrl: 'https://www.sebi.gov.in/legal/advisories/withdrawn-2021-04.html',
      originalFileUrl: '/fixtures/sebi-withdrawn-2021.pdf',
      originalFileHash: crypto.createHash('sha256').update(doc7ExtractedText).digest('hex'),
      extractedText: doc7ExtractedText,
      extractionStatus: 'EXTRACTED',
      ingestionStatus: 'PROCESSED',
      currentStatus: 'WITHDRAWN',
      verificationStatus: 'HUMAN_REVIEWED',
      isDemo: true,
    },
  });

  // 6. Seed User Watchlist & Bookmarks for Verification
  const analystId = usersMap['analyst@bank.in'];
  if (analystId) {
    const existingWatchlist = await prisma.watchlist.findFirst({
      where: { userId: analystId, name: 'Banking Technology & Cybersecurity Watchlist' },
    });
    if (!existingWatchlist) {
      await prisma.watchlist.create({
        data: {
          userId: analystId,
          name: 'Banking Technology & Cybersecurity Watchlist',
          regulatorFilters: JSON.stringify(['RBI', 'CERT-In']),
          topicFilters: JSON.stringify(['Cybersecurity', 'Cloud', 'Incident Reporting', 'IT Governance']),
          entityTypeFilters: JSON.stringify(['Scheduled Commercial Banks', 'Payment System Operators']),
          frequency: 'DAILY',
          active: true,
        },
      });
    }

    await prisma.bookmark.upsert({
      where: {
        userId_regulatoryDocumentId: {
          userId: analystId,
          regulatoryDocumentId: doc1.id,
        },
      },
      update: {},
      create: {
        userId: analystId,
        regulatoryDocumentId: doc1.id,
      },
    });

    const existingSearch = await prisma.savedSearch.findFirst({
      where: { userId: analystId, name: 'Cloud and Incident Reporting Directions' },
    });
    if (!existingSearch) {
      await prisma.savedSearch.create({
        data: {
          userId: analystId,
          name: 'Cloud and Incident Reporting Directions',
          query: 'incident reporting 6 hours cloud data',
          filters: JSON.stringify({ regulators: ['RBI', 'CERT-In'], topics: ['Incident Reporting', 'Cloud'] }),
        },
      });
    }
  }

  // 7. Seed Initial Ingestion Jobs for Telemetry if empty
  const existingJobCount = await prisma.ingestionJob.count();
  if (existingJobCount === 0) {
    for (const c of connectorsData) {
      const connId = connectorsMap[c.sourceName];
      if (connId) {
        await prisma.ingestionJob.create({
          data: {
            sourceConnectorId: connId,
            jobType: 'POLL',
            status: 'COMPLETED',
            completedAt: new Date(),
            documentsFound: 12,
            documentsCreated: 3,
            documentsUpdated: 0,
            retryCount: 0,
          },
        });
      }
    }

    // Add one failed job for Admin dashboard testing
    const npciConnId = connectorsMap['NPCI UPI & Payment Security Circulars'];
    if (npciConnId) {
      await prisma.ingestionJob.create({
        data: {
          sourceConnectorId: npciConnId,
          jobType: 'POLL',
          status: 'FAILED',
          completedAt: new Date(),
          documentsFound: 0,
          documentsCreated: 0,
          documentsUpdated: 0,
          retryCount: 3,
          errorMessage: 'ETIMEDOUT: Connection to remote portal timed out after 30000ms. Retry threshold exceeded.',
        },
      });
    }
  }

  // 8. Seed Audit Log entries if empty
  const existingAuditCount = await prisma.auditLog.count();
  if (existingAuditCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          userId: usersMap['admin@regintel.in'],
          action: 'SYSTEM_INITIALIZATION',
          resourceType: 'System',
          resourceId: 'INIT-001',
          details: JSON.stringify({ message: 'Regulatory Intelligence Hub India initialized with 5 regulators and 12 topics.' }),
        },
        {
          userId: usersMap['reviewer@finreg.gov.in'],
          action: 'REVIEW_APPROVE',
          resourceType: 'RegulatoryDocument',
          resourceId: doc1.id,
          details: JSON.stringify({ previousStatus: 'AI_GENERATED', newStatus: 'HUMAN_REVIEWED', notes: 'Approved after verifying citations.' }),
        },
      ],
    });
  }

  console.log('✓ Seeding complete with high fidelity test records!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
