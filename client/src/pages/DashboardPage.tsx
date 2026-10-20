import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  DollarSign,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { EventFullDetail } from '../types';
import { api } from '../services/api';

interface DashboardPageProps {
  onSelectEvent: (eventId: string) => void;
  onCreateNew: () => void;
  currency: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectEvent,
  onCreateNew,
  currency,
}) => {
  const [events, setEvents] = useState<EventFullDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Aggregated metrics
  const totalPlannedSpending = events.reduce((acc, ev) => acc + (ev.metrics?.totalEstimated || 0), 0);
  const totalBudgetAcross = events.reduce((acc, ev) => acc + (Number(ev.budget) || 0), 0);
  const totalPendingTasks = events.reduce((acc, ev) => acc + ((ev.metrics?.tasksTotal || 0) - (ev.metrics?.tasksCompleted || 0)), 0);
  const totalBookedVendors = events.reduce((acc, ev) => acc + (ev.metrics?.vendorsBooked || 0), 0);

  // Filtered events
  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || ev.event_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Event Management Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time spending overview, upcoming deadlines, and AI-optimized itineraries.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition shadow-sm shadow-indigo-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event Plan</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planned Spending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Planned Spending</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {currency} {totalPlannedSpending.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <span>Total allocated across {events.length} events</span>
          </div>
        </div>

        {/* Total Budget Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Budget Limit</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {currency} {totalBudgetAcross.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            {totalBudgetAcross >= totalPlannedSpending ? (
              <span className="text-emerald-600 font-semibold">
                ✓ Remaining Buffer: {currency} {(totalBudgetAcross - totalPlannedSpending).toLocaleString()}
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                ⚠ Over limit by {currency} {(totalPlannedSpending - totalBudgetAcross).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Tasks</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPendingTasks} Tasks</div>
          <div className="text-xs text-slate-500">Requires coordination before event dates</div>
        </div>

        {/* Active Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Events</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{events.length}</div>
          <div className="text-xs text-emerald-600 font-medium">
            {totalBookedVendors} vendor quotes secured
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event title or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Event Types</option>
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
        <div className="p-12 text-center text-slate-400 text-sm space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading your event itineraries...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-bold text-slate-900 text-lg">No Events Found</h3>
            <p className="text-xs text-slate-500">
              {events.length === 0
                ? "You haven't generated any event plans yet. Create your first wedding, birthday, or community gathering now."
                : 'No events match your current filter search.'}
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
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
                onClick={() => onSelectEvent(evt.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer p-6 flex flex-col justify-between group space-y-4"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {evt.event_type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        daysLeft > 14
                          ? 'bg-slate-100 text-slate-700'
                          : daysLeft > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {daysLeft > 0 ? `${daysLeft} days away` : 'Today / Past'}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, evt.id)}
                        disabled={deletingId === evt.id}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                      <span>{evt.location}</span>
                      <span>•</span>
                      <span>{evt.guest_count} guests</span>
                    </p>
                  </div>
                </div>

                {/* Card Middle: Budget Usage Indicator */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Budget Usage</span>
                    <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-800'}`}>
                      {evt.currency} {evt.metrics.totalEstimated.toLocaleString()} / {evt.currency} {Number(evt.budget).toLocaleString()}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : budgetUsedFraction > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsedFraction)}%` }}
                    />
                  </div>
                </div>

                {/* Card Bottom: Tasks & Quick Action */}
                <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{evt.metrics.tasksCompleted}/{evt.metrics.tasksTotal} tasks</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>{evt.metrics.vendorsBooked} vendors</span>
                  </div>

                  <span className="font-bold text-indigo-600 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
