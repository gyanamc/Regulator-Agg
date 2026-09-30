import React from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, Shield, AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface RegulatoryCardProps {
  id: string;
  title: string;
  documentNumber?: string | null;
  documentType: string;
  publicationDate: string;
  effectiveDate?: string | null;
  officialSourceUrl: string;
  currentStatus: string;
  verificationStatus: string;
  isDemo: boolean;
  regulator: {
    shortName: string;
    name: string;
  };
  topics?: string[];
  summary?: {
    shortHeadline: string;
    executiveSummary: string;
    confidence?: string;
  } | null;
}

export default function RegulatoryCard({
  id,
  title,
  documentNumber,
  documentType,
  publicationDate,
  effectiveDate,
  officialSourceUrl,
  currentStatus,
  verificationStatus,
  isDemo,
  regulator,
  topics = [],
  summary,
}: RegulatoryCardProps) {
  // Regulator visual styling
  const getRegulatorBadgeClass = (short: string) => {
    switch (short.toUpperCase()) {
      case 'RBI':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'SEBI':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'CERT-IN':
        return 'bg-red-100 text-red-900 border-red-200';
      case 'NPCI':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'IRDAI':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CURRENT':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">IN FORCE</span>;
      case 'NEW':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">NEW</span>;
      case 'SUPERSEDED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1"><AlertTriangle className="w-3 h-3 text-amber-600 inline mr-1" />SUPERSEDED</span>;
      case 'WITHDRAWN':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200 flex items-center space-x-1"><AlertTriangle className="w-3 h-3 text-red-600 inline mr-1" />WITHDRAWN</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getVerificationBadge = (vStatus: string) => {
    switch (vStatus.toUpperCase()) {
      case 'VERIFIED':
      case 'HUMAN_REVIEWED':
        return (
          <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Human Reviewed
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            Review Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            AI Generated
          </span>
        );
    }
  };

  const formattedPubDate = publicationDate ? new Date(publicationDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : 'Undated';

  const formattedEffDate = effectiveDate ? new Date(effectiveDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : null;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between relative group">
      {/* Top Meta Bar */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded border ${getRegulatorBadgeClass(regulator.shortName)}`}>
              {regulator.shortName}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {documentType.replace('_', ' ')}
            </span>
            {documentNumber && (
              <span className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded font-mono border border-slate-200">
                {documentNumber}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isDemo && (
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-900 rounded border border-amber-300">
                DEMO_DATA
              </span>
            )}
            {getStatusBadge(currentStatus)}
            {getVerificationBadge(verificationStatus)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mb-2">
          <Link href={`/documents/${id}`}>
            {title}
          </Link>
        </h3>

        {/* Dates */}
        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Published: {formattedPubDate}</span>
          </div>
          {formattedEffDate && (
            <div className="flex items-center space-x-1 text-slate-700 font-medium">
              <span>Effective: {formattedEffDate}</span>
            </div>
          )}
        </div>

        {/* 3-Line Summary */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {summary ? summary.shortHeadline : 'Official regulatory publication collected and indexed for compliance research.'}
        </p>

        {/* Topic Badges */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {topics.slice(0, 4).map((topic, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                {topic}
              </span>
            ))}
            {topics.length > 4 && (
              <span className="text-xs text-slate-400 self-center">
                +{topics.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
        <span className="text-[11px] text-slate-600 italic">
          Platform-Generated Classification
        </span>

        <div className="flex items-center space-x-3">
          <a
            href={officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
            title="Open official publication on regulator website"
          >
            <span>Official Source</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <Link
            href={`/documents/${id}`}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5"
          >
            <span>Details & Citations</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
