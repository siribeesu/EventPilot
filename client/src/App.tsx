import React, { useState, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import type { EventFullDetail } from './types';

// Code-split pages for optimal bundle loading & performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EventWizardPage = lazy(() => import('./pages/EventWizardPage').then(m => ({ default: m.EventWizardPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'wizard' | 'event'>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('INR');

  const handleNavigate = (view: 'landing' | 'dashboard' | 'wizard', eventId?: string) => {
    setCurrentView(view);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event');
  };

  const handleEventCreated = (event: EventFullDetail) => {
    setSelectedEventId(event.id);
    setCurrentView('event');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Accessibility: Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg ring-2 ring-white transition"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Content Area with Landmark and tabIndex for focus management */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3"
            >
              <div
                className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-slate-500">Loading EventPilot experience...</p>
              <span className="sr-only">Loading page content</span>
            </div>
          }
        >
          {currentView === 'landing' && (
            <LandingPage
              onStartPlanning={() => setCurrentView('wizard')}
              onOpenDashboard={() => setCurrentView('dashboard')}
              currency={currency}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardPage
              onSelectEvent={handleSelectEvent}
              onCreateNew={() => setCurrentView('wizard')}
              currency={currency}
            />
          )}

          {currentView === 'wizard' && (
            <EventWizardPage
              onEventCreated={handleEventCreated}
              onCancel={() => setCurrentView('dashboard')}
              defaultCurrency={currency}
            />
          )}

          {currentView === 'event' && selectedEventId && (
            <EventDetailPage
              eventId={selectedEventId}
              onBack={() => setCurrentView('dashboard')}
              currency={currency}
            />
          )}
        </Suspense>
      </main>

      {/* Accessible Footer */}
      <footer role="contentinfo" className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 EventPilot — GenAI-Powered Event Planning & Financial Optimization Platform.</p>
          <div className="flex items-center space-x-3 text-slate-500">
            <span>Powered by Gemini & Deterministic Rules Engine</span>
            <span aria-hidden="true">•</span>
            <span>PostgreSQL & Supabase Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
