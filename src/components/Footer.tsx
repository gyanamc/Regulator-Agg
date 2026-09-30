import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Platform Overview */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              <span className="font-bold text-lg text-white">Regulatory Intelligence Hub India</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Automated continuous collection, structured extraction, and grounded intelligence for official Indian regulatory circulars. Serving compliance, cybersecurity, technology risk, legal, and audit teams across regulated entities.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Platform v1.0.0</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Three-Layer Content Separation</span>
            </div>
          </div>

          {/* Column 2: Covered Regulators */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Monitored Regulators</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="https://www.rbi.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>Reserve Bank of India (RBI)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.sebi.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>Securities & Exchange Board of India (SEBI)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.cert-in.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>CERT-In (Cybersecurity)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://www.npci.org.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>National Payments Corp of India (NPCI)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://irdai.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>IRDAI (Insurance Sector)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Tools */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Compliance Tools</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/updates" className="hover:text-white">Regulatory Updates Catalog</Link></li>
              <li><Link href="/assistant" className="hover:text-white">Grounded Regulatory Assistant</Link></li>
              <li><Link href="/search" className="hover:text-white">Full-Text Passage Search</Link></li>
              <li><Link href="/watchlists" className="hover:text-white">Custom Watchlists & Digests</Link></li>
              <li><Link href="/reviewer" className="hover:text-white">Reviewer Workbench</Link></li>
              <li><Link href="/admin" className="hover:text-white">Connector Administration</Link></li>
            </ul>
          </div>
        </div>

        {/* Mandatory Legal & Regulatory Disclaimer */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-start space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Mandatory Statutory & Informational Disclaimer:</span>
              <p className="mt-1 text-slate-400">
                Regulatory Intelligence Hub India is an information aggregation and compliance research system. It does not provide legal advice, regulatory certifications, or authoritative compliance determinations. Official publications and notifications from the respective regulators remain the sole authoritative legal instruments. All AI-generated summaries and suggested considerations are platform-level interpretations and must be independently verified by qualified legal and compliance counsel.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs">
            <div>&copy; {new Date().getFullYear()} Regulatory Intelligence Hub India. All rights reserved.</div>
            <div className="flex space-x-6 mt-2 sm:mt-0">
              <span className="hover:text-slate-400 cursor-pointer">Security Safeguards</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Framework</span>
              <span className="hover:text-slate-400 cursor-pointer">Ethical Scraping Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
