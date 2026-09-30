'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Search, 
  MessageSquareText, 
  SlidersHorizontal, 
  Bookmark, 
  CheckCircle2, 
  Settings, 
  UserCheck, 
  ExternalLink,
  Bell
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<'VISITOR' | 'REGISTERED_USER' | 'REVIEWER' | 'ADMINISTRATOR'>('REGISTERED_USER');

  const navItems = [
    { label: 'Catalog & Updates', href: '/updates', icon: SlidersHorizontal },
    { label: 'Regulatory Assistant', href: '/assistant', icon: MessageSquareText },
    { label: 'Watchlists', href: '/watchlists', icon: Bell },
    { label: 'Saved & Bookmarks', href: '/saved', icon: Bookmark },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      {/* Top Advisory Banner */}
      <div className="bg-navy-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap justify-between items-center border-b border-navy-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">5 Indian Regulators Monitored:</span>
          <span>RBI • SEBI • CERT-In • NPCI • IRDAI</span>
          <span className="text-slate-400 hidden md:inline">| Non-Legal Advisory Research System</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 hidden sm:inline">Role Simulation:</span>
          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value as any)}
            className="bg-navy-800 text-white text-xs px-2 py-0.5 rounded border border-navy-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            aria-label="Active Role Simulator"
          >
            <option value="VISITOR">Visitor (Public Read)</option>
            <option value="REGISTERED_USER">Compliance Lead (Registered)</option>
            <option value="REVIEWER">Senior Reviewer (Governance)</option>
            <option value="ADMINISTRATOR">System Administrator (Ops)</option>
          </select>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Product Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center text-white shadow-sm border border-navy-700 group-hover:bg-navy-900 transition-colors">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 leading-tight tracking-tight">
                Regulatory Intelligence Hub
              </div>
              <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase">
                India Compliance Portal
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Reviewer link (highlighted if role is reviewer or admin) */}
            {(activeRole === 'REVIEWER' || activeRole === 'ADMINISTRATOR') && (
              <Link
                href="/reviewer"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/reviewer'
                    ? 'bg-amber-100 text-amber-900 font-semibold'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span>Reviewer Workbench</span>
              </Link>
            )}

            {/* Admin link */}
            {activeRole === 'ADMINISTRATOR' && (
              <Link
                href="/admin"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/admin'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin Ops</span>
              </Link>
            )}
          </nav>

          {/* Global Quick Search Button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/search"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search circulars...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded text-slate-400">
                /
              </kbd>
            </Link>

            <Link
              href="/assistant"
              className="hidden sm:inline-flex items-center space-x-1.5 bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-colors"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-blue-300" />
              <span>Ask Assistant</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
