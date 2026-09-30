'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import RegulatoryCard from '@/components/RegulatoryCard';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Calendar
} from 'lucide-react';

export default function UpdatesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading catalog...</div>}>
      <UpdatesContent />
    </Suspense>
  );
}

function UpdatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedRegulators, setSelectedRegulators] = useState<string[]>(searchParams.getAll('regulator'));
  const [selectedTopics, setSelectedTopics] = useState<string[]>(searchParams.getAll('topic'));
  const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.getAll('type'));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(searchParams.getAll('status'));
  const [selectedVerification, setSelectedVerification] = useState<string[]>(searchParams.getAll('verification'));
  const [sortBy, setSortBy] = useState('newest');

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const regulatorsList = ['RBI', 'SEBI', 'CERT-In', 'NPCI', 'IRDAI'];
  const topicsList = [
    'Cybersecurity', 'Technology Risk', 'Artificial Intelligence', 'Cloud',
    'Outsourcing', 'Third-Party Risk', 'Data Protection', 'Digital Payments',
    'Incident Reporting', 'Operational Resilience', 'Business Continuity', 'IT Governance'
  ];
  const documentTypesList = ['MASTER_DIRECTION', 'CIRCULAR', 'ADVISORY', 'GUIDELINE', 'ORDER'];
  const statusesList = ['CURRENT', 'NEW', 'SUPERSEDED', 'WITHDRAWN'];
  const verificationsList = ['HUMAN_REVIEWED', 'VERIFIED', 'PENDING_REVIEW', 'AI_GENERATED'];

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      selectedRegulators.forEach((r) => params.append('regulator', r));
      selectedTopics.forEach((t) => params.append('topic', t));
      selectedTypes.forEach((t) => params.append('type', t));
      selectedStatuses.forEach((s) => params.append('status', s));
      selectedVerification.forEach((v) => params.append('verification', v));
      params.set('limit', '30');

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedRegulators, selectedTopics, selectedTypes, selectedStatuses, selectedVerification]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults();
  };

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedRegulators([]);
    setSelectedTopics([]);
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedVerification([]);
    router.push('/updates');
  };

  const hasActiveFilters = 
    query ||
    selectedRegulators.length > 0 ||
    selectedTopics.length > 0 ||
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedVerification.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Regulatory Updates Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Structured records of circulars, directions, and guidelines from Indian financial & cyber regulators
        </p>
      </div>

      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, circular numbers, or extracted provisions..."
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
          >
            Search
          </button>
        </form>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* Main Filter & Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Multi-Faceted Filters</span>
            </span>
            <span className="text-xs text-slate-400">
              {total} match{total === 1 ? '' : 'es'}
            </span>
          </div>

          {/* Regulators Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Regulators
            </label>
            <div className="space-y-1.5">
              {regulatorsList.map((r) => (
                <label key={r} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedRegulators.includes(r)}
                    onChange={() => toggleFilter(selectedRegulators, setSelectedRegulators, r)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Topics Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Risk Topics
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {topicsList.map((t) => (
                <label key={t} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(t)}
                    onChange={() => toggleFilter(selectedTopics, setSelectedTopics, t)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Document Types */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Document Type
            </label>
            <div className="space-y-1.5">
              {documentTypesList.map((dt) => (
                <label key={dt} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(dt)}
                    onChange={() => toggleFilter(selectedTypes, setSelectedTypes, dt)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{dt.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Status Filter */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Legal Status
            </label>
            <div className="space-y-1.5">
              {statusesList.map((s) => (
                <label key={s} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(s)}
                    onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, s)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Verification Status
            </label>
            <div className="space-y-1.5">
              {verificationsList.map((v) => (
                <label key={v} className="flex items-center text-xs text-slate-700 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedVerification.includes(v)}
                    onChange={() => toggleFilter(selectedVerification, setSelectedVerification, v)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span>{v.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span>Showing <strong>{results.length}</strong> of <strong>{total}</strong> indexed records</span>
            <div className="flex items-center space-x-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-800 text-xs focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="relevance">Relevance</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
              Loading regulatory records...
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Matching Regulatory Documents Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No indexed circulars match your current filter combination. Try clearing some filters or searching for broader terms like "cybersecurity" or "reporting".
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {results.map((doc) => (
                <RegulatoryCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  documentNumber={doc.documentNumber}
                  documentType={doc.documentType}
                  publicationDate={doc.publicationDate}
                  effectiveDate={doc.effectiveDate}
                  officialSourceUrl={doc.officialSourceUrl}
                  currentStatus={doc.currentStatus}
                  verificationStatus={doc.verificationStatus}
                  isDemo={doc.isDemo}
                  regulator={{
                    shortName: doc.regulator.shortName,
                    name: doc.regulator.name,
                  }}
                  topics={doc.topics}
                  summary={doc.summary}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
