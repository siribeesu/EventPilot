import React from 'react';
import { Sparkles, PlusCircle, LayoutDashboard, Compass } from 'lucide-react';

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
    <header role="banner" className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo with accessible link */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          aria-label="EventPilot Home"
          className="flex items-center space-x-3 cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl p-1 -ml-1 transition"
        >
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform"
            aria-hidden="true"
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">EventPilot</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-0.5">GenAI Event Planning Suite</p>
          </div>
        </button>

        {/* Center Nav Links */}
        <nav role="navigation" aria-label="Main Navigation" className="hidden md:flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentView === 'landing'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Discover</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentView === 'dashboard' || currentView === 'event'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
            <span>My Events</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Accessible Currency Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100/80 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
            <label htmlFor="global-currency-select" className="text-xs text-slate-600">
              Currency:
            </label>
            <select
              id="global-currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              aria-label="Select application currency"
              className="bg-transparent font-semibold text-slate-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="AED">AED</option>
            </select>
          </div>

          {/* New Event Button */}
          <button
            type="button"
            onClick={() => onNavigate('wizard')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] transition-all shadow-sm shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>Create Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
