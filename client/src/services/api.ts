import {
  EventRecord,
  EventFullDetail,
  BudgetItem,
  TaskItem,
  VendorItem,
  BudgetRescueResponse,
  AIAssistantAction,
} from '../types';

const API_BASE = '/api';

export const api = {
  // Events
  async getEvents(): Promise<EventFullDetail[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getEvent(id: string): Promise<EventFullDetail> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    return res.json();
  },

  async createEvent(data: Partial<EventRecord>): Promise<EventFullDetail> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create event');
    }
    return res.json();
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
      proposals: any[];
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
    proposedChanges: any,
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

  // Team Collaboration & RBAC
  async getCollaborators(eventId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/collaborators`);
    if (!res.ok) throw new Error('Failed to fetch collaborators');
    const data = await res.json();
    return data.collaborators || [];
  },

  async addCollaborator(eventId: string, email: string, role: string, name?: string): Promise<any> {
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

  async getPrivacyPolicy(): Promise<any> {
    const res = await fetch(`${API_BASE}/privacy/policy`);
    if (!res.ok) throw new Error('Failed to fetch privacy policy');
    return res.json();
  },

  // Observability & Metrics
  async getMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },
};
