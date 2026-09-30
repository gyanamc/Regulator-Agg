'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Mail, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Eye, 
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

export default function WatchlistsPage() {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewDigestHtml, setPreviewDigestHtml] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [selectedRegulators, setSelectedRegulators] = useState<string[]>(['RBI', 'CERT-In']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Cybersecurity', 'Cloud', 'Incident Reporting']);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(['Scheduled Commercial Banks']);
  const [frequency, setFrequency] = useState('DAILY');

  const regulatorsList = ['RBI', 'SEBI', 'CERT-In', 'NPCI', 'IRDAI'];
  const topicsList = [
    'Cybersecurity', 'Technology Risk', 'Artificial Intelligence', 'Cloud',
    'Outsourcing', 'Third-Party Risk', 'Data Protection', 'Digital Payments',
    'Incident Reporting', 'Operational Resilience', 'Business Continuity', 'IT Governance'
  ];
  const entitiesList = [
    'Scheduled Commercial Banks', 'Non-Banking Financial Companies (NBFCs)',
    'Stock Brokers & Depositories', 'Asset Management Companies (AMCs)',
    'Payment System Operators (PSPs / TPAPs)', 'Direct Insurers & Reinsurers',
    'Cloud Service Providers'
  ];

  const loadWatchlists = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/watchlists');
      if (res.ok) {
        const data = await res.json();
        setWatchlists(data.watchlists || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlists();
  }, []);

  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          regulatorFilters: selectedRegulators,
          topicFilters: selectedTopics,
          entityTypeFilters: selectedEntities,
          frequency,
        }),
      });

      if (res.ok) {
        setName('');
        setShowCreateModal(false);
        loadWatchlists();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const previewDigest = async (watchlistId: string) => {
    try {
      const res = await fetch(`/api/watchlists/${watchlistId}/digest-preview`);
      if (res.ok) {
        const data = await res.json();
        setPreviewDigestHtml(data.digestHtml);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Custom Regulatory Watchlists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor personalized combinations of regulators, risk domains, and regulated entity types with simulated email digests.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Watchlist</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Local Notification Simulator:</span>
          <p className="mt-0.5">
            Real external emails are paused by default in local development. Click "Preview Digest Simulation" on any active watchlist to inspect the exact HTML email digest generated for your filtered topics.
          </p>
        </div>
      </div>

      {/* Watchlist Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Loading watchlists...
        </div>
      ) : watchlists.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Watchlists Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a custom watchlist to track regulatory topics specific to your financial institution.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Create Watchlist
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {watchlists.map((w) => {
            const regs = JSON.parse(w.regulatorFilters || '[]');
            const topics = JSON.parse(w.topicFilters || '[]');
            const entities = JSON.parse(w.entityTypeFilters || '[]');

            return (
              <div
                key={w.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-base text-slate-900">{w.name}</h3>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {w.frequency} Digest
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => previewDigest(w.id)}
                      className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Digest Simulation</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">Monitored Regulators:</span>
                    <div className="flex flex-wrap gap-1">
                      {regs.length > 0 ? regs.map((r: string) => (
                        <span key={r} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {r}
                        </span>
                      )) : <span className="text-slate-400">All Regulators</span>}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">Risk Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {topics.length > 0 ? topics.map((t: string) => (
                        <span key={t} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {t}
                        </span>
                      )) : <span className="text-slate-400">All Topics</span>}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-400 block mb-1">Target Entity Types:</span>
                    <div className="flex flex-wrap gap-1">
                      {entities.length > 0 ? entities.map((e: string) => (
                        <span key={e} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {e}
                        </span>
                      )) : <span className="text-slate-400">All Regulated Entities</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create Regulatory Watchlist</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateWatchlist} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Watchlist Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Banking Cybersecurity & Cloud Compliance"
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Select Regulators</label>
                <div className="grid grid-cols-3 gap-2">
                  {regulatorsList.map((r) => (
                    <label key={r} className="flex items-center space-x-1.5 p-2 bg-slate-50 border border-slate-200 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRegulators.includes(r)}
                        onChange={() => toggleItem(selectedRegulators, setSelectedRegulators, r)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-medium text-slate-800">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Select Risk Topics</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {topicsList.map((t) => (
                    <label key={t} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(t)}
                        onChange={() => toggleItem(selectedTopics, setSelectedTopics, t)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-slate-700 text-[11px]">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="DAILY">Daily Compliance Digest (08:00 IST)</option>
                  <option value="WEEKLY">Weekly Compliance Rollup (Monday 09:00 IST)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg font-semibold"
                >
                  Save Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Digest Modal */}
      {previewDigestHtml && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-sm text-slate-900">Email Digest Simulator Preview</h3>
              </div>
              <button onClick={() => setPreviewDigestHtml(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <div 
              className="border border-slate-200 rounded-xl overflow-hidden shadow-inner p-2 bg-slate-50"
              dangerouslySetInnerHTML={{ __html: previewDigestHtml }} 
            />

            <div className="pt-2 text-right">
              <button
                onClick={() => setPreviewDigestHtml(null)}
                className="px-4 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
