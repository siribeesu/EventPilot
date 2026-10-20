import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Heart,
  Cake,
  Flame,
  ChevronRight,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  Sliders,
  Award,
  Zap,
  Users2,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onStartPlanning: () => void;
  onOpenDashboard: () => void;
  currency: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onOpenDashboard,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'wedding' | 'birthday' | 'community'>('wedding');
  const [heroActiveDemo, setHeroActiveDemo] = useState<'normal' | 'rescued'>('normal');

  const useCases = {
    wedding: {
      title: 'Grand Weddings & Royal Receptions',
      subtitle: 'Harmonize traditions, bespoke floral stages, gourmet banquets, and guest hospitality within strict budgets.',
      icon: Heart,
      tag: 'Weddings',
      sampleBudget: currency === 'INR' ? '₹7,50,000' : '$15,000',
      sampleGuests: '250 Guests',
      features: [
        'Multi-function timeline: Sangeet, Mehendi, Ceremony & Grand Reception',
        'Traditional floral vs modern minimalist budget trade-offs',
        'Vendor quotation comparison for drone photography & catering',
        'Automated RSVP countdown and multi-cuisine dietary locks',
      ],
      sampleCategories: [
        { name: 'Heritage Banquet & Lawn', cost: '35%', color: 'bg-indigo-600' },
        { name: 'Pure Vegetarian Royal Feast', cost: '30%', color: 'bg-violet-600' },
        { name: 'Marigold & Stage Decor', cost: '15%', color: 'bg-rose-500' },
        { name: 'Candid & Drone Photography', cost: '12%', color: 'bg-amber-500' },
        { name: 'DJ & Sound Production', cost: '8%', color: 'bg-emerald-500' },
      ],
    },
    birthday: {
      title: 'Milestone Birthdays & Gala Nights',
      subtitle: 'From 1st birthday wonderlands to 50th golden celebrations with zero coordinator stress.',
      icon: Cake,
      tag: 'Birthdays',
      sampleBudget: currency === 'INR' ? '₹65,000' : '$2,500',
      sampleGuests: '60 Guests',
      features: [
        'Neon & Glow-in-the-dark or Boho Chic aesthetic generator',
        'Artisan customized fondant cake & street-food live stations',
        'Interactive party games & curated DJ playlist recommendations',
        'Digital invites with live RSVP link tracker',
      ],
      sampleCategories: [
        { name: 'Venue & Lounge Space', cost: '30%', color: 'bg-indigo-600' },
        { name: 'Sliders & Mocktails Catering', cost: '35%', color: 'bg-violet-600' },
        { name: 'LED Neon Balloon Arch', cost: '18%', color: 'bg-rose-500' },
        { name: 'Party DJ & Sound Kit', cost: '10%', color: 'bg-amber-500' },
        { name: 'Custom Fondant Cake', cost: '7%', color: 'bg-emerald-500' },
      ],
    },
    community: {
      title: 'College Festivals & Community Galas',
      subtitle: 'High-energy festivals, charity concerts, and alumni reunions with transparent funds tracking.',
      icon: Flame,
      tag: 'Community & College',
      sampleBudget: currency === 'INR' ? '₹2,50,000' : '$5,000',
      sampleGuests: '400 Attendees',
      features: [
        'Trussing, line-array audio, and municipal sound permits timeline',
        'High-capacity food stalls & hydration management',
        'Volunteer task delegation with priority deadlines',
        'Real-time remaining balance and sponsor funds ledger',
      ],
      sampleCategories: [
        { name: 'Audio Rig, Lighting & Trussing', cost: '35%', color: 'bg-indigo-600' },
        { name: 'Food Trucks & Refreshments', cost: '30%', color: 'bg-violet-600' },
        { name: 'Campus Permits & Security', cost: '15%', color: 'bg-rose-500' },
        { name: 'Performers & Headliners', cost: '12%', color: 'bg-amber-500' },
        { name: 'Branding & Flex Banners', cost: '8%', color: 'bg-emerald-500' },
      ],
    },
  };

  const currentCase = useCases[activeTab];

  return (
    <div className="space-y-20 pb-24 saas-glow-bg">
      {/* 1. Hero Section: Modern SaaS High-Impact Aura */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Compelling Typography & CTAs */}
            <div className="lg:col-span-7 space-y-7">
              {/* Micro Shimmer Pill Badge */}
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" aria-hidden="true" />
                <span className="tracking-wide">Autonomous Event Intelligence 2.5</span>
                <span className="text-indigo-400 font-normal">|</span>
                <span className="text-indigo-700 font-bold flex items-center space-x-1">
                  <span>Gemini & Safety Engine</span>
                </span>
              </div>

              {/* Ultra-Modern SaaS Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08]">
                Plan Unforgettable Events in Minutes,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                  Not Months.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                EventPilot transforms chaotic event planning into itemized budget matrices, adaptive countdown schedules, verified vendor procurement checklists, and personalized themes. Features autonomous <strong>Budget Rescue Mode™</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={onStartPlanning}
                  className="inline-flex items-center justify-center space-x-2.5 px-7 py-4 rounded-2xl text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_24px_rgba(79,70,229,0.45)] group cursor-pointer"
                >
                  <span>Launch Event Creator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onOpenDashboard}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl text-base font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-2xs cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" aria-hidden="true" />
                  <span>Open Command Center</span>
                </button>
              </div>

              {/* SaaS Trust Proof Points */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span>100% Deterministic Ledger</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                  <span>Budget Rescue Mode™</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-violet-600 flex-shrink-0" aria-hidden="true" />
                  <span>Executive PDF Export</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Live Interactive App Window Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.12)] p-6 sm:p-7 space-y-5 transition-all">
                {/* Window Top Controls */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 ml-1.5 tracking-tight">EventPilot AI Simulator</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider uppercase">
                    Interactive
                  </span>
                </div>

                {/* Plan Metadata */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Sample Event Blueprint</span>
                    <span className="font-semibold text-slate-700">Aarav & Diya Wedding</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {currency === 'INR'
                        ? heroActiveDemo === 'rescued'
                          ? '₹5,25,000'
                          : '₹7,50,000'
                        : heroActiveDemo === 'rescued'
                        ? '$10,500'
                        : '$15,000'}
                    </span>
                    {heroActiveDemo === 'rescued' ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-pulse">
                        Saved 30% via AI
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">250 Guests</span>
                    )}
                  </div>
                </div>

                {/* Simulated Category Breakdown Bars */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800 font-semibold">Royal Banquet & Lawn</span>
                      <span className="text-slate-500 font-bold">{heroActiveDemo === 'rescued' ? '38%' : '35%'}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: heroActiveDemo === 'rescued' ? '38%' : '35%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800 font-semibold">Gourmet Catering (Shielded Priority)</span>
                      <span className="text-slate-500 font-bold">{heroActiveDemo === 'rescued' ? '36%' : '30%'}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: heroActiveDemo === 'rescued' ? '36%' : '30%' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800 font-semibold">Floral & Stage Decor</span>
                      <span className="text-slate-500 font-bold">{heroActiveDemo === 'rescued' ? '12%' : '20%'}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: heroActiveDemo === 'rescued' ? '12%' : '20%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator Controller */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                      <span>Simulate Budget Reduction:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setHeroActiveDemo(prev => (prev === 'normal' ? 'rescued' : 'normal'))}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer shadow-xs active:scale-95"
                    >
                      {heroActiveDemo === 'normal' ? 'Apply -30% Rescue' : 'Reset to Full'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {heroActiveDemo === 'normal'
                      ? 'Click "Apply -30% Rescue" to see how our autonomous engine intelligently swaps imported stage florals while strictly protecting your royal banquet catering.'
                      : '✓ Trade-off executed! Preserved dining quality while saving ₹2,25,000 on stage elements with 1-click user verification.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Grid: Enterprise Feature Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Engineered For Precision
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Flawless Execution
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Every feature is backed by deterministic rules, robust security, and conversational AI guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Card 1 (7 cols): Budget Rescue Mode */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs" aria-hidden="true">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Budget Rescue Mode™ (Priority Safeguards)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When financial limits decrease, EventPilot never makes blind cuts. It analyzes your declared priority focus, recalculates line items, and generates a side-by-side comparative ledger with individual checkboxes for your approval.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Zero Overwrite Guarantee:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% User Confirmed
              </span>
            </div>
          </div>

          {/* Bento Card 2 (5 cols): Adaptive Timeline */}
          <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs" aria-hidden="true">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Adaptive Countdown Engine
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically maps preparation milestones against your event date. Highlights overdue items, caterer locks, and on-site checklist inspections.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-indigo-700 font-bold bg-indigo-50/80 p-3 rounded-2xl border border-indigo-100">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>Real-time T-Minus Countdown Calculation</span>
            </div>
          </div>

          {/* Bento Card 3 (5 cols): Executive PDF Export */}
          <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs" aria-hidden="true">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Executive PDF Portfolio Generator
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Export an itemized financial summary, vendor telephone directory, and timeline checklist in a print-ready executive PDF layout with zero formatting flaws.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Client-side PDF Engine</span>
              <span className="font-bold text-slate-900">jsPDF & AutoTable</span>
            </div>
          </div>

          {/* Bento Card 4 (7 cols): Verified Vendor Management */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs" aria-hidden="true">
                <Users2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Transparent Vendor Quotation Matrix
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track contractor contact cards, compare contractor quotations against AI market benchmarks, and monitor booking confirmations without invented contact details.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between font-semibold">
              <span className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Zero Hallucinated Contacts Guaranteed</span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Deterministic
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Occasion Blueprints & Interactive Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tailored Intelligence for Every Occasion
          </h2>
          <p className="text-sm text-slate-600">
            See how EventPilot dynamically structures logistics, funds, and experiences according to your event type.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Event celebration use cases"
            className="inline-flex p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200 space-x-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'wedding'}
              onClick={() => setActiveTab('wedding')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
                activeTab === 'wedding'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" aria-hidden="true" />
              <span>Weddings & Receptions</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'birthday'}
              onClick={() => setActiveTab('birthday')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
                activeTab === 'birthday'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <span>Birthdays & Milestones</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'community'}
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
              <span>College & Community</span>
            </button>
          </div>
        </div>

        {/* Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel */}
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 bg-gradient-to-br from-slate-50/60 to-white">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100">
                {currentCase.tag} Blueprint
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{currentCase.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{currentCase.subtitle}</p>

              <div className="pt-2 space-y-2.5">
                {currentCase.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={onStartPlanning}
                className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1 group cursor-pointer"
              >
                <span>Plan this event now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right Panel: Sample Interactive Plan */}
          <div className="lg:col-span-7 p-8 lg:p-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">AI Budget Matrix</span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">Recommended Expenditure Distribution</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Baseline Budget</span>
                <span className="text-xl font-extrabold text-indigo-600">{currentCase.sampleBudget}</span>
              </div>
            </div>

            {/* Visual Category Bars */}
            <div className="space-y-3.5">
              {currentCase.sampleCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 font-bold">{cat.cost}</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={parseInt(cat.cost)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name}: ${cat.cost} of budget`}
                    className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: cat.cost }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Callout note */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed">
                <span className="font-bold">Autonomous Trade-off Engine: </span>
                If financial ceilings reduce later, EventPilot preserves your highest priority allocations and automatically substitutes affordable floral and menu alternatives without compromising hospitality.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Consistent Full-Width Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-10 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(99,102,241,0.25),transparent)]" aria-hidden="true" />
          <div className="relative space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Ready to begin?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Create Your Next Event Plan in 120 Seconds
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Get an itemized budget, vendor quotation directory, and personalized timeline backed by Budget Rescue Mode™.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onStartPlanning}
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl text-base font-bold bg-white text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 active:scale-[0.98] transition shadow-lg cursor-pointer"
              >
                <span>Launch Event Creator</span>
                <ArrowRight className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
