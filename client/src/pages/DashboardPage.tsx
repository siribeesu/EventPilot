import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  DollarSign,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { type EventFullDetail, getCurrencySymbol } from '../types';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { OnboardingChecklist } from '../components/OnboardingChecklist';

interface DashboardPageProps {
  onSelectEvent: (eventId: string, title?: string) => void;
  onCreateNew: () => void;
  currency: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectEvent,
  onCreateNew,
  currency,
}) => {
  const sym = getCurrencySymbol(currency);
  const [events, setEvents] = useState<EventFullDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);
  const [filterType, setFilterType] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this event and its full plan?')) {
      return;
    }
    setDeletingId(id);
    try {
      await api.deleteEvent(id);
      setEvents(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(`Failed to delete event: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Code Optimality: Memoize aggregated metrics to prevent redundant calculations
  const { totalPlannedSpending, totalBudgetAcross, totalPendingTasks, totalBookedVendors } = useMemo(() => {
    let planned = 0;
    let budget = 0;
    let pending = 0;
    let booked = 0;

    for (const e of events) {
      planned += e.metrics.totalEstimated;
      budget += e.budget;
      pending += (e.metrics.tasksTotal - e.metrics.tasksCompleted);
      booked += e.metrics.vendorsBooked;
    }

    return {
      totalPlannedSpending: planned,
      totalBudgetAcross: budget,
      totalPendingTasks: pending,
      totalBookedVendors: booked,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch =
        e.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesType = filterType === 'all' || e.event_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [events, debouncedSearchQuery, filterType]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Command Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Portfolio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Event Management Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Real-time expenditure tracking, preparation milestones, and GenAI-optimized itineraries.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98] transition shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" aria-hidden="true" />
          <span>New Event Plan</span>
        </button>
      </div>


      {/* Active In-Progress Event Spotlight (Zero-Friction Quick Jump) */}
      {events.length > 0 && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white border border-indigo-500/30 shadow-xl shadow-indigo-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                Primary Celebration Spotlight
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-white/90 font-medium">{events[0].location}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {events[0].title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 text-white">
                Target Budget: <strong className="text-white">{currency} {Number(events[0].budget).toLocaleString()}</strong>
              </span>
              <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 text-white">
                Allocated: <strong className="text-white">{currency} {events[0].metrics.totalEstimated.toLocaleString()}</strong>
              </span>
              <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 text-white">
                Guests: <strong className="text-white">{events[0].guest_count}</strong>
              </span>
              <span className="bg-white/15 px-2.5 py-1 rounded-lg border border-white/20 text-white">
                Tasks Pending: <strong className="text-amber-300">{events[0].metrics.tasksTotal - events[0].metrics.tasksCompleted}</strong>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => onSelectEvent(events[0].id, events[0].title)}
              className="px-6 py-3.5 rounded-2xl bg-white text-indigo-950 hover:bg-slate-50 font-extrabold text-sm shadow-lg transition flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>Resume Planning Studio</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Guided Quickstart Onboarding */}
      <OnboardingChecklist
        eventsCount={events.length}
        hasBudgetItems={events.some(e => (e.budget_items?.length || 0) > 0)}
        onNewEvent={onCreateNew}
      />

      {/* Aggregate Stats Cards: Bento 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Planned Spending */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Planned Spending</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600" aria-hidden="true">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {sym}{totalPlannedSpending.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
            <span>Allocated across {events.length} planned celebrations</span>
          </div>
        </div>

        {/* Card 2: Total Budget Target */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Budget Limit</span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600" aria-hidden="true">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {sym}{totalBudgetAcross.toLocaleString()}
          </div>
          <div className="text-xs font-medium">
            {totalBudgetAcross >= totalPlannedSpending ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ Remaining Buffer: {sym} {(totalBudgetAcross - totalPlannedSpending).toLocaleString()}
              </span>
            ) : (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-bold">
                ⚠️ Over Limit: {sym} {(totalPlannedSpending - totalBudgetAcross).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Pending Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Pending Deadlines</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600" aria-hidden="true">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalPendingTasks} Tasks</div>
          <div className="text-xs text-slate-500 font-medium">Actionable preparation milestones</div>
        </div>

        {/* Card 4: Active Events & Vendors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Events</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600" aria-hidden="true">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{events.length}</div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{totalBookedVendors} confirmed vendor quotations</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with accessible labels */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <label htmlFor="dashboard-search-input" className="sr-only">
            Search events by title or city
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="dashboard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search celebrations or venues..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="dashboard-type-filter" className="sr-only">
            Filter by event category
          </label>
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <select
            id="dashboard-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Event Categories</option>
            <option value="wedding">Weddings</option>
            <option value="birthday">Birthdays</option>
            <option value="anniversary">Anniversaries</option>
            <option value="college">College Festivals</option>
            <option value="community">Community Gatherings</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="p-16 text-center text-slate-400 text-sm space-y-3"
        >
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
          <p className="font-medium text-slate-500">Loading your event portfolio...</p>
          <span className="sr-only">Loading events</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto" aria-hidden="true">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 text-lg">No Events Found</h3>
            <p className="text-xs text-slate-500">
              {events.length === 0
                ? "You haven't generated any event plans yet. Launch our wizard to generate your first tailored itinerary."
                : 'No celebrations match your current search query or category filter.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-300" aria-hidden="true" />
            <span>Create First Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const daysLeft = Math.ceil((new Date(evt.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const budgetUsedFraction = evt.budget > 0 ? (evt.metrics.totalEstimated / evt.budget) * 100 : 0;
            const isOverBudget = evt.metrics.totalEstimated > evt.budget;

            return (
              <div
                key={evt.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEvent(evt.id, evt.title);
                  }
                }}
                onClick={() => onSelectEvent(evt.id, evt.title)}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all cursor-pointer p-6 flex flex-col justify-between group space-y-5"
              >
                {/* Card Top */}
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {evt.event_type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        daysLeft > 14
                          ? 'bg-slate-100 text-slate-700'
                          : daysLeft > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {daysLeft > 0 ? `T-${daysLeft} Days` : 'Celebration Today'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, evt.id)}
                        disabled={deletingId === evt.id}
                        aria-label={`Delete event ${evt.title}`}
                        className="text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Delete event</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1 tracking-tight">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5 font-medium">
                      <span>{evt.location}</span>
                      <span aria-hidden="true">•</span>
                      <span>{evt.guest_count} attendees</span>
                    </p>
                  </div>
                </div>

                {/* Card Middle: Budget Usage Indicator */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Budget Allocation</span>
                    <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {evt.currency} {evt.metrics.totalEstimated.toLocaleString()} / {evt.currency} {Number(evt.budget).toLocaleString()}
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(budgetUsedFraction)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Budget usage: ${Math.round(budgetUsedFraction)} percent`}
                    className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-rose-500' : budgetUsedFraction > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsedFraction)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <div className="flex items-center space-x-1 text-[11px] text-rose-600 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Exceeds target by {evt.currency} {(evt.metrics.totalEstimated - evt.budget).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Tasks & Quick Action */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                      <span>{evt.metrics.tasksCompleted}/{evt.metrics.tasksTotal} tasks</span>
                    </span>
                    <span className="text-slate-300" aria-hidden="true">|</span>
                    <span>{evt.metrics.vendorsBooked} booked</span>
                  </div>

                  <span className="font-bold text-indigo-600 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
