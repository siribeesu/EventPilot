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
      className="mb-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quickstart Onboarding</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold">{progressPct}% completed</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">4 Steps to a Flawless Event Plan</h2>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss quickstart"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {steps.map(step => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              step.done
                ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-indigo-50/30 hover:border-indigo-200 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {step.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <h3 className={`text-xs font-bold leading-snug ${step.done ? 'text-emerald-950' : 'text-slate-900'}`}>
                  {step.title}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-6">{step.desc}</p>
            </div>
            {step.action && !step.done && (
              <button
                onClick={step.action}
                className="mt-3.5 pl-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
