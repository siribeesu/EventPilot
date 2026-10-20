import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
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
      const created = await api.createEvent({
        title,
        event_type: eventType,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        location,
        indoor_outdoor: indoorOutdoor,
        budget: Number(budget),
        currency,
        guest_count: Number(guestCount),
        theme_preference: themePreference,
        cultural_preference: culturalPreference,
        dietary_preferences: dietaryPreferences,
        priority_areas: priorityAreas,
        additional_requirements: additionalRequirements,
      });

      onEventCreated(created);
    } catch (err) {
      alert(`Failed to create plan: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Step {step} of 3
              </span>
              <span className="text-xs text-indigo-100">
                {step === 1 ? 'Core Details' : step === 2 ? 'Scale & Budget' : 'Style & Priorities'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight mt-1">EventPilot Event Creation Wizard</h2>
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
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                1. What are we celebrating?
              </h3>

              {/* Event Title */}
              <div>
                <label htmlFor="wizard-event-title" className="block text-sm font-semibold text-slate-700 mb-1">
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
                  placeholder="e.g. Aarav & Diya Wedding, Sarah's 25th Birthday, Annual Techfest Gala"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 ${
                    errors.title ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-300 focus-visible:ring-indigo-500'
                  }`}
                />
                {errors.title && (
                  <p id="wizard-title-error" role="alert" className="text-xs text-red-500 mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Event Type Grid */}
              <div>
                <span id="event-type-label" className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Category <span className="text-red-500" aria-hidden="true">*</span>
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="event-type-label"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                >
                  {[
                    { id: 'wedding', label: 'Wedding' },
                    { id: 'birthday', label: 'Birthday' },
                    { id: 'anniversary', label: 'Anniversary' },
                    { id: 'college', label: 'College Fest' },
                    { id: 'community', label: 'Community' },
                    { id: 'other', label: 'Other Special' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={eventType === t.id}
                      onClick={() => setEventType(t.id as EventType)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        eventType === t.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="wizard-event-date" className="block text-sm font-semibold text-slate-700 mb-1">
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
                  <label htmlFor="wizard-start-time" className="block text-sm font-semibold text-slate-700 mb-1">
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
                  <label htmlFor="wizard-end-time" className="block text-sm font-semibold text-slate-700 mb-1">
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
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                2. Venue Location, Scale & Financial Budget
              </h3>

              {/* Location & Indoor/Outdoor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="wizard-location" className="block text-sm font-semibold text-slate-700 mb-1">
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
                    placeholder="e.g. Bengaluru, Grand Palace Banquet Mumbai, Delhi NCR"
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
                  <label htmlFor="wizard-venue-style" className="block text-sm font-semibold text-slate-700 mb-1">
                    Venue Style
                  </label>
                  <select
                    id="wizard-venue-style"
                    value={indoorOutdoor}
                    onChange={(e) => setIndoorOutdoor(e.target.value as IndoorOutdoor)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="indoor">Indoor Hall</option>
                    <option value="outdoor">Outdoor Lawn</option>
                    <option value="both">Both (Lawn + Hall)</option>
                  </select>
                </div>
              </div>

              {/* Budget & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="wizard-budget" className="block text-sm font-semibold text-slate-700 mb-1">
                    Total Event Budget <span className="text-red-500" aria-hidden="true">*</span>
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
                  <label htmlFor="wizard-currency" className="block text-sm font-semibold text-slate-700 mb-1">
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
                <label htmlFor="wizard-guest-count" className="block text-sm font-semibold text-slate-700 mb-1">
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
                <p className="text-xs text-slate-500 mt-1">
                  Per-guest catering and seating formulas will adapt to this headcount.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
                3. Style, Cultural Vibe & Priority Areas
              </h3>

              {/* Priority areas */}
              <div>
                <span id="priority-areas-label" className="block text-sm font-semibold text-slate-700 mb-1">
                  Select Priority Areas (AI safeguards these budgets first)
                </span>
                <div
                  role="group"
                  aria-labelledby="priority-areas-label"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2"
                >
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={priorityAreas.includes(opt.id)}
                      onClick={() => togglePriority(opt.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        priorityAreas.includes(opt.id)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                  <label htmlFor="wizard-theme" className="block text-sm font-semibold text-slate-700 mb-1">
                    Theme / Aesthetic Preference
                  </label>
                  <input
                    id="wizard-theme"
                    type="text"
                    value={themePreference}
                    onChange={(e) => setThemePreference(e.target.value)}
                    placeholder="e.g. Royal Marigold, Boho Sunset, Starlit Modern"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="wizard-cultural" className="block text-sm font-semibold text-slate-700 mb-1">
                    Cultural / Regional Preference
                  </label>
                  <input
                    id="wizard-cultural"
                    type="text"
                    value={culturalPreference}
                    onChange={(e) => setCulturalPreference(e.target.value)}
                    placeholder="e.g. Traditional Indian, Punjabi Sangeet, South Indian, Western"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label htmlFor="wizard-dietary" className="block text-sm font-semibold text-slate-700 mb-1">
                  Dietary Requirements & Menu Style
                </label>
                <input
                  id="wizard-dietary"
                  type="text"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g. Pure Vegetarian, Jain counters available, Halal, Multi-cuisine live counters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>

              {/* Additional Requirements */}
              <div>
                <label htmlFor="wizard-notes" className="block text-sm font-semibold text-slate-700 mb-1">
                  Additional Notes or Special Requests
                </label>
                <textarea
                  id="wizard-notes"
                  rows={2}
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="e.g. Need acoustic live music during dinner; require photo booth for youth guests..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
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
                className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Generating AI Master Plan...</span>
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
  );
};
