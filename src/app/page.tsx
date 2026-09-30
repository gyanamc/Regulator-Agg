import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import RegulatoryCard from '@/components/RegulatoryCard';
import { 
  ShieldCheck, 
  Search, 
  MessageSquareText, 
  ArrowRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sparkles,
  Mail,
  ShieldAlert
} from 'lucide-react';

export const revalidate = 0; // Fresh load on request

export default async function HomePage() {
  const [documents, regulators, topics, lastJob] = await Promise.all([
    prisma.regulatoryDocument.findMany({
      include: {
        regulator: true,
        summary: true,
        documentTopics: { include: { topic: true } },
      },
      orderBy: { publicationDate: 'desc' },
      take: 6,
    }),
    prisma.regulator.findMany({
      include: {
        _count: { select: { documents: true } },
      },
    }),
    prisma.topic.findMany({
      include: {
        _count: { select: { documentTopics: true } },
      },
    }),
    prisma.ingestionJob.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
    }),
  ]);

  const hasDemo = documents.some((d) => d.isDemo);
  const lastRefreshStr = lastJob?.completedAt
    ? new Date(lastJob.completedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recently';

  return (
    <div className="space-y-12 pb-16">
      {/* Local Fixture Demo Alert Banner */}
      {hasDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center space-x-2 w-full">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Local Development Fixture Mode:</strong> Displaying certified regulatory test fixtures clearly labelled with <code className="bg-amber-100 px-1 py-0.2 rounded font-mono">[DEMO_DATA]</code> for safe local simulation.
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-navy-700">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-700/60 border border-navy-600 text-xs text-blue-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Multi-Regulator Information & Compliance Research Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Institutional Regulatory Intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              For Indian Regulated Entities
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Continuous ingestion of publications from <strong>RBI</strong>, <strong>SEBI</strong>, <strong>CERT-In</strong>, <strong>NPCI</strong>, and <strong>IRDAI</strong>. Structured summaries, section-grounded citations, and conversational regulatory research.
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form action="/search" method="GET" className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white text-slate-900 border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500">
              <Search className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search by topic, keyword, or circular number (e.g. CERT-In 6 hours, CSCRF, RBI IT Gov)..."
                className="w-full py-3.5 px-3 text-sm focus:outline-none"
                aria-label="Global Regulatory Search"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3.5 mr-1 rounded-lg transition-colors flex items-center space-x-1"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4 text-xs text-slate-300">
            <Link
              href="/assistant"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:opacity-95 transition-opacity"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>Ask Grounded Assistant</span>
            </Link>

            <Link
              href="/updates"
              className="inline-flex items-center space-x-1.5 bg-navy-700/80 hover:bg-navy-700 text-slate-200 px-4 py-2 rounded-lg border border-navy-600 transition-colors"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center space-x-1.5 text-slate-400 ml-2">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Last source refresh: {lastRefreshStr}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Monitored Regulators Strip */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Monitored Indian Regulators</h2>
              <p className="text-xs text-slate-500">Official primary regulatory publication portals continuously tracked</p>
            </div>
            <Link href="/admin" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <span>Connector Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {regulators.map((reg) => (
              <div key={reg.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{reg.shortName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium line-clamp-1">{reg.name}</div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{reg._count.documents} publications</span>
                  <a href={reg.officialWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Regulatory Developments Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Latest Regulatory Developments</h2>
              <p className="text-xs text-slate-500">Recently indexed circulars, master directions, and advisories</p>
            </div>
            <Link
              href="/updates"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All Circulars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <RegulatoryCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                documentNumber={doc.documentNumber}
                documentType={doc.documentType}
                publicationDate={doc.publicationDate.toISOString()}
                effectiveDate={doc.effectiveDate ? doc.effectiveDate.toISOString() : null}
                officialSourceUrl={doc.officialSourceUrl}
                currentStatus={doc.currentStatus}
                verificationStatus={doc.verificationStatus}
                isDemo={doc.isDemo}
                regulator={{
                  shortName: doc.regulator.shortName,
                  name: doc.regulator.name,
                }}
                topics={doc.documentTopics.map((dt) => dt.topic.name)}
                summary={
                  doc.summary
                    ? {
                        shortHeadline: doc.summary.shortHeadline,
                        executiveSummary: doc.summary.executiveSummary,
                        confidence: doc.summary.confidence,
                      }
                    : null
                }
              />
            ))}
          </div>
        </section>

        {/* Priority Topics Section */}
        <section className="bg-slate-100/70 p-6 rounded-2xl border border-slate-200">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Regulatory Topics & Risk Domains</h2>
            <p className="text-xs text-slate-500">Filter regulatory mandates by technology risk, cyber defense, and operational resilience</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/updates?topic=${encodeURIComponent(t.name)}`}
                className="bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-700">
                  {t.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {t._count.documentTopics} documents
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Three Content Layers Architecture Explainer */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl font-bold text-slate-900">Three-Layer Content Separation Principle</h2>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed deterministic traceability: AI-generated summaries and suggested considerations are always separated from official authoritative text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Layer 1</span>
              <h3 className="font-bold text-slate-900 text-sm">Original Official Artifact</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Raw official PDF/HTML collected from official government portals. Stored immutably with SHA-256 cryptographic fingerprints.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Layer 2</span>
              <h3 className="font-bold text-slate-900 text-sm">Authoritative Extracted Text</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Normalized plain text segmented into exact sections and paragraphs. Primary ground truth for search indexing and passage retrieval.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Layer 3</span>
              <h3 className="font-bold text-slate-900 text-sm">AI Interpretation & Citations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform-generated executive summaries, mandatory obligations, and operational impacts with verifiable citations linking back to Layer 2.
              </p>
            </div>
          </div>
        </section>

        {/* Email Digest Simulation Box */}
        <section className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl p-8 border border-navy-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold">
              <Mail className="w-4 h-4" />
              <span>Personalized Watchlist Digests</span>
            </div>
            <h3 className="text-xl font-bold text-white">Subscribe to Daily Regulatory Updates</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Configure customized filters by regulator (e.g. RBI, CERT-In) and risk domain (e.g. Cloud, Cybersecurity) to receive simulated email intelligence digests.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/watchlists"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3 rounded-lg shadow-sm transition-colors"
            >
              <span>Build Custom Watchlist</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
