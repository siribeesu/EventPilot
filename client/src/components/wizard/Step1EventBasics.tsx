import React from 'react';
import { Sparkles } from 'lucide-react';
import type { EventType } from '../../types';
import { quickTemplates, categoryPresets, QuickTemplate } from './wizardTemplates';

interface Step1EventBasicsProps {
  title: string;
  setTitle: (val: string) => void;
  eventType: EventType;
  setEventType: (val: EventType) => void;
  eventDate: string;
  setEventDate: (val: string) => void;
  startTime: string;
  setStartTime: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  currency: string;
  errors: Record<string, string>;
  onApplyTemplate: (tpl: QuickTemplate) => void;
}

export const Step1EventBasics: React.FC<Step1EventBasicsProps> = ({
  title,
  setTitle,
  eventType,
  setEventType,
  eventDate,
  setEventDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  currency,
  errors,
  onApplyTemplate,
}) => {
  return (
    <div className="space-y-6">
      {/* Quick-Start Event Templates Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100/90 space-y-2.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quick-Start Event Templates (1-Click Fill)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickTemplates.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onApplyTemplate(tpl)}
              className="text-left p-2.5 rounded-xl border border-indigo-200/60 bg-white/80 hover:bg-white hover:border-indigo-400 hover:shadow-xs transition text-xs font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <div className="font-semibold text-indigo-900 truncate">{tpl.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {currency} {tpl.budget.toLocaleString()} • {tpl.guestCount} Guests
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Event Title */}
      <div>
        <label htmlFor="wizard-event-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
          Event Name or Celebration Title <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="wizard-event-title"
          type="text"
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'wizard-title-error' : undefined}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Aarav & Diya Wedding, Maya's Sweet 16, National Tech Fest 2026"
          className={`w-full px-4 py-3 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 ${
            errors.title ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
          }`}
        />
        {errors.title && (
          <p id="wizard-title-error" role="alert" className="text-xs text-red-500 mt-1">
            {errors.title}
          </p>
        )}
      </div>

      {/* Event Type Grid with Rich Cards */}
      <div>
        <span id="event-type-label" className="block text-sm font-semibold text-slate-800 mb-2">
          Event Category <span className="text-red-500" aria-hidden="true">*</span>
        </span>
        <div
          role="radiogroup"
          aria-labelledby="event-type-label"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {categoryPresets.map((t) => {
            const Icon = t.icon;
            const isSelected = eventType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setEventType(t.id)}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{t.label}</div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Date & Times in 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="wizard-event-date" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Event Date <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="wizard-event-date"
            type="date"
            required
            aria-required="true"
            aria-invalid={!!errors.eventDate}
            aria-describedby={errors.eventDate ? 'wizard-date-error' : undefined}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 ${
              errors.eventDate ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
            }`}
          />
          {errors.eventDate && (
            <p id="wizard-date-error" role="alert" className="text-xs text-red-500 mt-1">
              {errors.eventDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="wizard-start-time" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Start Time
          </label>
          <input
            id="wizard-start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="wizard-end-time" className="block text-sm font-semibold text-slate-800 mb-1.5">
            End Time
          </label>
          <input
            id="wizard-end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
