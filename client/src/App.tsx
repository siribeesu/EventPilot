import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventWizardPage } from './pages/EventWizardPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventFullDetail } from './types';

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
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Main Content Area */}
      <main className="flex-1">
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
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Planora AI — GenAI-Powered Event Planning & Financial Optimization Platform.</p>
          <div className="flex items-center space-x-3 text-slate-500">
            <span>Powered by Gemini & Deterministic Rules Engine</span>
            <span>•</span>
            <span>PostgreSQL & Supabase Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
