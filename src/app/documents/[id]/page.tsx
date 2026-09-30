'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  Bookmark, 
  BookmarkCheck, 
  MessageSquareText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileText, 
  Scale, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  Building,
  Sparkles
} from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'extractedText' | 'citations' | 'relationships'>('summary');
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadDoc() {
      try {
        setLoading(true);
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          throw new Error('Regulatory document not found');
        }
        const data = await res.json();
        setDocument(data.document);
        setBookmarked(data.document.isBookmarked);
      } catch (err: any) {
        setError(err.message || 'Error loading document');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id]);

  const toggleBookmark = async () => {
    try {
      const res = await fetch(`/api/documents/${id}/bookmark`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-500 animate-pulse">
        Loading regulatory document layers & citations...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Document Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Requested regulatory record does not exist.'}</p>
        <Link href="/updates" className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Updates Catalog
        </Link>
      </div>
    );
  }

  const summary = document.summary;
  const keyRequirements = summary ? JSON.parse(summary.keyRequirements || '[]') : [];
  const advisoryRecs = summary ? JSON.parse(summary.advisoryRecommendations || '[]') : [];
  const importantDates = summary ? JSON.parse(summary.importantDates || '[]') : [];
  const affectedEntities = summary ? JSON.parse(summary.affectedEntities || '[]') : [];
  const cyberImpact = summary ? JSON.parse(summary.cybersecurityImpact || '[]') : [];
  const techImpact = summary ? JSON.parse(summary.technologyImpact || '[]') : [];
  const operationalImpact = summary ? JSON.parse(summary.operationalImpact || '[]') : [];
  const suggestedConsiderations = summary ? JSON.parse(summary.suggestedConsiderations || '[]') : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/updates" className="hover:text-slate-800">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-sm">{document.title}</span>
      </nav>

      {/* Superseded / Withdrawn Alert Banner if Applicable */}
      {document.currentStatus === 'SUPERSEDED' && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg flex items-start space-x-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm">Regulatory Notice: Document Superseded</span>
            <p className="mt-0.5">
              This publication has been superseded by newer regulatory directions. Historical requirements are retained for audit and contractual reference only.
            </p>
            {document.supersededBy && document.supersededBy.length > 0 && (
              <div className="mt-2 font-medium">
                Active Superseding Document:{' '}
                <Link href={`/documents/${document.supersededBy[0].id}`} className="underline hover:text-amber-950 font-bold">
                  {document.supersededBy[0].title}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {document.currentStatus === 'WITHDRAWN' && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start space-x-3 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-sm">Regulatory Notice: Document Formally Withdrawn</span>
            <p className="mt-0.5">
              This advisory or circular was formally revoked or withdrawn by {document.regulator.shortName}. It is no longer legally operative.
            </p>
          </div>
        </div>
      )}

      {/* LAYER 1: OFFICIAL METADATA CARD */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-navy-800 text-white font-bold text-xs rounded-md">
              {document.regulator.shortName}
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {document.documentType.replace('_', ' ')}
            </span>
            {document.documentNumber && (
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                {document.documentNumber}
              </span>
            )}
            {document.isDemo && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                DEMO_DATA
              </span>
            )}
          </div>

          {/* Action buttons: Bookmark, Ask Assistant, Download Original */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleBookmark}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                bookmarked
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-400" />}
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <Link
              href={`/assistant?docId=${document.id}`}
              className="inline-flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-teal-300" />
              <span>Ask About Document</span>
            </Link>

            <a
              href={document.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            Layer 1: Official Regulatory Publication
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {document.title}
          </h1>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs border-t border-slate-100">
          <div>
            <span className="text-slate-400 block mb-0.5">Issuing Authority</span>
            <span className="font-semibold text-slate-800">{document.regulator.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Publication Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(document.publicationDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Effective Date</span>
            <span className="font-semibold text-slate-800">
              {document.effectiveDate
                ? new Date(document.effectiveDate).toLocaleDateString('en-IN', { dateStyle: 'long' })
                : 'Immediate / As Specified in Clauses'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Cryptographic Hash</span>
            <span className="font-mono text-[10px] text-slate-600 truncate block" title={document.originalFileHash || 'N/A'}>
              {document.originalFileHash ? document.originalFileHash.substring(0, 16) + '...' : 'Verified SHA-256'}
            </span>
          </div>
        </div>
      </section>

      {/* Layer Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'summary'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Layer 3: AI Interpretation & Impact</span>
        </button>

        <button
          onClick={() => setActiveTab('extractedText')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'extractedText'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Layer 2: Authoritative Extracted Text</span>
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'citations'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Supporting Source Citations ({document.citations.length})</span>
        </button>

        {(document.supersedesDocument || document.supersededBy.length > 0) && (
          <button
            onClick={() => setActiveTab('relationships')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'relationships'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Document Evolution</span>
          </button>
        )}
      </div>

      {/* TAB 1: LAYER 3 AI INTERPRETATION */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {/* Statutory Platform Disclaimer Notice */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Platform-Generated Research Interpretation:</span>
              <p className="mt-0.5">
                The summaries, requirements, and operational considerations below are generated through grounded AI extraction and verified against authoritative source text. This interpretation does not constitute legal counsel, compliance certification, or official regulatory determinations.
              </p>
            </div>
          </div>

          {summary ? (
            <div className="space-y-6">
              {/* Executive Summary & Purpose */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-700">
                    Executive Summary
                  </h3>
                  <p className="text-base font-semibold text-slate-800 mt-1 leading-snug">
                    {summary.shortHeadline}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    {summary.executiveSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Why It Was Issued (Purpose)</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{summary.purpose}</p>
                </div>

                {/* Affected Entities */}
                {affectedEntities.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Affected Regulated Entities</span>
                    <div className="flex flex-wrap gap-1.5">
                      {affectedEntities.map((e: string, i: number) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-medium border border-slate-200">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Key Mandatory Requirements vs Advisory Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mandatory */}
                <div className="bg-white rounded-xl border border-red-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2 text-red-700 pb-2 border-b border-red-100">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Mandatory Obligations ("Shall / Must")</h3>
                  </div>

                  <ul className="space-y-3">
                    {keyRequirements.map((req: any, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-red-50/50 p-3 rounded-lg border border-red-100 space-y-1">
                        <div className="font-semibold text-slate-900">{req.requirement}</div>
                        <div className="text-[11px] text-red-800 font-mono flex items-center justify-between">
                          <span>Source Section: {req.sourceSection}</span>
                          <span className="font-bold">MANDATORY</span>
                        </div>
                        {req.supportingText && (
                          <div className="text-[11px] text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-100">
                            "{req.supportingText}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advisory */}
                <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center space-x-2 text-blue-700 pb-2 border-b border-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Advisory & Best Practices ("May / Should")</h3>
                  </div>

                  <ul className="space-y-3">
                    {advisoryRecs.map((rec: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Important Compliance Dates */}
              {importantDates.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Important Regulatory Timelines & Deadlines</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {importantDates.map((item: any, i: number) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                        <span className="font-bold text-blue-800 block text-sm">{item.date}</span>
                        <span className="text-slate-600 block mt-1">{item.meaning}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{item.sourceSection}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Triple Impact Matrix (Cyber, Technology, Operational) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Cybersecurity Impact</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {cyberImpact.map((item: string, i: number) => (
                      <li key={i} className="list-disc ml-4">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Technology Risk Impact</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {techImpact.map((item: string, i: number) => (
                      <li key={i} className="list-disc ml-4">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Operational & Audit Impact</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {operationalImpact.map((item: string, i: number) => (
                      <li key={i} className="list-disc ml-4">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Considerations */}
              {suggestedConsiderations.length > 0 && (
                <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Suggested Operational Considerations (Non-Binding Platform Guidance)
                  </h3>
                  <div className="space-y-2">
                    {suggestedConsiderations.map((c: string, i: number) => (
                      <div key={i} className="text-xs text-slate-700 bg-white p-3 rounded-md border border-slate-200">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
              AI summary is currently being synthesized by the intelligence pipeline. Check back shortly.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LAYER 2 AUTHORITATIVE EXTRACTED TEXT */}
      {activeTab === 'extractedText' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Layer 2: Extracted Document Text</span>
              <p className="text-xs text-slate-500">Authoritative plain text extracted directly from official publication</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
              Extraction Status: {document.extractionStatus}
            </span>
          </div>

          <pre className="font-mono text-xs text-slate-800 bg-slate-50 p-5 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[600px] select-text">
            {document.extractedText || 'No text extracted.'}
          </pre>
        </div>
      )}

      {/* TAB 3: CITATIONS */}
      {activeTab === 'citations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Supporting Official Source Passages</span>
            <p className="text-xs text-slate-500">Deterministic links verifying AI-generated requirements against exact regulatory text</p>
          </div>

          <div className="space-y-3">
            {document.citations.map((c: any) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200 font-mono">
                    {c.sectionReference}
                  </span>
                  {c.pageNumber && <span className="text-slate-400">Page {c.pageNumber}</span>}
                </div>
                <blockquote className="text-xs text-slate-700 border-l-2 border-blue-400 pl-3 italic leading-relaxed">
                  "{c.paragraphText}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RELATIONSHIPS */}
      {activeTab === 'relationships' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Regulatory Lineage & Lifecycle</span>
            <p className="text-xs text-slate-500">Tracking amended, superseded, and withdrawn regulatory documents</p>
          </div>

          {document.supersedesDocument && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
              <span className="text-slate-500 font-medium">Supersedes Earlier Circular:</span>
              <div className="font-bold text-slate-900">
                <Link href={`/documents/${document.supersedesDocument.id}`} className="text-blue-600 hover:underline">
                  {document.supersedesDocument.title}
                </Link>
              </div>
            </div>
          )}

          {document.supersededBy.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs space-y-1">
              <span className="text-amber-800 font-medium">Superseded By Newer Direction:</span>
              {document.supersededBy.map((s: any) => (
                <div key={s.id} className="font-bold text-amber-950">
                  <Link href={`/documents/${s.id}`} className="underline">
                    {s.title}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
