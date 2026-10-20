import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  ShieldAlert,
  Download,
  Plus,
  Trash2,
  Bot,
  RefreshCw,
  AlertTriangle,
  Users,
  MapPin,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type {
  EventFullDetail,
  TaskItem,
  TaskPriority,
  TaskStatus,
  VendorBookingStatus,
} from '../types';
import { api } from '../services/api';
import { exportEventToPDF } from '../services/pdfExport';
import { BudgetRescueModal } from '../components/BudgetRescueModal';
import { AIAssistantDrawer } from '../components/AIAssistantDrawer';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  currency: string;
}

type TabType = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  onBack,
  currency: globalCurrency,
}) => {
  const [event, setEvent] = useState<EventFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Modal / Inline Add state
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('Venue');
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetCost, setNewBudgetCost] = useState<number>(0);
  const [newBudgetNotes, setNewBudgetNotes] = useState('');

  // Task Add state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Vendor Add state
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorCategory, setNewVendorCategory] = useState('Venue');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorQuote, setNewVendorQuote] = useState<number>(0);
  const [newVendorStatus, setNewVendorStatus] = useState<VendorBookingStatus>('researching');

  const fetchEvent = async () => {
    try {
      const data = await api.getEvent(eventId);
      setEvent(data);
    } catch (err) {
      alert(`Error loading event: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Code Optimality: Memoize category groups and chart data
  const chartData = useMemo(() => {
    if (!event) return [];
    const categoryGroups: Record<string, number> = {};
    for (const b of event.budget_items) {
      categoryGroups[b.category] = (categoryGroups[b.category] || 0) + (Number(b.estimated_cost) || 0);
    }
    return Object.keys(categoryGroups).map(cat => ({
      name: cat,
      amount: categoryGroups[cat],
    }));
  }, [event?.budget_items]);

  if (loading || !event) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3"
      >
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-slate-500 text-sm">Loading event itinerary & budget data...</p>
        <span className="sr-only">Loading event details</span>
      </div>
    );
  }

  const currency = event.currency || globalCurrency || 'INR';
  const totalBudget = Number(event.budget) || 0;
  const totalEstimated = event.metrics.totalEstimated;
  const totalActual = event.metrics.totalActual;
  const remainingBalance = event.metrics.remainingBalance;
  const isOverBudget = (totalActual > 0 ? totalActual : totalEstimated) > totalBudget;

  const daysLeft = Math.ceil(
    (new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Handle Regenerate Plan
  const handleRegeneratePlan = async () => {
    if (!window.confirm('Regenerate AI plan? This will replace your current AI-suggested estimates with a freshly optimized version.')) {
      return;
    }
    setIsRegenerating(true);
    try {
      const updated = await api.regeneratePlan(event.id);
      setEvent(updated);
    } catch (err) {
      alert(`Regeneration failed: ${(err as Error).message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Budget Handlers
  const handleCreateBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName.trim() || newBudgetCost < 0) return;
    try {
      await api.addBudgetItem(event.id, {
        category: newBudgetCategory,
        name: newBudgetName,
        estimated_cost: Number(newBudgetCost),
        actual_cost: 0,
        paid_amount: 0,
        notes: newBudgetNotes,
        status: 'estimated',
      });
      setShowAddBudgetModal(false);
      setNewBudgetName('');
      setNewBudgetCost(0);
      setNewBudgetNotes('');
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteBudgetItem = async (id: string) => {
    if (!window.confirm('Delete this budget line item?')) return;
    try {
      await api.deleteBudgetItem(id);
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Task Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api.addTask(event.id, {
        title: newTaskTitle,
        category: newTaskCategory,
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        status: 'pending',
      });
      setShowAddTaskModal(false);
      setNewTaskTitle('');
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTask(task.id, { status: nextStatus });
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Vendor Handlers
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;
    try {
      await api.addVendor(event.id, {
        category: newVendorCategory,
        name: newVendorName,
        contact_name: newVendorContact,
        contact_phone: newVendorPhone,
        quoted_amount: Number(newVendorQuote),
        estimated_budget: Number(newVendorQuote),
        booking_status: newVendorStatus,
        payment_status: 'unpaid',
        is_ai_estimate: false,
      });
      setShowAddVendorModal(false);
      setNewVendorName('');
      setNewVendorContact('');
      setNewVendorPhone('');
      setNewVendorQuote(0);
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!window.confirm('Delete vendor entry?')) return;
    try {
      await api.deleteVendor(id);
      fetchEvent();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9 space-y-7">
      {/* Top Banner Navigation & Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-7 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition mb-1 inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>← Back to Command Center</span>
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {event.title}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {event.event_type}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{event.event_date} {event.start_time ? `(${event.start_time} - ${event.end_time || ''})` : ''}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">•</span>
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{event.location} ({event.indoor_outdoor})</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">•</span>
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{event.guest_count} Confirmed Guests</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Signature Budget Rescue Trigger */}
            <button
              type="button"
              onClick={() => setShowRescueModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-amber-50/90 border border-amber-300 text-amber-950 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-500 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>Budget Rescue Mode™</span>
            </button>

            {/* AI Assistant Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowAssistantDrawer(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Bot className="w-4 h-4 text-indigo-300" aria-hidden="true" />
              <span>AI Copilot</span>
            </button>

            {/* PDF Export */}
            <button
              type="button"
              onClick={() => exportEventToPDF(event)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-2xs cursor-pointer"
              title="Download Printable PDF Master Plan"
            >
              <Download className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>PDF Export</span>
            </button>

            {/* Regenerate AI Plan */}
            <button
              type="button"
              onClick={handleRegeneratePlan}
              disabled={isRegenerating}
              aria-label="Regenerate Plan with AI"
              className="p-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
              title="Regenerate Plan with AI"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`} aria-hidden="true" />
              <span className="sr-only">Regenerate Plan with AI</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip: Modern Financial Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Target Budget</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              {currency} {totalBudget.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Allocated Expenses</span>
            <span className="text-xl font-extrabold text-indigo-700 tracking-tight block">
              {currency} {totalEstimated.toLocaleString()}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${remainingBalance >= 0 ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {remainingBalance >= 0 ? 'Remaining Buffer' : 'Budget Overrun'}
            </span>
            <span className={`text-xl font-extrabold tracking-tight block ${remainingBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              {currency} {Math.abs(remainingBalance).toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Milestone Timeline</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              {daysLeft > 0 ? `${daysLeft} Days to Event` : 'Event Day / Past'}
            </span>
          </div>
        </div>

        {/* Overspending Warning Banner */}
        {isOverBudget && (
          <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" aria-hidden="true" />
              <span>
                <strong>Budget Warning:</strong> Your planned expenses exceed the allocated budget by {currency} {(totalEstimated - totalBudget).toLocaleString()}.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRescueModal(true)}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900 ml-3 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-rose-500 rounded cursor-pointer"
            >
              Launch Budget Rescue →
            </button>
          </div>
        )}
      </div>

      {/* Tabs Navigation with accessible ARIA Tablist */}
      <div
        role="tablist"
        aria-label="Event plan sections"
        className="flex items-center space-x-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70 overflow-x-auto w-fit"
      >
        {[
          { id: 'overview', label: '1. Executive Strategy' },
          { id: 'budget', label: `2. Budget Manager (${event.budget_items.length})` },
          { id: 'timeline', label: `3. Timeline & Tasks (${event.tasks.length})` },
          { id: 'vendors', label: `4. Vendor Directory (${event.vendors.length})` },
          { id: 'ideas', label: `5. Creative Themes (${event.ideas.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 text-xs sm:text-sm font-bold whitespace-nowrap rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeTab === tab.id
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div
          role="tabpanel"
          id="panel-overview"
          aria-labelledby="tab-overview"
          className="space-y-6"
        >
          {/* AI Executive Strategy Card */}
          {event.ai_summary && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600" aria-hidden="true">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">EventPilot AI Executive Strategy</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                {event.ai_summary}
              </p>
            </div>
          )}

          {/* Quick Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending Breakdown Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Estimated Spending by Category</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Estimated']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Preparation Milestones Progress */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Key Priority Tasks</h3>
                <p className="text-xs text-slate-500 mt-0.5">Urgent and high-priority preparation milestones</p>

                <div className="space-y-2.5 mt-4">
                  {event.tasks
                    .filter(t => t.priority === 'urgent' || t.priority === 'high')
                    .slice(0, 4)
                    .map((t) => (
                      <div
                        key={t.id}
                        role="checkbox"
                        aria-checked={t.status === 'completed'}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            handleToggleTaskStatus(t);
                          }
                        }}
                        onClick={() => handleToggleTaskStatus(t)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          t.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-60 line-through'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            aria-hidden="true"
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              t.status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {t.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="font-medium text-slate-800">{t.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {event.metrics.tasksCompleted} of {event.metrics.tasksTotal} tasks completed
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded flex items-center space-x-1"
                >
                  <span>View All Tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Budget Manager */}
      {activeTab === 'budget' && (
        <div
          role="tabpanel"
          id="panel-budget"
          aria-labelledby="tab-budget"
          className="space-y-6"
        >
          {/* Header Action */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Itemized Budget Manager</h2>
              <p className="text-xs text-slate-500">
                All allocations are calculated in backend application logic to maintain strict accuracy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddBudgetModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Expense Item</span>
            </button>
          </div>

          {/* Budget Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <caption className="sr-only">Itemized Budget Items Table</caption>
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Category</th>
                    <th scope="col" className="py-3.5 px-4">Expense Item</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Estimated ({currency})</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actual Cost</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {event.budget_items.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 px-2 py-0.5 rounded bg-slate-100 text-xs">
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{b.name}</div>
                        {b.notes && <div className="text-[11px] text-slate-400 mt-0.5">{b.notes}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {currency} {Number(b.estimated_cost).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {Number(b.actual_cost) > 0 ? `${currency} ${Number(b.actual_cost).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteBudgetItem(b.id)}
                          aria-label={`Delete ${b.name}`}
                          className="p-1 rounded text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50/90 border-t border-slate-200 font-bold text-slate-900 text-xs sm:text-sm">
                  <tr>
                    <td className="py-3.5 px-4" colSpan={2}>
                      Total Calculated Spending ({event.budget_items.length} items)
                    </td>
                    <td className="py-3.5 px-4 text-right text-indigo-700">
                      {currency} {totalEstimated.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currency} {totalActual.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4" colSpan={2}>
                      <span className={remainingBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        Remaining: {currency} {remainingBalance.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Timeline & Tasks */}
      {activeTab === 'timeline' && (
        <div
          role="tabpanel"
          id="panel-timeline"
          aria-labelledby="tab-timeline"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Timeline Milestones & Task Manager</h2>
              <p className="text-xs text-slate-500">
                Chronologically ordered based on your event date ({event.event_date}).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {event.tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : task.priority === 'urgent'
                      ? 'bg-red-50/30 border-red-200 shadow-2xs'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />}
                    </button>

                    <div>
                      <div className={`font-semibold text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-600">{task.category}</span>
                        <span aria-hidden="true">•</span>
                        <span>
                          {task.due_date
                            ? `Due: ${task.due_date}`
                            : task.days_before_event !== undefined
                            ? `T-${task.days_before_event} Days`
                            : 'Pending Schedule'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      task.priority === 'urgent'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label={`Delete task ${task.title}`}
                      className="p-1 rounded text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Vendor Manager */}
      {activeTab === 'vendors' && (
        <div
          role="tabpanel"
          id="panel-vendors"
          aria-labelledby="tab-vendors"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vendor Management & Quotation Compare</h2>
              <p className="text-xs text-slate-500">
                Track contractor contacts, compare quotes, and monitor booking confirmations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVendorModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Vendor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {vendor.category}
                    </span>
                    {vendor.is_ai_estimate ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        AI Estimate
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Manual Quote
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    {vendor.contact_name && <div>Contact: {vendor.contact_name}</div>}
                    {vendor.contact_phone && <div>Phone: {vendor.contact_phone}</div>}
                    {vendor.notes && <div className="italic text-slate-400 mt-1">{vendor.notes}</div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Quote / Budget</span>
                    <span className="text-sm font-bold text-indigo-700">
                      {currency} {Number(vendor.quoted_amount > 0 ? vendor.quoted_amount : vendor.estimated_budget).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                      {vendor.booking_status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      aria-label={`Delete vendor ${vendor.name}`}
                      className="text-slate-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 p-1 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Creative Themes & Menus */}
      {activeTab === 'ideas' && (
        <div
          role="tabpanel"
          id="panel-ideas"
          aria-labelledby="tab-ideas"
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personalized Themes, Menus & Activities</h2>
              <p className="text-xs text-slate-500">
                Curated AI concepts tailored to your culture ({event.cultural_preference || 'Standard'}), dietary preferences, and venue scale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    idea.type === 'theme'
                      ? 'bg-pink-50 text-pink-700'
                      : idea.type === 'menu'
                      ? 'bg-purple-50 text-purple-700'
                      : idea.type === 'decoration'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {idea.type}
                  </span>
                  {idea.estimated_cost > 0 && (
                    <span className="text-xs font-semibold text-slate-600">
                      Est: {currency} {Number(idea.estimated_cost).toLocaleString()}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base">{idea.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{idea.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Budget Item */}
      {showAddBudgetModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-budget-title"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 id="modal-add-budget-title" className="font-bold text-slate-900 text-lg">
              Add Expense Line Item
            </h3>
            <form onSubmit={handleCreateBudgetItem} className="space-y-3">
              <div>
                <label htmlFor="budget-item-category" className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="budget-item-category"
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Photography">Photography</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Invitations">Invitations</option>
                  <option value="Transport">Transport</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget-item-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name
                </label>
                <input
                  id="budget-item-name"
                  type="text"
                  required
                  placeholder="e.g. Wedding Cake, Floral Mandap"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="budget-item-cost" className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Cost ({currency})
                </label>
                <input
                  id="budget-item-cost"
                  type="number"
                  required
                  min="0"
                  value={newBudgetCost}
                  onChange={(e) => setNewBudgetCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="budget-item-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  id="budget-item-notes"
                  type="text"
                  placeholder="e.g. Includes delivery & setup"
                  value={newBudgetNotes}
                  onChange={(e) => setNewBudgetNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBudgetModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-task-title"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 id="modal-add-task-title" className="font-bold text-slate-900 text-lg">
              Add Preparation Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label htmlFor="task-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  placeholder="e.g. Taste test dessert samples"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="task-category-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    id="task-category-input"
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="task-priority-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="task-priority-input"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="task-duedate-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  id="task-duedate-input"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vendor */}
      {showAddVendorModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-vendor-title"
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 id="modal-add-vendor-title" className="font-bold text-slate-900 text-lg">
              Add Vendor Quotation
            </h3>
            <form onSubmit={handleCreateVendor} className="space-y-3">
              <div>
                <label htmlFor="vendor-category-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="vendor-category-select"
                  value={newVendorCategory}
                  onChange={(e) => setNewVendorCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="Venue">Venue</option>
                  <option value="Catering">Catering</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Photography">Photography</option>
                  <option value="Music">Music / DJ</option>
                  <option value="Transport">Transport</option>
                  <option value="Cake">Cake & Bakery</option>
                  <option value="Other">Other Services</option>
                </select>
              </div>

              <div>
                <label htmlFor="vendor-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Vendor / Business Name
                </label>
                <input
                  id="vendor-name-input"
                  type="text"
                  required
                  placeholder="e.g. Royal Blooms Floral Design"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="vendor-contact-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    id="vendor-contact-input"
                    type="text"
                    value={newVendorContact}
                    onChange={(e) => setNewVendorContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-phone-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="vendor-phone-input"
                    type="tel"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="vendor-quote-input" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quotation Amount ({currency})
                  </label>
                  <input
                    id="vendor-quote-input"
                    type="number"
                    min="0"
                    value={newVendorQuote}
                    onChange={(e) => setNewVendorQuote(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="vendor-status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    id="vendor-status-select"
                    value={newVendorStatus}
                    onChange={(e) => setNewVendorStatus(e.target.value as VendorBookingStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signature Feature: Budget Rescue Modal */}
      <BudgetRescueModal
        event={event}
        isOpen={showRescueModal}
        onClose={() => setShowRescueModal(false)}
        onRescueApplied={(updated) => {
          setEvent(updated);
        }}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        event={event}
        isOpen={showAssistantDrawer}
        onClose={() => setShowAssistantDrawer(false)}
        onPlanUpdated={(updated) => {
          setEvent(updated);
        }}
        onTriggerBudgetRescue={() => {
          setShowAssistantDrawer(false);
          setShowRescueModal(true);
        }}
      />
    </div>
  );
};
