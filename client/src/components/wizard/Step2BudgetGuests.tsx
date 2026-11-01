import React from 'react';
import type { IndoorOutdoor } from '../../types';

interface Step2BudgetGuestsProps {
  location: string;
  setLocation: (val: string) => void;
  indoorOutdoor: IndoorOutdoor;
  setIndoorOutdoor: (val: IndoorOutdoor) => void;
  budget: number;
  setBudget: (val: number) => void;
  currency: string;
  setCurrency: (val: string) => void;
  guestCount: number;
  setGuestCount: (val: number) => void;
  errors: Record<string, string>;
}

export const Step2BudgetGuests: React.FC<Step2BudgetGuestsProps> = ({
  location,
  setLocation,
  indoorOutdoor,
  setIndoorOutdoor,
  budget,
  setBudget,
  currency,
  setCurrency,
  guestCount,
  setGuestCount,
  errors,
}) => {
  return (
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
              {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency}
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
  );
};
