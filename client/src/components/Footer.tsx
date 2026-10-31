import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  CheckCircle2,
  ArrowRight,
  Shield,
  Heart,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'dashboard' | 'wizard') => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer role="contentinfo" className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand & Description (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
            >
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-[0_2px_12px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform"
                aria-hidden="true"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Event<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Pilot</span>
              </span>
            </button>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern intelligent platform for automated budget matrices, adaptive timelines, vendor procurement checklists, and memorable celebration management.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GDPR Verified</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                <span>Budget Rescue Mode™</span>
              </span>
            </div>
          </div>

          {/* Product Links (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Event Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Create New Event
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Vendor Management
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Executive PDF Export
                </button>
              </li>
            </ul>
          </div>

          {/* Celebrations & Solutions (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Event Solutions</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span>Weddings & Receptions</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Milestone Birthdays & Anniversaries
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  College & Campus Festivals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Corporate Summits & Offsites
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('wizard')}
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Community & Cultural Gatherings
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Newsletter & Privacy (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Stay Updated</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribe to get tips on venue bargaining, budget optimization matrices, and event templates.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-3 rounded-xl animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>You're subscribed! We never send spam.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 focus-within:border-indigo-500 overflow-hidden transition">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-transparent px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to updates"
                    className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="underline underline-offset-2">Privacy & GDPR Portability Disclosures</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/50 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} EventPilot Inc. All rights reserved.</span>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <span className="inline-flex items-center space-x-1 text-slate-400">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" aria-label="love" />
              <span>for planners</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Terms of Service
            </button>
            <span aria-hidden="true" className="text-slate-700">•</span>
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
