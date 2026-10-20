import React from 'react';
import { Sparkles, Plus, LayoutDashboard, Compass, Globe } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'wizard' | 'event';
  onNavigate: (view: 'landing' | 'dashboard' | 'wizard', eventId?: string) => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currency,
  onCurrencyChange,
}) => {
  return (
    <header role="banner" className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with modern luxury SaaS touch */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          aria-label="EventPilot Home"
          className="flex items-center space-x-3 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1 -ml-1 transition"
        >
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-[0_2px_10px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-transform"
            aria-hidden="true"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pilot</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200/60 uppercase">
                AI Suite
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wide">Enterprise Event Intelligence</p>
          </div>
        </button>

        {/* Center Nav Links with clean segmented pill styling */}
        <nav role="navigation" aria-label="Main Navigation" className="hidden md:flex items-center space-x-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentView === 'landing'
                ? 'text-slate-900 bg-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span>Product Tour</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentView === 'dashboard' || currentView === 'event'
                ? 'text-slate-900 bg-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Accessible Currency Switcher Pill */}
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300 transition">
            <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="global-currency-select" className="sr-only">
              Application Currency
            </label>
            <select
              id="global-currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Select application currency"
              className="bg-transparent font-bold text-slate-800 cursor-pointer focus-visible:outline-none rounded text-xs"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>

          {/* New Event Primary CTA Button */}
          <button
            type="button"
            onClick={() => onNavigate('wizard')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-300" aria-hidden="true" />
            <span>New Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
