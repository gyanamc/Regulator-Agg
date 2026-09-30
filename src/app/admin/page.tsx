'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Activity, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Server, 
  Clock, 
  ShieldCheck,
  RotateCw,
  Layers,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingRegulator, setSyncingRegulator] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Manual Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDocNumber, setManualDocNumber] = useState('');
  const [manualRegulator, setManualRegulator] = useState('RBI');
  const [manualUrl, setManualUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/connectors');
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSync = async (shortName: string) => {
    try {
      setSyncingRegulator(shortName);
      setSyncMessage(null);
      const res = await fetch(`/api/admin/connectors/${shortName}/sync`, { method: 'POST' });
      const resData = await res.json();
      if (res.ok) {
        setSyncMessage(`Sync for ${shortName} completed: Found ${resData.result.documentsFound}, Created ${resData.result.documentsCreated} documents.`);
        await loadData();
      } else {
        setSyncMessage(`Sync error for ${shortName}: ${resData.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`Sync failed: ${e.message}`);
    } finally {
      setSyncingRegulator(null);
    }
  };

  const handleManualUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualText || !manualUrl) return;

    try {
      setUploadLoading(true);
      const res = await fetch('/api/admin/ingest-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulatorShortName: manualRegulator,
          title: manualTitle,
          documentNumber: manualDocNumber || undefined,
          officialSourceUrl: manualUrl,
          rawText: manualText,
          documentType: 'CIRCULAR',
          topicNames: ['Cybersecurity', 'IT Governance'],
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setUploadSuccess(`Document ingested successfully (ID: ${resData.documentId}) and summary generated.`);
        setManualTitle('');
        setManualDocNumber('');
        setManualText('');
        setManualUrl('');
        setShowUploadModal(false);
        await loadData();
      } else {
        alert(`Ingestion error: ${resData.error}`);
      }
    } catch (e: any) {
      alert(`Upload error: ${e.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administration & Connector Telemetry
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-navy-800 text-white rounded">
              Superadmin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Source crawler health, job queue execution, manual document ingestion, and system metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4 text-blue-300" />
            <span>Manual Document Upload</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Metrics"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium rounded-lg flex items-center justify-between">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="font-bold text-blue-800">&times;</button>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-lg flex items-center justify-between">
          <span>{uploadSuccess}</span>
          <button onClick={() => setUploadSuccess(null)} className="font-bold text-emerald-800">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Loading system telemetry and connector states...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Publications</span>
              <div className="text-2xl font-bold text-slate-900">{data?.stats?.totalDocs || 0}</div>
              <span className="text-[11px] text-slate-500">Across 5 Regulators</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Live Official Documents</span>
              <div className="text-2xl font-bold text-emerald-600">{data?.stats?.liveDocs || 0}</div>
              <span className="text-[11px] text-slate-500">From Active Ingestion</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Local Fixtures ([DEMO_DATA])</span>
              <div className="text-2xl font-bold text-amber-600">{data?.stats?.demoDocs || 0}</div>
              <span className="text-[11px] text-slate-500">Certified Offline Test Records</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Pending Review Queue</span>
              <div className="text-2xl font-bold text-blue-600">{data?.stats?.pendingReviewDocs || 0}</div>
              <span className="text-[11px] text-slate-500">Awaiting Human Approval</span>
            </div>
          </div>

          {/* Source Connectors Health Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Source Connector Registry & Health</h3>
              </div>
              <span className="text-xs text-slate-400">5 Registered Connectors</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Regulator</th>
                    <th className="py-2.5 px-3">Source Channel</th>
                    <th className="py-2.5 px-3">Type / Frequency</th>
                    <th className="py-2.5 px-3">Health Status</th>
                    <th className="py-2.5 px-3">Last Polled</th>
                    <th className="py-2.5 px-3">Docs Ingested</th>
                    <th className="py-2.5 px-3 text-right">Manual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data?.connectors?.map((conn: any) => (
                    <tr key={conn.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {conn.regulator.shortName}
                      </td>
                      <td className="py-3 px-3 max-w-xs truncate" title={conn.sourceName}>
                        <div className="font-medium text-slate-900">{conn.sourceName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{conn.sourceUrl}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {conn.sourceType} • {conn.checkFrequency}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          conn.status === 'HEALTHY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${conn.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {conn.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {conn.lastCheckedAt ? new Date(conn.lastCheckedAt).toLocaleTimeString('en-IN') : 'Never'}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        {conn._count.documents}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => triggerSync(conn.regulator.shortName)}
                          disabled={syncingRegulator === conn.regulator.shortName}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingRegulator === conn.regulator.shortName ? 'animate-spin' : ''}`} />
                          <span>Sync Now</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ingestion Job Telemetry & Execution Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Ingestion Jobs & Execution Logs</h3>
              </div>
              <span className="text-xs text-slate-400">Shows recent job runs & retries</span>
            </div>

            <div className="space-y-2">
              {data?.recentJobs?.map((job: any) => (
                <div
                  key={job.id}
                  className={`p-3 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
                    job.status === 'FAILED'
                      ? 'bg-red-50/50 border-red-200 text-red-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {job.sourceConnector?.regulator?.shortName} ({job.sourceConnector?.sourceName})
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(job.startedAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span>Found: {job.documentsFound}</span>
                    <span>Created: {job.documentsCreated}</span>
                    {job.retryCount > 0 && <span className="text-red-700 font-bold">Retries: {job.retryCount}</span>}
                  </div>

                  {job.errorMessage && (
                    <div className="w-full text-[11px] text-red-700 bg-white p-2 rounded border border-red-200 mt-1 font-mono">
                      Error: {job.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Document Ingestion Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Manual Regulatory Ingestion (Admin)</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleManualUpload} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Regulator</label>
                  <select
                    value={manualRegulator}
                    onChange={(e) => setManualRegulator(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="RBI">Reserve Bank of India (RBI)</option>
                    <option value="SEBI">Securities and Exchange Board (SEBI)</option>
                    <option value="CERT-In">CERT-In (Cybersecurity)</option>
                    <option value="NPCI">National Payments Corp (NPCI)</option>
                    <option value="IRDAI">Insurance Authority (IRDAI)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Number / Ref</label>
                  <input
                    type="text"
                    value={manualDocNumber}
                    onChange={(e) => setManualDocNumber(e.target.value)}
                    placeholder="e.g., RBI/2024-25/99"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Document Title</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g., Master Direction on Cyber Resilience and Cloud Controls"
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Publication URL (Authoritative Provenance)</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://www.rbi.org.in/Scripts/..."
                  required
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Regulatory Plain Text (Authoritative Layer 2)</label>
                <textarea
                  rows={8}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste official publication text with clauses, requirements, and dates..."
                  required
                  className="w-full p-3 font-mono border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {uploadLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Ingest & Generate Summary</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
