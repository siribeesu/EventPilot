import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import type { EventType, IndoorOutdoor, EventFullDetail } from '../types';
import { api } from '../services/api';
import { QuickTemplate } from '../components/wizard/wizardTemplates';
import { LiveBlueprintSidebar } from '../components/wizard/LiveBlueprintSidebar';
import { Step1EventBasics } from '../components/wizard/Step1EventBasics';
import { Step2BudgetGuests } from '../components/wizard/Step2BudgetGuests';
import { Step3PrioritiesPreferences } from '../components/wizard/Step3PrioritiesPreferences';

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

  const applyQuickTemplate = (tpl: QuickTemplate) => {
    setTitle(tpl.title);
    setEventType(tpl.eventType);
    setBudget(tpl.budget);
    setGuestCount(tpl.guestCount);
    setLocation(tpl.location);
    setThemePreference(tpl.theme);
    setCulturalPreference(tpl.cultural);
    setDietaryPreferences(tpl.dietary);
    setPriorityAreas(tpl.priorities);
    setAdditionalRequirements(tpl.notes);
    if (!eventDate) {
      const d = new Date();
      d.setDate(d.getDate() + 90);
      setEventDate(d.toISOString().split('T')[0]);
    }
  };

  const togglePriority = (id: string) => {
    if (priorityAreas.includes(id)) {
      setPriorityAreas(priorityAreas.filter((p) => p !== id));
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
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
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
    return 'AI Advisory: Your selected priority areas are strictly shielded by Budget Rescue Mode™ — if you reduce your financial ceiling later, your highest priorities stay protected.';
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition mb-1 inline-flex items-center space-x-1 cursor-pointer"
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
        {/* Left Column: Live Blueprint & Journey Navigator */}
        <LiveBlueprintSidebar
          step={step}
          title={title}
          eventType={eventType}
          eventDate={eventDate}
          daysUntil={daysUntil}
          budget={budget}
          currency={currency}
          guestCount={guestCount}
          perGuestCost={perGuestCost}
          location={location}
          indoorOutdoor={indoorOutdoor}
          priorityAreas={priorityAreas}
          aiTip={getAiTip()}
        />

        {/* Right Column: Step Form Card */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Wizard Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 border-b border-indigo-500/30 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Step {step} of 3
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {step === 1 ? 'Core Parameters' : step === 2 ? 'Scale & Financial Target' : 'Style, Dining & Priorities'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight mt-1.5">
                  {step === 1 && 'What are we planning?'}
                  {step === 2 && 'Set Your Venue Scale & Financial Target'}
                  {step === 3 && 'Personalize Aesthetics, Dining & Priorities'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-white transition cursor-pointer"
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
                <Step1EventBasics
                  title={title}
                  setTitle={setTitle}
                  eventType={eventType}
                  setEventType={setEventType}
                  eventDate={eventDate}
                  setEventDate={setEventDate}
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
                  currency={currency}
                  errors={errors}
                  onApplyTemplate={applyQuickTemplate}
                />
              )}

              {step === 2 && (
                <Step2BudgetGuests
                  location={location}
                  setLocation={setLocation}
                  indoorOutdoor={indoorOutdoor}
                  setIndoorOutdoor={setIndoorOutdoor}
                  budget={budget}
                  setBudget={setBudget}
                  currency={currency}
                  setCurrency={setCurrency}
                  guestCount={guestCount}
                  setGuestCount={setGuestCount}
                  errors={errors}
                />
              )}

              {step === 3 && (
                <Step3PrioritiesPreferences
                  priorityAreas={priorityAreas}
                  togglePriority={togglePriority}
                  themePreference={themePreference}
                  setThemePreference={setThemePreference}
                  culturalPreference={culturalPreference}
                  setCulturalPreference={setCulturalPreference}
                  dietaryPreferences={dietaryPreferences}
                  setDietaryPreferences={setDietaryPreferences}
                  additionalRequirements={additionalRequirements}
                  setAdditionalRequirements={setAdditionalRequirements}
                />
              )}

              {/* Wizard Footer Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 transition cursor-pointer"
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
                    className="inline-flex items-center space-x-2 px-7 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-md cursor-pointer active:scale-95"
                  >
                    <span>Continue to Step {step + 1}</span>
                    <ArrowRight className="w-4 h-4 text-indigo-300" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-xl shadow-slate-900/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                        <span>Synthesizing Master Event Plan...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-300" aria-hidden="true" />
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
