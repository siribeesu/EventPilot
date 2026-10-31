import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PrivacyDataModal } from './components/PrivacyDataModal';
import { ConsentBanner } from './components/ConsentBanner';
import type { EventFullDetail } from './types';

// Code-split pages for optimal bundle loading & performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EventWizardPage = lazy(() => import('./pages/EventWizardPage').then(m => ({ default: m.EventWizardPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'wizard' | 'event'>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeEventTitle, setActiveEventTitle] = useState<string | null>(null);
  const [createdEventDetail, setCreatedEventDetail] = useState<EventFullDetail | null>(null);
  const [currency, setCurrency] = useState<string>('INR');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // Sync state from hash on mount and on popstate/hashchange
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('event/')) {
        const id = hash.replace('event/', '');
        setSelectedEventId(id);
        setCurrentView('event');
      } else if (hash === 'dashboard') {
        setCurrentView('dashboard');
      } else if (hash === 'wizard') {
        setCurrentView('wizard');
      } else if (hash === 'landing') {
        setCurrentView('landing');
      }
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  const handleNavigate = (view: 'landing' | 'dashboard' | 'wizard', eventId?: string) => {
    if (view === 'landing') {
      window.location.hash = 'landing';
    } else if (view === 'dashboard') {
      window.location.hash = 'dashboard';
    } else if (view === 'wizard') {
      window.location.hash = 'wizard';
    }
    setCurrentView(view);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  };

  const handleSelectEvent = (eventId: string, title?: string) => {
    setSelectedEventId(eventId);
    if (title) setActiveEventTitle(title);
    setCurrentView('event');
    window.location.hash = `event/${eventId}`;
  };

  const handleEventCreated = (event: EventFullDetail) => {
    setCreatedEventDetail(event);
    setSelectedEventId(event.id);
    setActiveEventTitle(event.title);
    setCurrentView('event');
    window.location.hash = `event/${event.id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-14 md:pb-0">
      {/* Accessibility: Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg ring-2 ring-white transition"
      >
        Skip to main content
      </a>

      {/* Top Navbar with Dynamic Breadcrumbs */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currency={currency}
        onCurrencyChange={setCurrency}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        activeEventTitle={activeEventTitle}
      />

      {/* Main Content Area with Landmark and tabIndex for focus management */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense
          fallback={
            <div
              role="status"
              aria-live="polite"
              aria-busy="true"
              className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-3"
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
              onStartPlanning={() => handleNavigate('wizard')}
              onOpenDashboard={() => handleNavigate('dashboard')}
              currency={currency}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardPage
              onSelectEvent={handleSelectEvent}
              onCreateNew={() => handleNavigate('wizard')}
              currency={currency}
            />
          )}

          {currentView === 'wizard' && (
            <EventWizardPage
              onEventCreated={handleEventCreated}
              onCancel={() => handleNavigate('dashboard')}
              defaultCurrency={currency}
            />
          )}

          {currentView === 'event' && selectedEventId && (
            <EventDetailPage
              eventId={selectedEventId}
              initialEvent={createdEventDetail && createdEventDetail.id === selectedEventId ? createdEventDetail : undefined}
              onBack={() => handleNavigate('dashboard')}
              currency={currency}
              onTitleLoaded={(title) => setActiveEventTitle(title)}
            />
          )}
        </Suspense>
      </main>

      {/* Comprehensive Modern Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
      />

      {/* GDPR Data Portability & Privacy Modal */}
      <PrivacyDataModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* GDPR & Privacy Consent Floating Banner */}
      <ConsentBanner onOpenPrivacy={() => setPrivacyModalOpen(true)} />
    </div>
  );
}

export default App;
