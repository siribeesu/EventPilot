import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin,
  Heart,
  Cake,
  Flame,
  ShieldCheck,
  PartyPopper,
} from 'lucide-react';
import type { EventType, IndoorOutdoor, EventFullDetail } from '../types';
import { api } from '../services/api';

interface EventWizardPageProps {
  onEventCreated: (event: EventFullDetail) => void;
  onCancel: () => void;
  defaultCurrency: string;
}

export const EventWizardPage: React.FC<EventWizardPageProps> = ({
  onEventCreated,
  onCancel,
  defaultCurrency,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('23:00');
  const [location, setLocation] = useState('');
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>('indoor');
  const [budget, setBudget] = useState<number>(50000);
  const [currency, setCurrency] = useState(defaultCurrency || 'INR');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [themePreference, setThemePreference] = useState('');
  const [culturalPreference, setCulturalPreference] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [priorityAreas, setPriorityAreas] = useState<string[]>(['catering', 'venue']);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const priorityOptions = [
    { id: 'venue', label: 'Venue & Ambiance' },
    { id: 'catering', label: 'Food & Gourmet Dining' },
    { id: 'decoration', label: 'Bespoke Floral & Stage Decor' },
    { id: 'photography', label: 'Photography & Videography' },
    { id: 'entertainment', label: 'DJ, Music & Live Entertainment' },
  ];

  const categoryPresets: { id: EventType; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'wedding', label: 'Wedding & Reception', icon: Heart, desc: 'Bespoke ceremonies, catering & decor' },
    { id: 'birthday', label: 'Birthday Celebration', icon: Cake, desc: 'Themes, cakes & party entertainment' },
    { id: 'anniversary', label: 'Milestone Anniversary', icon: Sparkles, desc: 'Intimate dinner & memory timeline' },
    { id: 'college', label: 'College Festival', icon: Flame, desc: 'Trussing, audio gear & crowd logistics' },
    { id: 'community', label: 'Community Gala', icon: PartyPopper, desc: 'Public permits, seating & staging' },
  ];

  const togglePriority = (id: string) => {
    if (priorityAreas.includes(id)) {
      setPriorityAreas(priorityAreas.filter(p => p !== id));
    } else {
      setPriorityAreas([...priorityAreas, id]);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim() || title.trim().length < 3) {
        errs.title = 'Event title must be at least 3 characters';
      }
      if (!eventDate) {
        errs.eventDate = 'Please select a valid event date';
      }
    } else if (currentStep === 2) {
      if (!location.trim() || location.trim().length < 2) {
        errs.location = 'Please enter a valid venue or city location';
      }
      if (!budget || budget <= 0) {
        errs.budget = 'Budget must be greater than zero';
      }
      if (!guestCount || guestCount < 1) {
        errs.guestCount = 'Guest count must be at least 1';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const createdEvent = await api.createEvent({
        title,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        location,
        indoor_outdoor: indoorOutdoor,
        budget,
        currency,
        guest_count: guestCount,
        theme_preference: themePreference,
        cultural_preference: culturalPreference,
        dietary_preferences: dietaryPreferences,
        priority_areas: priorityAreas,
        additional_requirements: additionalRequirements,
      });

      onEventCreated(createdEvent);
    } catch (err) {
      alert(`Failed to create plan: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper calculations for live blueprint
  const perGuestCost = Math.round(budget / Math.max(guestCount, 1));
  const daysUntil = eventDate
    ? Math.ceil((new Date(eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Contextual AI Tips
  const getAiTip = () => {
    if (step === 1) {
      if (eventType === 'wedding') {
        return 'AI Advisory: Specifying your exact start and end times allows EventPilot to calculate golden-hour photography schedules and multi-course royal banquet serving slots.';
      } else if (eventType === 'college' || eventType === 'community') {
        return 'AI Advisory: For large community gatherings, we automatically incorporate city sound permit deadlines and multi-gate guest entry checks into your timeline.';
      }
      return 'AI Advisory: Even preliminary dates help us generate adaptive milestone countdowns with urgency flags.';
    }
    if (step === 2) {
      if (budget > 0 && guestCount > 0) {
        return `AI Advisory: At ${currency} ${perGuestCost.toLocaleString()} per guest, our deterministic rules reserve ~40% for culinary catering and ~25% for venue, leaving safe buffers for contingencies.`;
      }
      return 'AI Advisory: Accurate guest headcounts ensure our catering formulas scale correctly without over-ordering.';
    }
    return 'AI Advisory: Your selected priority areas are strictly shielded by Budget Rescue Mode™—if you reduce your financial ceiling later, your highest priorities stay protected.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition mb-1 inline-flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Event Creation Wizard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Step {step} of 3: {step === 1 ? 'Core Parameters' : step === 2 ? 'Scale & Budget' : 'Style & Priorities'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
            <span>GenAI Adaptive Engine</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Blueprint & Journey Navigator (4 cols on desktop) */}
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
              ].map(item => {
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
                    {priorityAreas.map(p => (
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
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-200" aria-hidden="true" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                AI Planner Guidance
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-indigo-50">
              {getAiTip()}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center space-x-1.5 text-[11px] text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
              <span>Budget Rescue Mode™ Protected</span>
            </div>
          </div>
        </div>

        {/* Right Column: Expansive Step Form Card (8 cols on desktop) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Wizard Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                    Step {step} of 3
                  </span>
                  <span className="text-xs text-indigo-100 font-medium">
                    {step === 1 ? 'Core Parameters' : step === 2 ? 'Scale & Financial Target' : 'Style, Dining & Priorities'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight mt-1">
                  {step === 1 && 'What are we planning?'}
                  {step === 2 && 'Set Your Venue Scale & Financial Target'}
                  {step === 3 && 'Personalize Aesthetics, Dining & Priorities'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white transition"
              >
                Cancel
              </button>
            </div>

            {/* Accessible Progress Bar */}
            <div
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Step ${step} of 3`}
              className="w-full bg-slate-100 h-1.5"
            >
              <div
                className="bg-indigo-600 h-1.5 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            {/* Wizard Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-6">
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
                            className={`p-3.5 rounded-2xl border text-left transition flex items-start space-x-3 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Location & Indoor/Outdoor */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="wizard-location" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        City / Venue Location <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="wizard-location"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={!!errors.location}
                        aria-describedby={errors.location ? 'wizard-location-error' : undefined}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Grand Palace Banquet Mumbai, Taj West End Bengaluru"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 ${
                          errors.location ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
                        }`}
                      />
                      {errors.location && (
                        <p id="wizard-location-error" role="alert" className="text-xs text-red-500 mt-1">
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="wizard-venue-style" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Setting Type
                      </label>
                      <select
                        id="wizard-venue-style"
                        value={indoorOutdoor}
                        onChange={(e) => setIndoorOutdoor(e.target.value as IndoorOutdoor)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <option value="indoor">Indoor Hall / Banquet</option>
                        <option value="outdoor">Outdoor Lawn / Beach</option>
                        <option value="both">Both (Lawn + Hall)</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="wizard-budget" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Total Budget Limit <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold" aria-hidden="true">
                          {currency === 'INR' ? '₹' : currency}
                        </span>
                        <input
                          id="wizard-budget"
                          type="number"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.budget}
                          aria-describedby={errors.budget ? 'wizard-budget-error' : undefined}
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          placeholder="50000"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-bold text-slate-900 focus-visible:outline-none focus-visible:ring-2 ${
                            errors.budget ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
                          }`}
                        />
                      </div>
                      {errors.budget && (
                        <p id="wizard-budget-error" role="alert" className="text-xs text-red-500 mt-1">
                          {errors.budget}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="wizard-currency" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Currency
                      </label>
                      <select
                        id="wizard-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="AED">AED</option>
                      </select>
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label htmlFor="wizard-guest-count" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Expected Guest Headcount <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="wizard-guest-count"
                      type="number"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.guestCount}
                      aria-describedby={errors.guestCount ? 'wizard-guest-error' : undefined}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      placeholder="100"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-bold focus-visible:outline-none focus-visible:ring-2 ${
                        errors.guestCount ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
                      }`}
                    />
                    {errors.guestCount && (
                      <p id="wizard-guest-error" role="alert" className="text-xs text-red-500 mt-1">
                        {errors.guestCount}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1.5">
                      Per-guest dining allocations, table layouts, and beverage estimations adjust to this count.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Priority Areas */}
                  <div>
                    <span id="priority-areas-label" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Select Priority Areas (AI safeguards these allocations during budget adjustments)
                    </span>
                    <div
                      role="group"
                      aria-labelledby="priority-areas-label"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2"
                    >
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          aria-pressed={priorityAreas.includes(opt.id)}
                          onClick={() => togglePriority(opt.id)}
                          className={`p-3.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            priorityAreas.includes(opt.id)
                              ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-1 ring-indigo-500'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {priorityAreas.includes(opt.id) && (
                            <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme & Cultural */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wizard-theme" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Theme & Aesthetic Style
                      </label>
                      <input
                        id="wizard-theme"
                        type="text"
                        value={themePreference}
                        onChange={(e) => setThemePreference(e.target.value)}
                        placeholder="e.g. Royal Marigold, Boho Chic, Neon Cyberpunk"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="wizard-cultural" className="block text-sm font-semibold text-slate-800 mb-1.5">
                        Cultural / Regional Traditions
                      </label>
                      <input
                        id="wizard-cultural"
                        type="text"
                        value={culturalPreference}
                        onChange={(e) => setCulturalPreference(e.target.value)}
                        placeholder="e.g. Traditional Indian Sangeet, South Indian, Western Black-Tie"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div>
                    <label htmlFor="wizard-dietary" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Dietary Requirements & Menu Concepts
                    </label>
                    <input
                      id="wizard-dietary"
                      type="text"
                      value={dietaryPreferences}
                      onChange={(e) => setDietaryPreferences(e.target.value)}
                      placeholder="e.g. Pure Vegetarian, Jain counters available, Halal, Street food live stations"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <label htmlFor="wizard-notes" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Additional Notes or Vendor Requirements
                    </label>
                    <textarea
                      id="wizard-notes"
                      rows={3}
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                      placeholder="e.g. Need acoustic sound setup during dinner; require drone footage for stage entrance..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Wizard Footer Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-sm shadow-indigo-100"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white hover:opacity-95 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>Generating AI Master Plan...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>Generate Complete Event Plan</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
