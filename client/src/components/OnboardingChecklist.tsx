import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, ArrowRight, X } from 'lucide-react';

interface OnboardingChecklistProps {
  eventsCount: number;
  hasBudgetItems: boolean;
  onNewEvent: () => void;
  onOpenCollab?: () => void;
  onOpenPrivacy?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  eventsCount,
  hasBudgetItems,
  onNewEvent,
  onOpenCollab,
  onOpenPrivacy,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const steps = [
    {
      id: 1,
      title: 'Initialize your first event vision',
      desc: 'Set guest count, budget limit, and cultural preferences.',
      done: eventsCount > 0,
      action: onNewEvent,
      actionLabel: 'Create Event',
    },
    {
      id: 2,
      title: 'Review AI Budget Allocations & Rescue Mode',
      desc: 'Inspect estimated line items across catering, venue & decor.',
      done: hasBudgetItems,
      action: undefined,
    },
    {
      id: 3,
      title: 'Invite Team or Family Collaborator (RBAC)',
      desc: 'Share editor or viewer access for real-time planning.',
      done: false,
      action: onOpenCollab,
      actionLabel: 'Invite Partner',
    },
    {
      id: 4,
      title: 'GDPR Data Ownership & Privacy Verification',
      desc: 'Review zero-retention AI policy and export your event data.',
      done: true,
      action: onOpenPrivacy,
      actionLabel: 'Privacy Settings',
    },
  ];

  const completedCount = steps.filter(s => s.done).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <section
      aria-label="Event Planning Quickstart Onboarding"
      className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-lg relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quickstart Onboarding
            </span>
            <span className="text-xs text-slate-400 font-medium">{progressPct}% completed</span>
          </div>
          <h2 className="text-base font-semibold text-white">4 Steps to a Flawless Event Plan</h2>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss quickstart"
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map(step => (
          <div
            key={step.id}
            className={`p-3 rounded-xl border transition flex flex-col justify-between ${
              step.done
                ? 'bg-slate-800/30 border-slate-800/80'
                : 'bg-indigo-950/20 border-indigo-500/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <h3 className={`text-xs font-medium ${step.done ? 'text-slate-300' : 'text-white'}`}>
                  {step.title}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">{step.desc}</p>
            </div>
            {step.action && !step.done && (
              <button
                onClick={step.action}
                className="mt-3 pl-6 flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
