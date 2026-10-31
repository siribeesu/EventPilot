import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Info,
  SlidersHorizontal,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { EventFullDetail, BudgetRescueResponse } from '../types';
import { api } from '../services/api';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface BudgetRescueModalProps {
  event: EventFullDetail;
  isOpen: boolean;
  onClose: () => void;
  onRescueApplied: (updatedEvent: EventFullDetail) => void;
}

export const BudgetRescueModal: React.FC<BudgetRescueModalProps> = ({
  event,
  isOpen,
  onClose,
  onRescueApplied,
}) => {
  const currency = event.currency || 'INR';
  const currentTotal = event.metrics.totalEstimated;
  const initialTarget = Math.round(currentTotal * 0.7);

  const [targetBudget, setTargetBudget] = useState<number>(initialTarget);
  const [loading, setLoading] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [rescueData, setRescueData] = useState<BudgetRescueResponse | null>(null);
  const [selectedProposalIds, setSelectedProposalIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Focus trap for WCAG 2.1 modal compliance
  const modalContainerRef = useFocusTrap(isOpen);

  // Accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    if (targetBudget <= 0) {
      setErrorMessage('Please enter a valid budget target');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await api.previewBudgetRescue(event.id, targetBudget);
      setRescueData(data);
      setSelectedProposalIds(new Set(data.proposals.map(p => p.id)));
      setStep('review');
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProposal = (id: string) => {
    const next = new Set(selectedProposalIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedProposalIds(next);
  };

  const selectAll = () => {
    if (!rescueData) return;
    setSelectedProposalIds(new Set(rescueData.proposals.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedProposalIds(new Set());
  };

  // Recalculate totals dynamically
  const activeProposals = rescueData?.proposals.filter(p => selectedProposalIds.has(p.id)) || [];
  const currentAcceptedSavings = activeProposals.reduce((acc, p) => acc + p.savings, 0);
  const dynamicProposedTotal = currentTotal - currentAcceptedSavings;
  const dynamicRemainingShortfall = Math.max(0, dynamicProposedTotal - targetBudget);

  const handleApplyChanges = async () => {
    if (!rescueData) return;
    setApplying(true);
    try {
      const result = await api.applyBudgetRescue(event.id, {
        newTargetBudget: targetBudget,
        acceptedProposalIds: Array.from(selectedProposalIds),
        proposals: rescueData.proposals,
      });
      onRescueApplied(result.event);
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      ref={modalContainerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-rescue-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30" aria-hidden="true">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 id="budget-rescue-title" className="text-xl font-extrabold tracking-tight flex items-center space-x-2.5">
                <span>Budget Rescue Mode™</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                  Autonomous Protection
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligently downscale costs to fit a reduced budget without sacrificing your core priorities.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
            <span className="sr-only">Close dialog</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'input' ? (
            <div className="space-y-6">
              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 block uppercase">Current Planned Budget</span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">
                    {currency} {currentTotal.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">{event.budget_items.length} itemized items</span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-xs font-medium text-indigo-700 block uppercase">Event Priorities</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {event.priority_areas && event.priority_areas.length > 0 ? (
                      event.priority_areas.map((p, idx) => (
                        <span key={idx} className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-indigo-600">Balanced / Standard</span>
                    )}
                  </div>
                  <span className="text-[11px] text-indigo-600 mt-1.5 block">AI safeguards these experiences first.</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-medium text-amber-800 block uppercase">Guest Headcount</span>
                  <span className="text-2xl font-bold text-amber-900 mt-1 block">{event.guest_count} Guests</span>
                  <span className="text-xs text-amber-700 mt-0.5 block">Per-guest efficiency will be prioritized.</span>
                </div>
              </div>

              {/* Set New Target Budget */}
              <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="target-budget-input" className="text-sm font-bold text-slate-800 block">
                      Target Reduced Budget ({currency})
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Specify the lower financial limit you wish to enforce (e.g. ₹35,000).
                    </p>
                  </div>
                  {currentTotal > targetBudget && (
                    <div className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Cut: {currency} {(currentTotal - targetBudget).toLocaleString()} ({Math.round(((currentTotal - targetBudget) / currentTotal) * 100)}%)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">
                      {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency}
                    </span>
                    <input
                      id="target-budget-input"
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      placeholder="e.g. 35000"
                      aria-required="true"
                    />
                  </div>
                  {/* Quick percentage buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setTargetBudget(Math.round(currentTotal * 0.85))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
                      aria-label="Reduce budget by 15 percent"
                    >
                      -15%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetBudget(Math.round(currentTotal * 0.70))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
                      aria-label="Reduce budget by 30 percent"
                    >
                      -30%
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetBudget(Math.round(currentTotal * 0.50))}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
                      aria-label="Reduce budget by 50 percent"
                    >
                      -50%
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    EventPilot will run an optimization pass across all expense categories. High-cost discretionary items will be substituted with smart, tasteful alternatives, while your core priorities are shielded.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Review Step with Side-by-Side Comparison */
            <div className="space-y-6">
              {/* Dynamic Analysis Bar */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>EventPilot AI Optimization Analysis</span>
                  </span>
                  <div className="flex items-center space-x-3 text-xs">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    >
                      Accept All ({rescueData?.proposals.length})
                    </button>
                    <span className="text-slate-300" aria-hidden="true">|</span>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="text-slate-500 hover:text-slate-700 font-medium underline focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {rescueData?.analysis}
                </p>
              </div>

              {/* Live Status Indicators with aria-live */}
              <div
                aria-live="polite"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
              >
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 block uppercase">Original Cost</span>
                  <span className="text-base font-bold text-slate-700 mt-0.5 block">
                    {currency} {currentTotal.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[11px] font-medium text-indigo-600 block uppercase">Target Ceiling</span>
                  <span className="text-base font-bold text-indigo-900 mt-0.5 block">
                    {currency} {targetBudget.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] font-medium text-emerald-600 block uppercase">Accepted Savings</span>
                  <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                    -{currency} {currentAcceptedSavings.toLocaleString()}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${dynamicRemainingShortfall === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <span className={`text-[11px] font-medium uppercase block ${dynamicRemainingShortfall === 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {dynamicRemainingShortfall === 0 ? 'Goal Achieved' : 'Remaining Gap'}
                  </span>
                  <span className={`text-base font-bold mt-0.5 block ${dynamicRemainingShortfall === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {dynamicRemainingShortfall === 0 ? '✓ On Budget' : `${currency} ${dynamicRemainingShortfall.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Proposal Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                    <span>Review Proposed Reductions & Alternatives</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Check the items you approve to be applied
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {rescueData?.proposals.map((proposal) => {
                    const isSelected = selectedProposalIds.has(proposal.id);
                    return (
                      <div
                        key={proposal.id}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            toggleProposal(proposal.id);
                          }
                        }}
                        onClick={() => toggleProposal(proposal.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isSelected
                            ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <div
                              aria-hidden="true"
                              className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors ${
                                isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                                  {proposal.category}
                                </span>
                                <span className="font-bold text-slate-900 text-sm">{proposal.name}</span>
                              </div>

                              <p className="text-xs text-slate-600 mt-1.5">
                                <span className="font-semibold text-slate-800">Rationale: </span>
                                {proposal.explanation}
                              </p>

                              <p className="text-xs text-indigo-900 mt-1 bg-white/80 p-2 rounded-lg border border-indigo-100">
                                <span className="font-semibold text-indigo-700">Recommended Alternative: </span>
                                {proposal.tradeOffOrAlternative}
                              </p>
                            </div>
                          </div>

                          {/* Side-by-Side Numbers */}
                          <div className="text-right flex-shrink-0 bg-white px-3 py-2 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-400 line-through">
                              {currency} {proposal.currentEstimatedCost.toLocaleString()}
                            </div>
                            <div className="text-sm font-bold text-indigo-700 flex items-center justify-end space-x-1">
                              <ArrowRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
                              <span>{currency} {proposal.proposedEstimatedCost.toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                              Save {currency} {proposal.savings.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Preservation Advice */}
              {rescueData?.priorityAdvice && (
                <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-800 block">Strategic Planner Advice:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                    {rescueData.priorityAdvice.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 'review' ? (
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl transition"
            >
              ← Back to Budget Target
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl transition"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center space-x-3">
            {step === 'input' ? (
              <button
                type="button"
                onClick={handleCalculate}
                disabled={loading || targetBudget <= 0}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-[0.98] transition shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Analyzing & Generating Alternatives...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Run Budget Rescue</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={applying || selectedProposalIds.size === 0}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.98] transition shadow-sm disabled:opacity-50"
              >
                {applying ? (
                  <span>Applying Accepted Changes...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Apply {selectedProposalIds.size} Changes to Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
