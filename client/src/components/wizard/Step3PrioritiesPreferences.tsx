import React from 'react';
import { CheckCircle } from 'lucide-react';
import { priorityOptions } from './wizardTemplates';

interface Step3PrioritiesPreferencesProps {
  priorityAreas: string[];
  togglePriority: (id: string) => void;
  themePreference: string;
  setThemePreference: (val: string) => void;
  culturalPreference: string;
  setCulturalPreference: (val: string) => void;
  dietaryPreferences: string;
  setDietaryPreferences: (val: string) => void;
  additionalRequirements: string;
  setAdditionalRequirements: (val: string) => void;
}

export const Step3PrioritiesPreferences: React.FC<Step3PrioritiesPreferencesProps> = ({
  priorityAreas,
  togglePriority,
  themePreference,
  setThemePreference,
  culturalPreference,
  setCulturalPreference,
  dietaryPreferences,
  setDietaryPreferences,
  additionalRequirements,
  setAdditionalRequirements,
}) => {
  return (
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
              className={`p-3.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer ${
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
  );
};
