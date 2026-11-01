import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Shield,
  Download,
  Bot,
  RefreshCw,
  AlertTriangle,
  Users,
  MapPin,
} from 'lucide-react';
import type {
  EventFullDetail,
  TaskItem,
  TaskPriority,
  VendorBookingStatus,
} from '../types';
import { api } from '../services/api';
import { exportEventToPDF } from '../services/pdfExport';
import { BudgetRescueModal } from '../components/BudgetRescueModal';
import { AIAssistantDrawer } from '../components/AIAssistantDrawer';
import { CollaboratorsModal } from '../components/CollaboratorsModal';
import { AuditTrailModal } from '../components/AuditTrailModal';
import { PlanningFlowStepper, TabType } from '../components/event-detail/PlanningFlowStepper';
import { OverviewTab } from '../components/event-detail/OverviewTab';
import { BudgetTab } from '../components/event-detail/BudgetTab';
import { TimelineTab } from '../components/event-detail/TimelineTab';
import { VendorsTab } from '../components/event-detail/VendorsTab';
import { IdeasTab } from '../components/event-detail/IdeasTab';
import { AddBudgetItemModal } from '../components/event-detail/AddBudgetItemModal';
import { AddTaskModal } from '../components/event-detail/AddTaskModal';
import { AddVendorModal } from '../components/event-detail/AddVendorModal';

interface EventDetailPageProps {
  eventId: string;
  onBack: () => void;
  currency: string;
  initialEvent?: EventFullDetail;
  onTitleLoaded?: (title: string) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  eventId,
  onBack,
  currency: globalCurrency,
  initialEvent,
  onTitleLoaded,
}) => {
  const [event, setEvent] = useState<EventFullDetail | null>(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [showAssistantDrawer, setShowAssistantDrawer] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Modals
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const data = await api.getEvent(eventId);
      setEvent(data);
      if (onTitleLoaded && data.title) onTitleLoaded(data.title);
    } catch (err) {
      alert(`Error loading event: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, onTitleLoaded]);

  useEffect(() => {
    if (!initialEvent) {
      fetchEvent();
    }
  }, [fetchEvent, initialEvent]);

  const currency = event?.currency || globalCurrency || 'USD';

  // Deterministic financial calculations
  const totalBudget = Number(event?.budget || 0);
  const budgetItems = event?.budget_items;
  const totalEstimated = useMemo(() => {
    return (budgetItems || []).reduce((acc, b) => acc + Number(b.estimated_cost || 0), 0);
  }, [budgetItems]);

  const totalActual = useMemo(() => {
    return (budgetItems || []).reduce((acc, b) => acc + Number(b.actual_cost || 0), 0);
  }, [budgetItems]);

  const remainingBalance = totalBudget - totalEstimated;
  const isOverBudget = remainingBalance < 0;

  // Chart aggregation
  const chartData = useMemo(() => {
    if (!budgetItems) return [];
    const catMap: Record<string, number> = {};
    for (const b of budgetItems) {
      catMap[b.category] = (catMap[b.category] || 0) + Number(b.estimated_cost || 0);
    }
    return Object.entries(catMap).map(([name, amount]) => ({ name, amount }));
  }, [budgetItems]);

  // Days left calculation
  const eventDate = event?.event_date;
  const daysLeft = useMemo(() => {
    if (!eventDate) return 0;
    const diff = new Date(eventDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [eventDate]);

  // Mutation Handlers
  const handleToggleTaskStatus = async (task: TaskItem) => {
    if (!event) return;
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updatedTask = await api.updateTask(task.id, { status: nextStatus });
      setEvent({
        ...event,
        tasks: event.tasks.map((t) => (t.id === task.id ? updatedTask : t)),
        metrics: {
          ...event.metrics,
          tasksCompleted: event.metrics.tasksCompleted + (nextStatus === 'completed' ? 1 : -1),
        },
      });
    } catch (err) {
      alert(`Failed to update task: ${(err as Error).message}`);
    }
  };

  const handleDeleteBudgetItem = async (id: string) => {
    if (!event || !confirm('Are you sure you want to remove this expense line item?')) return;
    try {
      await api.deleteBudgetItem(id);
      fetchEvent();
    } catch (err) {
      alert(`Failed to delete item: ${(err as Error).message}`);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!event || !confirm('Are you sure you want to remove this task milestone?')) return;
    try {
      await api.deleteTask(id);
      fetchEvent();
    } catch (err) {
      alert(`Failed to delete task: ${(err as Error).message}`);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!event || !confirm('Are you sure you want to remove this vendor record?')) return;
    try {
      await api.deleteVendor(id);
      fetchEvent();
    } catch (err) {
      alert(`Failed to delete vendor: ${(err as Error).message}`);
    }
  };

  const handleCreateBudgetItem = async (item: {
    category: string;
    name: string;
    estimated_cost: number;
    notes?: string;
  }) => {
    if (!event) return;
    await api.addBudgetItem(event.id, {
      category: item.category,
      name: item.name,
      estimated_cost: item.estimated_cost,
      actual_cost: 0,
      paid_amount: 0,
      notes: item.notes,
      status: 'estimated',
    });
    fetchEvent();
  };

  const handleCreateTask = async (task: {
    title: string;
    category: string;
    priority: TaskPriority;
    due_date?: string;
  }) => {
    if (!event) return;
    await api.addTask(event.id, {
      title: task.title,
      category: task.category,
      priority: task.priority,
      status: 'pending',
      due_date: task.due_date,
    });
    fetchEvent();
  };

  const handleCreateVendor = async (vendor: {
    category: string;
    name: string;
    contact_name?: string;
    contact_phone?: string;
    quoted_amount: number;
    booking_status: VendorBookingStatus;
  }) => {
    if (!event) return;
    await api.addVendor(event.id, {
      category: vendor.category,
      name: vendor.name,
      contact_name: vendor.contact_name,
      contact_phone: vendor.contact_phone,
      quoted_amount: vendor.quoted_amount,
      estimated_budget: vendor.quoted_amount,
      booking_status: vendor.booking_status,
      is_ai_estimate: false,
    });
    fetchEvent();
  };

  const handleRegeneratePlan = async () => {
    if (!event) return;
    if (
      !confirm(
        'Regenerate plan? This uses Gemini AI to refresh your event ideas and baseline allocations while retaining custom edits.'
      )
    )
      return;

    setIsRegenerating(true);
    try {
      await api.regeneratePlan(event.id);
      await fetchEvent();
    } catch (err) {
      alert(`Regeneration failed: ${(err as Error).message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">Loading master event plan...</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mb-2 flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded cursor-pointer"
          >
            <span>← Back to My Events</span>
          </button>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {event.title}
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {event.event_type}
            </span>
            {event.user_role && (
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  event.user_role === 'owner'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : event.user_role === 'editor'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Role: {event.user_role}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{event.event_date}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{event.location}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{event.guest_count} Guests Expected</span>
            </span>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Assistant Copilot Trigger */}
          <button
            type="button"
            onClick={() => setShowAssistantDrawer(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" aria-hidden="true" />
            <span>AI Copilot</span>
          </button>

          {/* Regenerate with AI */}
          <button
            type="button"
            disabled={isRegenerating}
            onClick={handleRegeneratePlan}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRegenerating ? 'Generating...' : 'Refresh AI'}</span>
          </button>

          {/* Collaborators Modal (RBAC) */}
          <button
            type="button"
            onClick={() => setShowCollaboratorsModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Team ({event.collaborators?.length || 1})</span>
          </button>

          {/* Audit Trail Modal */}
          <button
            type="button"
            onClick={() => setShowAuditTrailModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            title="View Forensic Audit Trail"
          >
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Audit</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={() => exportEventToPDF(event)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Allocated</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              {currency} {totalBudget.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Estimated Total</span>
            <span className={`text-xl font-extrabold tracking-tight block ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
              {currency} {totalEstimated.toLocaleString()}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${remainingBalance >= 0 ? 'bg-emerald-50/60 border-emerald-200/70' : 'bg-rose-50/60 border-rose-200/70'}`}>
            <span className={`text-[10px] font-bold block uppercase tracking-wider ${remainingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
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

      {/* Interactive Guided Planning Stepper */}
      <PlanningFlowStepper
        event={event}
        currency={currency}
        activeTab={activeTab}
        isOverBudget={isOverBudget}
        totalEstimated={totalEstimated}
        totalBudget={totalBudget}
        daysLeft={daysLeft}
        onSelectTab={setActiveTab}
        onOpenRescueModal={() => setShowRescueModal(true)}
        onExportPDF={() => exportEventToPDF(event)}
      />

      {/* Tabs Navigation */}
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

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <OverviewTab
          event={event}
          currency={currency}
          chartData={chartData}
          onToggleTaskStatus={handleToggleTaskStatus}
          onNavigateTimeline={() => setActiveTab('timeline')}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetTab
          event={event}
          currency={currency}
          totalEstimated={totalEstimated}
          totalActual={totalActual}
          remainingBalance={remainingBalance}
          onOpenAddBudgetModal={() => setShowAddBudgetModal(true)}
          onDeleteBudgetItem={handleDeleteBudgetItem}
        />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab
          event={event}
          onOpenAddTaskModal={() => setShowAddTaskModal(true)}
          onToggleTaskStatus={handleToggleTaskStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeTab === 'vendors' && (
        <VendorsTab
          event={event}
          currency={currency}
          onOpenAddVendorModal={() => setShowAddVendorModal(true)}
          onDeleteVendor={handleDeleteVendor}
        />
      )}

      {activeTab === 'ideas' && (
        <IdeasTab
          event={event}
          currency={currency}
        />
      )}

      {/* Modals */}
      <AddBudgetItemModal
        isOpen={showAddBudgetModal}
        currency={currency}
        onClose={() => setShowAddBudgetModal(false)}
        onSubmit={handleCreateBudgetItem}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleCreateTask}
      />

      <AddVendorModal
        isOpen={showAddVendorModal}
        currency={currency}
        onClose={() => setShowAddVendorModal(false)}
        onSubmit={handleCreateVendor}
      />

      {/* Signature Feature: Budget Rescue Modal */}
      <BudgetRescueModal
        event={event}
        isOpen={showRescueModal}
        onClose={() => setShowRescueModal(false)}
        onRescueApplied={(updated) => {
          setEvent(updated);
        }}
      />

      {/* Team Collaborators Modal (RBAC) */}
      <CollaboratorsModal
        eventId={event.id}
        isOpen={showCollaboratorsModal}
        onClose={() => {
          setShowCollaboratorsModal(false);
          fetchEvent();
        }}
        isOwner={event.user_role !== 'viewer'}
      />

      {/* Forensic Audit Trail Modal */}
      <AuditTrailModal
        eventId={event.id}
        isOpen={showAuditTrailModal}
        onClose={() => setShowAuditTrailModal(false)}
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
