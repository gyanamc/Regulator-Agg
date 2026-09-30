'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Layers, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function ReviewerWorkbenchPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviewer/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
        if (data.queue && data.queue.length > 0 && !selectedDoc) {
          setSelectedDoc(data.queue[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'REGENERATE') => {
    if (!selectedDoc) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/reviewer/${selectedDoc.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewerNotes,
          reviewerName: 'Senior Regulatory Reviewer (Compliance Board)',
        }),
      });

      if (res.ok) {
        setActionMessage(`Action ${action} recorded successfully.`);
        setReviewerNotes('');
        setTimeout(() => setActionMessage(null), 3000);
        // Refresh queue
        await loadQueue();
        if (action === 'APPROVE' || action === 'REJECT') {
          const remaining = queue.filter((d) => d.id !== selectedDoc.id);
          setSelectedDoc(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Regulatory Reviewer Workbench
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-md border border-amber-300">
              Governance Gate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop review queue: Inspect side-by-side extracted authoritative text and AI-generated interpretations before ratifying.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Pending in Queue: <strong>{queue.length}</strong> items
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Loading reviewer queue...
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Review Queue Is Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All AI-generated summaries have been reviewed or verified by compliance personnel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Queue Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 h-fit">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Pending Review Items
            </span>

            <div className="space-y-2">
              {queue.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setReviewerNotes('');
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] bg-navy-800 text-white px-1.5 py-0.5 rounded">
                      {doc.regulator.shortName}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div className="line-clamp-2 leading-snug">{doc.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right 3-Columns: Side-by-Side Verification Workbench */}
          {selectedDoc && (
            <div className="lg:col-span-3 space-y-6">
              {/* Document Overview Bar */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 text-xs font-bold bg-navy-800 text-white rounded">
                      {selectedDoc.regulator.shortName}
                    </span>
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedDoc.documentNumber || 'Circular'}
                    </span>
                  </div>

                  <a
                    href={selectedDoc.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>View Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h2 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h2>
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: Authoritative Extracted Text (Layer 2) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-[520px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Layer 2: Authoritative Extracted Text</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Read-Only Ground Truth</span>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                    {selectedDoc.extractedText || 'No extracted text available.'}
                  </div>
                </div>

                {/* Right Panel: AI-Generated Summary & Obligations (Layer 3) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-[520px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Layer 3: AI-Generated Summary & Obligations</span>
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Pending Approval
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                    {selectedDoc.summary ? (
                      <>
                        <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 space-y-1">
                          <span className="font-bold text-blue-900 block">Synthesized Headline</span>
                          <p className="text-slate-800">{selectedDoc.summary.shortHeadline}</p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Executive Summary</span>
                          <p className="text-slate-600 leading-relaxed">{selectedDoc.summary.executiveSummary}</p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Extracted Key Obligations</span>
                          <div className="space-y-1.5">
                            {JSON.parse(selectedDoc.summary.keyRequirements || '[]').map((req: any, i: number) => (
                              <div key={i} className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                                <span className="font-medium text-slate-900 block">{req.requirement}</span>
                                <span className="text-[10px] text-blue-700 font-mono block">
                                  Section: {req.sourceSection} • {req.mandatoryOrAdvisory}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Important Dates</span>
                          <div className="space-y-1">
                            {JSON.parse(selectedDoc.summary.importantDates || '[]').map((d: any, i: number) => (
                              <div key={i} className="text-slate-600">
                                <strong>{d.date}:</strong> {d.meaning}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 py-10 text-center">No summary generated yet.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviewer Action Controls Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Compliance Review Decision & Audit Trail
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Reviewer cannot alter original stored document (Layer 1 & 2 immutability enforced)
                  </span>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter compliance verification remarks, citation checks, or justification for approval/rejection..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Action will log an immutable entry in the system <strong>AuditLog</strong>.
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleReviewAction('REGENERATE')}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                      <span>Request Regeneration</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('REJECT')}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Interpretation</span>
                    </button>

                    <button
                      onClick={() => handleReviewAction('APPROVE')}
                      disabled={actionLoading}
                      className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
