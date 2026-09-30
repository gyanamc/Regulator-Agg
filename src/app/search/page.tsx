'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  ExternalLink, 
  Bookmark, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  BookmarkPlus,
  Sparkles
} from 'lucide-react';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading search engine...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedSearchSuccess, setSavedSearchSuccess] = useState(false);

  const executeSearch = async (term: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=25`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSaveSearch = async () => {
    try {
      const res = await fetch('/api/user/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, name: `Search: ${query || 'All Documents'}` }),
      });
      if (res.ok) {
        setSavedSearchSuccess(true);
        setTimeout(() => setSavedSearchSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Regulatory Search Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Full-text passage search, document numbers, and keyword matching across Indian regulatory publications
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleFormSubmit} className="relative flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by topic, keyword, circular number (e.g. 'CERT-In 6 hours', 'CSCRF', 'RBI IT Gov')..."
          className="w-full pl-12 pr-28 py-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      {/* Relevancy and Action Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
        <div>
          Found <strong>{total}</strong> relevant publication{total === 1 ? '' : 's'}
          {query && <span> for &ldquo;<strong>{query}</strong>&rdquo;</span>}
        </div>

        {query && (
          <button
            onClick={handleSaveSearch}
            className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 font-semibold"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>{savedSearchSuccess ? 'Saved to Searches!' : 'Save This Search'}</span>
          </button>
        )}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Searching regulatory provisions and titles...
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Matching Publications</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            We could not find any official documents matching &ldquo;{query}&rdquo;. Check spelling or search for broader concepts like &ldquo;incident reporting&rdquo; or &ldquo;cloud&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((doc) => (
            <article
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all space-y-3"
            >
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-navy-800 text-white">
                    {doc.regulator.shortName}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  {doc.documentNumber && (
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                      {doc.documentNumber}
                    </span>
                  )}
                  {doc.isDemo && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                      DEMO_DATA
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(doc.publicationDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-slate-900 hover:text-blue-700 transition-colors">
                <Link href={`/documents/${doc.id}`}>
                  {doc.title}
                </Link>
              </h2>

              {/* Match Reasons Badge ("Why It Matched") */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Match Reason:</span>
                {doc.matchReasons.map((reason: string, i: number) => (
                  <span key={i} className="text-[11px] bg-blue-50 text-blue-800 font-medium px-2 py-0.5 rounded border border-blue-200">
                    {reason}
                  </span>
                ))}
              </div>

              {/* Matched Snippet if available */}
              {doc.matchedSnippet && (
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-slate-800 font-mono leading-relaxed">
                  <span className="text-[10px] text-amber-800 uppercase font-bold block mb-1">Matching Extracted Passage:</span>
                  {doc.matchedSnippet}
                </div>
              )}

              {/* Summary */}
              {doc.summary && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {doc.summary.shortHeadline}
                </p>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {doc.topics.map((t: string) => (
                    <span key={t} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={doc.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <Link
                    href={`/documents/${doc.id}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
