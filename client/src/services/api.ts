import {
  EventRecord,
  EventFullDetail,
  BudgetItem,
  TaskItem,
  VendorItem,
  BudgetRescueResponse,
  AIAssistantAction,
  Collaborator,
  SystemMetrics,
  PrivacyPolicyResponse,
} from '../types';

const API_BASE = '/api';

function getLocalEvents(): Record<string, EventFullDetail> {
  try {
    const raw = localStorage.getItem('eventpilot_events_cache');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalEvent(event: EventFullDetail) {
  if (!event || !event.id) return;
  try {
    const store = getLocalEvents();
    store[event.id] = event;
    localStorage.setItem('eventpilot_events_cache', JSON.stringify(store));
  } catch {}
}

async function handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let errMsg = fallbackError;
    try {
      const parsed = JSON.parse(text);
      if (parsed.error) errMsg = parsed.error;
      else if (parsed.message) errMsg = parsed.message;
    } catch {
      if (text && text.trim().length > 0 && text.trim().length < 250) {
        errMsg = text.trim();
      } else {
        errMsg = `${fallbackError} (${res.status} ${res.statusText})`;
      }
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Events
  async getEvents(): Promise<EventFullDetail[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      const serverEvents = await handleResponse<EventFullDetail[]>(res, 'Failed to fetch events');
      const localStore = getLocalEvents();
      serverEvents.forEach(e => { localStore[e.id] = e; });
      try { localStorage.setItem('eventpilot_events_cache', JSON.stringify(localStore)); } catch {}
      return Object.values(localStore);
    } catch (err) {
      const local = Object.values(getLocalEvents());
      if (local.length > 0) return local;
      throw err;
    }
  },

  async getEvent(id: string): Promise<EventFullDetail> {
    try {
      const res = await fetch(`${API_BASE}/events/${id}`);
      const data = await handleResponse<EventFullDetail>(res, 'Failed to fetch event');
      saveLocalEvent(data);
      return data;
    } catch (err) {
      const localStore = getLocalEvents();
      if (localStore[id]) {
        return localStore[id];
      }
      throw err;
    }
  },

  async createEvent(data: Partial<EventRecord>): Promise<EventFullDetail> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const created = await handleResponse<EventFullDetail>(res, 'Failed to create event');
    saveLocalEvent(created);
    return created;
  },

  async updateEvent(id: string, updates: Partial<EventRecord>): Promise<EventFullDetail> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update event');
    return res.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete event');
  },

  async regeneratePlan(id: string): Promise<EventFullDetail> {
    const res = await fetch(`${API_BASE}/events/${id}/generate-plan`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate plan');
    return res.json();
  },

  // Budget Items
  async addBudgetItem(eventId: string, item: Partial<BudgetItem>): Promise<BudgetItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add budget item');
    return res.json();
  },

  async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    const res = await fetch(`${API_BASE}/budget-items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update budget item');
    return res.json();
  },

  async deleteBudgetItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/budget-items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete budget item');
  },

  // Tasks
  async addTask(eventId: string, task: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to add task');
    return res.json();
  },

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Vendors
  async addVendor(eventId: string, vendor: Partial<VendorItem>): Promise<VendorItem> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to add vendor');
    return res.json();
  },

  async updateVendor(id: string, updates: Partial<VendorItem>): Promise<VendorItem> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  async deleteVendor(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
  },

  // Budget Rescue Mode
  async previewBudgetRescue(eventId: string, targetBudget: number): Promise<BudgetRescueResponse> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget-rescue/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetBudget }),
    });
    if (!res.ok) throw new Error('Failed to calculate budget rescue');
    return res.json();
  },

  async applyBudgetRescue(
    eventId: string,
    data: {
      newTargetBudget: number;
      acceptedProposalIds: string[];
      proposals: BudgetRescueResponse['proposals'];
    }
  ): Promise<{ success: boolean; event: EventFullDetail }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget-rescue/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to apply budget rescue');
    return res.json();
  },

  // AI Assistant
  async sendAssistantMessage(
    eventId: string,
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AIAssistantAction> {
    const res = await fetch(`${API_BASE}/events/${eventId}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversationHistory }),
    });
    if (!res.ok) throw new Error('Failed to get assistant response');
    return res.json();
  },

  async applyAssistantChanges(
    eventId: string,
    proposedChanges: AIAssistantAction['proposedChanges'],
    revisionNote?: string
  ): Promise<{ success: boolean; event: EventFullDetail }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/assistant/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedChanges, revisionNote }),
    });
    if (!res.ok) throw new Error('Failed to apply assistant changes');
    return res.json();
  },


  // AI Feedback Loop
  async submitAIFeedback(
    eventId: string,
    feedback: {
      suggestionId?: string;
      suggestionType?: string;
      rating: 'positive' | 'negative' | 'neutral';
      userAction?: 'accepted' | 'rejected' | 'modified' | 'viewed_only';
      feedbackComment?: string;
      category?: string;
    }
  ): Promise<{ success: boolean; id?: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ai/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suggestionType: 'assistant_chat',
        userAction: 'viewed_only',
        ...feedback,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // Team Collaboration & RBAC
  async getCollaborators(eventId: string): Promise<Collaborator[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/collaborators`);
    if (!res.ok) throw new Error('Failed to fetch collaborators');
    const data = await res.json();
    return data.collaborators || [];
  },

  async addCollaborator(eventId: string, email: string, role: string, name?: string): Promise<Collaborator> {
    const res = await fetch(`${API_BASE}/events/${eventId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, name }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add collaborator');
    }
    return res.json();
  },

  async removeCollaborator(eventId: string, collaboratorId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${eventId}/collaborators/${collaboratorId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove collaborator');
  },

  // Privacy & GDPR
  async exportUserData(): Promise<void> {
    const res = await fetch(`${API_BASE}/user/data-export`);
    if (!res.ok) throw new Error('Failed to export user data');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventpilot-gdpr-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getPrivacyPolicy(): Promise<PrivacyPolicyResponse> {
    const res = await fetch(`${API_BASE}/privacy/policy`);
    if (!res.ok) throw new Error('Failed to fetch privacy policy');
    return res.json();
  },

  // Observability & Metrics
  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },
};
