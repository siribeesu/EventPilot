import { useState, useEffect, useCallback } from 'react';
import type { EventFullDetail } from '../types';

export type AppView = 'landing' | 'dashboard' | 'wizard' | 'event';

export interface UseAppRouterReturn {
  currentView: AppView;
  selectedEventId: string | null;
  activeEventTitle: string | null;
  createdEventDetail: EventFullDetail | null;
  currency: string;
  setCurrency: (currency: string) => void;
  privacyModalOpen: boolean;
  setPrivacyModalOpen: (open: boolean) => void;
  navigate: (view: 'landing' | 'dashboard' | 'wizard', eventId?: string) => void;
  selectEvent: (eventId: string, title?: string) => void;
  handleEventCreated: (event: EventFullDetail) => void;
  setActiveEventTitle: (title: string | null) => void;
}

/**
 * Custom hook to encapsulate hash-based routing, view transitions,
 * and global event state lifecycle.
 */
export function useAppRouter(): UseAppRouterReturn {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeEventTitle, setActiveEventTitle] = useState<string | null>(null);
  const [createdEventDetail, setCreatedEventDetail] = useState<EventFullDetail | null>(null);
  const [currency, setCurrency] = useState<string>('INR');
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);

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

  const navigate = useCallback((view: 'landing' | 'dashboard' | 'wizard', eventId?: string) => {
    window.location.hash = view;
    setCurrentView(view);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, []);

  const selectEvent = useCallback((eventId: string, title?: string) => {
    setSelectedEventId(eventId);
    if (title) setActiveEventTitle(title);
    setCurrentView('event');
    window.location.hash = `event/${eventId}`;
  }, []);

  const handleEventCreated = useCallback((event: EventFullDetail) => {
    setCreatedEventDetail(event);
    setSelectedEventId(event.id);
    setActiveEventTitle(event.title);
    setCurrentView('event');
    window.location.hash = `event/${event.id}`;
  }, []);

  return {
    currentView,
    selectedEventId,
    activeEventTitle,
    createdEventDetail,
    currency,
    setCurrency,
    privacyModalOpen,
    setPrivacyModalOpen,
    navigate,
    selectEvent,
    handleEventCreated,
    setActiveEventTitle,
  };
}
