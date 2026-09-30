'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  ArrowRight, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  FolderClock
} from 'lucide-react';

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'searches'>('bookmarks');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/saved');
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks || []);
        setSavedSearches(data.savedSearches || []);
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

  const deleteBookmark = async (id: string) => {
    try {
      await fetch(`/api/user/saved?bookmarkId=${id}`, { method: 'DELETE' });
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await fetch(`/api/user/saved?searchId=${id}`, { method: 'DELETE' });
      setSavedSearches(savedSearches.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Compliance Workspace & Bookmarks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Saved regulatory publications, research bookmarks, and stored queries
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'bookmarks'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked Circulars ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('searches')}
          className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'searches'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Saved Searches ({savedSearches.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
          Loading workspace items...
        </div>
      ) : activeTab === 'bookmarks' ? (
        bookmarks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Bookmarks Saved Yet</h3>
            <p className="text-xs text-slate-500">
              When exploring circulars, click "Bookmark" on any document detail page to save it here.
            </p>
            <Link
              href="/updates"
              className="inline-block bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg mt-2"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => {
              const doc = b.regulatoryDocument;
              return (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold bg-navy-800 text-white px-2 py-0.5 rounded text-[11px]">
                        {doc.regulator.shortName}
                      </span>
                      {doc.documentNumber && (
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {doc.documentNumber}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">
                        Saved {new Date(b.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">
                      <Link href={`/documents/${doc.id}`} className="hover:text-blue-700">
                        {doc.title}
                      </Link>
                    </h4>

                    {doc.summary && (
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {doc.summary.shortHeadline}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => deleteBookmark(b.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : savedSearches.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No Saved Searches Yet</h3>
          <p className="text-xs text-slate-500">
            Click "Save This Search" on the Search page to save complex query parameters.
          </p>
          <Link
            href="/search"
            className="inline-block bg-navy-800 text-white text-xs font-semibold px-4 py-2 rounded-lg mt-2"
          >
            Go to Search
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((s) => (
            <div
              key={s.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-200 transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                <div className="text-xs text-slate-500 font-mono">
                  Query: "{s.query}"
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  <span>Rerun Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => deleteSearch(s.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded"
                  title="Remove Search"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
