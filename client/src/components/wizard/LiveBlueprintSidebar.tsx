import React from 'react';
import { CheckCircle, Calendar, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import type { EventType, IndoorOutdoor } from '../../types';

interface LiveBlueprintSidebarProps {
  step: number;
  title: string;
  eventType: EventType;
  eventDate: string;
  daysUntil: number | null;
  budget: number;
  currency: string;
  guestCount: number;
  perGuestCost: number;
  location: string;
  indoorOutdoor: IndoorOutdoor;
  priorityAreas: string[];
  aiTip: string;
}

export const LiveBlueprintSidebar: React.FC<LiveBlueprintSidebarProps> = ({
  step,
  title,
  eventType,
  eventDate,
  daysUntil,
  budget,
  currency,
  guestCount,
  perGuestCost,
  location,
  indoorOutdoor,
  priorityAreas,
  aiTip,
}) => {
  return (
    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
      {/* Step Journey Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Planning Steps
        </h2>
        <div className="space-y-3">
          {[
            { s: 1, title: '1. Core Details', desc: 'Title, category, date & hours' },
            { s: 2, title: '2. Scale & Budget', desc: 'Location, guest count, financial limit' },
            { s: 3, title: '3. Style & Priorities', desc: 'Themes, dining & AI safeguards' },
          ].map((item) => {
            const isCurrent = step === item.s;
            const isComplete = step > item.s;
            return (
              <div
                key={item.s}
                className={`flex items-start space-x-3 p-3 rounded-xl transition ${
                  isCurrent
                    ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-900'
                    : isComplete
                    ? 'bg-slate-50 text-slate-700 border border-transparent'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isComplete ? <CheckCircle className="w-4 h-4" /> : item.s}
                </div>
                <div>
                  <div className="text-xs font-bold">{item.title}</div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Blueprint Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Live Plan Blueprint
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 capitalize">
            {eventType}
          </span>
        </div>

        <div className="space-y-2.5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {title.trim() || 'Untitled Celebration'}
            </h3>
            <div className="text-xs text-slate-500 flex items-center space-x-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>
                {eventDate || 'Date pending'}{' '}
                {daysUntil !== null && daysUntil >= 0 ? `(in ${daysUntil} days)` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Target Budget</div>
              <div className="text-sm font-bold text-slate-900">
                {currency} {budget.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Headcount</div>
              <div className="text-sm font-bold text-slate-900">
                {guestCount} Guests
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-xs flex items-center justify-between">
            <span className="text-indigo-800 font-medium">Estimated Per-Guest:</span>
            <span className="font-bold text-indigo-900">
              {currency} {perGuestCost.toLocaleString()}
            </span>
          </div>

          {location && (
            <div className="text-xs text-slate-600 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span className="truncate">{location} ({indoorOutdoor})</span>
            </div>
          )}

          {priorityAreas.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                Protected Priorities:
              </span>
              <div className="flex flex-wrap gap-1">
                {priorityAreas.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contextual AI Advisor Card */}
      <div className="bg-indigo-50/80 rounded-3xl p-6 text-slate-900 border border-indigo-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-600 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            AI Planner Guidance
          </h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          {aiTip}
        </p>
        <div className="pt-2 border-t border-indigo-200 flex items-center space-x-2 text-[11px] text-indigo-700 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Budget Rescue Mode™ Protected</span>
        </div>
      </div>
    </div>
  );
};
