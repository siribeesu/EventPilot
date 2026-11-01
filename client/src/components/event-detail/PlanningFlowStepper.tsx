import React from 'react';
import { Sparkles, Download } from 'lucide-react';
import type { EventFullDetail } from '../../types';

export type TabType = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';

interface PlanningFlowStepperProps {
  event: EventFullDetail;
  currency: string;
  activeTab: TabType;
  isOverBudget: boolean;
  totalEstimated: number;
  totalBudget: number;
  daysLeft: number;
  onSelectTab: (tab: TabType) => void;
  onOpenRescueModal: () => void;
  onExportPDF: () => void;
}

export const PlanningFlowStepper: React.FC<PlanningFlowStepperProps> = ({
  event,
  currency,
  activeTab,
  isOverBudget,
  totalEstimated,
  totalBudget,
  daysLeft,
  onSelectTab,
  onOpenRescueModal,
  onExportPDF,
}) => {
  const overallProgress = Math.round(
    ((event.metrics.tasksCompleted + event.metrics.vendorsBooked) /
      Math.max(event.metrics.tasksTotal + event.metrics.vendorsTotal, 1)) *
      100
  );

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 text-slate-900 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Guided Planning Flow
          </span>
          <span className="text-slate-500 text-xs hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Follow the 4 phases from vision to celebration</span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <span>Overall Progress:</span>
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {overallProgress}%
          </span>
        </div>
      </div>

      {/* 4 Interactive Milestone Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Step 1: Budget */}
        <button
          type="button"
          onClick={() => onSelectTab('budget')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === 'budget'
              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Phase 1: Budget</span>
            {isOverBudget ? (
              <span className="text-rose-700 text-[10px] font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">⚠️ Deficit</span>
            ) : (
              <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ Balanced</span>
            )}
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1.5">
            {currency} {totalEstimated.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isOverBudget ? `Over by ${currency} ${(totalEstimated - totalBudget).toLocaleString()}` : `${event.budget_items.length} protected line items`}
          </div>
        </button>

        {/* Step 2: Timeline */}
        <button
          type="button"
          onClick={() => onSelectTab('timeline')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Phase 2: Timeline</span>
            <span className="text-indigo-700 text-[10px] font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              {event.metrics.tasksCompleted}/{event.metrics.tasksTotal} Done
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1.5">
            {daysLeft > 0 ? `${daysLeft} Days to Event` : 'Event Day'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {event.metrics.tasksTotal - event.metrics.tasksCompleted} milestones pending
          </div>
        </button>

        {/* Step 3: Vendors */}
        <button
          type="button"
          onClick={() => onSelectTab('vendors')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === 'vendors'
              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Phase 3: Vendors</span>
            <span className="text-amber-800 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              {event.metrics.vendorsBooked}/{event.metrics.vendorsTotal} Booked
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1.5">
            {event.vendors.length} Categories
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Quotes & contract tracking
          </div>
        </button>

        {/* Step 4: Creative & PDF */}
        <button
          type="button"
          onClick={() => onSelectTab('ideas')}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            activeTab === 'ideas'
              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Phase 4: Creative</span>
            <span className="text-emerald-800 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Export Ready
            </span>
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1.5">
            Themes & Menu
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {event.ideas.length} ideas + Master PDF
          </div>
        </button>
      </div>

      {/* Smart Recommended Next Step Banner */}
      <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
          <div>
            {isOverBudget ? (
              <span className="text-rose-800">
                <strong className="text-slate-900">Recommended Next Action:</strong> Budget deficit detected ({currency} {(totalEstimated - totalBudget).toLocaleString()}). Launch Budget Rescue Mode™ to resolve without sacrificing priorities.
              </span>
            ) : event.metrics.tasksTotal - event.metrics.tasksCompleted > 0 ? (
              <span className="text-indigo-900">
                <strong className="text-slate-900">Recommended Next Action:</strong> You have {event.metrics.tasksTotal - event.metrics.tasksCompleted} countdown tasks pending. Check your countdown checklist and mark completed milestones.
              </span>
            ) : (
              <span className="text-emerald-900">
                <strong className="text-slate-900">Recommended Next Action:</strong> All milestones on track! Download your executive run-of-show PDF or invite co-planners to collaborate.
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isOverBudget ? (
            <button
              type="button"
              onClick={onOpenRescueModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition cursor-pointer active:scale-95 shadow-sm"
            >
              Launch Budget Rescue →
            </button>
          ) : event.metrics.tasksTotal - event.metrics.tasksCompleted > 0 ? (
            <button
              type="button"
              onClick={() => onSelectTab('timeline')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition cursor-pointer active:scale-95 shadow-sm"
            >
              Go to Timeline →
            </button>
          ) : (
            <button
              type="button"
              onClick={onExportPDF}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer flex items-center space-x-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Master PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
