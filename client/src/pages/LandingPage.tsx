import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingDown,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Cake,
  Flame,
  Award,
  ChevronRight,
  FileText,
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

  const useCases = {
    wedding: {
      title: 'Grand Weddings & Receptions',
      subtitle: 'Harmonize traditions, decor, gourmet feasts, and guest hospitality within strict budgets.',
      icon: Heart,
      tag: 'Weddings',
      sampleBudget: currency === 'INR' ? '₹7,50,000' : '$15,000',
      sampleGuests: '250 Guests',
      features: [
        'Multi-function timeline: Sangeet, Mehendi, Ceremony & Reception',
        'Traditional floral vs modern minimalist budget trade-offs',
        'Vendor quotation comparison for photography & catering',
        'Automated RSVP countdown and dietary management',
      ],
      sampleCategories: [
        { name: 'Heritage Banquet & Lawn', cost: '35%', color: 'bg-indigo-500' },
        { name: 'Pure Vegetarian Royal Feast', cost: '30%', color: 'bg-purple-500' },
        { name: 'Marigold & Stage Decor', cost: '15%', color: 'bg-pink-500' },
        { name: 'Candid & Drone Photography', cost: '12%', color: 'bg-amber-500' },
        { name: 'DJ & Sound Production', cost: '8%', color: 'bg-emerald-500' },
      ],
    },
    birthday: {
      title: 'Milestone Birthdays & Celebrations',
      subtitle: 'From 1st birthday wonderlands to 50th gala nights with zero stress.',
      icon: Cake,
      tag: 'Birthdays',
      sampleBudget: currency === 'INR' ? '₹65,000' : '$2,500',
      sampleGuests: '60 Guests',
      features: [
        'Neon & Glow-in-the-dark or Boho theme generator',
        'Custom cake and street-food live counters optimization',
        'Interactive party games & DJ playlist suggestions',
        'Digital invites with live WhatsApp RSVP link',
      ],
      sampleCategories: [
        { name: 'Venue & Lounge Space', cost: '30%', color: 'bg-indigo-500' },
        { name: 'Sliders & Mocktails Catering', cost: '35%', color: 'bg-purple-500' },
        { name: 'LED Neon Balloon Arch', cost: '18%', color: 'bg-pink-500' },
        { name: 'Party DJ & Sound Kit', cost: '10%', color: 'bg-amber-500' },
        { name: 'Custom Fondant Cake', cost: '7%', color: 'bg-emerald-500' },
      ],
    },
    community: {
      title: 'College Fests & Community Gatherings',
      subtitle: 'High-energy festivals, charity galas, and cultural reunions with transparent funds tracking.',
      icon: Flame,
      tag: 'Community & College',
      sampleBudget: currency === 'INR' ? '₹2,50,000' : '$5,000',
      sampleGuests: '400 Attendees',
      features: [
        'Trussing, stage audio, and sound permits timeline',
        'High-capacity food stalls & hydration management',
        'Volunteer task delegation with priority deadlines',
        'Real-time remaining balance and sponsor funds ledger',
      ],
      sampleCategories: [
        { name: 'Audio Rig, Lighting & Trussing', cost: '35%', color: 'bg-indigo-500' },
        { name: 'Food Trucks & Refreshments', cost: '30%', color: 'bg-purple-500' },
        { name: 'Campus Permits & Security', cost: '15%', color: 'bg-pink-500' },
        { name: 'Performers & Headliners', cost: '12%', color: 'bg-amber-500' },
        { name: 'Branding & Flex Banners', cost: '8%', color: 'bg-emerald-500' },
      ],
    },
  };

  const currentCase = useCases[activeTab];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Generative AI Event Planner</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Plan Flawless Events in Minutes,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Not Months.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Planora AI generates tailored budgets, adaptive milestone timelines, vendor checklists, and bespoke menus for weddings, birthdays, and celebrations. Features automated <strong>Budget Rescue Mode™</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartPlanning}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition shadow-md shadow-indigo-200 group"
              >
                <span>Generate Your Event Plan</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                <span>View Dashboard</span>
              </button>
            </div>

            {/* Key trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Deterministic Calculations & Safeguards</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>Budget Rescue Mode™ Protection</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>One-Click Executive PDF Export</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Use Cases & Live Sample Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tailored Intelligence for Every Occasion
          </h2>
          <p className="text-sm text-slate-600">
            See how Planora AI dynamically structures logistics, funds, and experiences according to your event type.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 space-x-1">
            <button
              onClick={() => setActiveTab('wedding')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'wedding'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Weddings & Receptions</span>
            </button>
            <button
              onClick={() => setActiveTab('birthday')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'birthday'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake className="w-4 h-4 text-amber-500" />
              <span>Birthdays & Milestones</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center space-x-2 ${
                activeTab === 'community'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span>College & Community</span>
            </button>
          </div>
        </div>

        {/* Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel */}
          <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {currentCase.tag}
              </span>
              <h3 className="text-2xl font-bold text-slate-900">{currentCase.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{currentCase.subtitle}</p>

              <div className="pt-2 space-y-2.5">
                {currentCase.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onStartPlanning}
                className="inline-flex items-center space-x-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
              >
                <span>Plan this event now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Panel: Sample Interactive Plan */}
          <div className="lg:col-span-7 p-8 lg:p-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase">Sample AI Generated Plan</span>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">Budget Allocation Matrix</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Baseline Budget</span>
                <span className="text-lg font-extrabold text-indigo-600">{currentCase.sampleBudget}</span>
              </div>
            </div>

            {/* Visual Category Bars */}
            <div className="space-y-3">
              {currentCase.sampleCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 font-medium">{cat.cost}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: cat.cost }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Callout note */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Autonomous Trade-off Engine: </span>
                If you choose to reduce your overall budget later, Planora will preserve your highest priority areas and automatically offer lower-cost decor and menu alternatives without lowering quality.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Comprehensive Planning Features
          </h2>
          <p className="text-sm text-slate-600">
            Engineered with full financial precision and intelligent contextual assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Budget Rescue Mode™</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When financial limits drop, our system computes real-time alternatives, presents side-by-side comparisons, and requires explicit user approval before applying changes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Adaptive Timeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically schedules tasks by remaining countdown days. Flags urgent dependencies, caterer headcount locks, and on-site checklist inspections.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Executive PDF Export</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export an itemized event summary, complete budget breakdown, vendor quotation directory, and timeline checklist in a print-ready PDF format.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white text-center space-y-5 shadow-xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to plan your next memorable celebration?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto">
            Get an itemized budget, vendor checklist, and personalized AI timeline in under two minutes.
          </p>
          <div className="pt-2">
            <button
              onClick={onStartPlanning}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl text-base font-bold bg-white text-indigo-700 hover:bg-slate-100 active:scale-[0.98] transition shadow-md"
            >
              <span>Launch Event Creator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
