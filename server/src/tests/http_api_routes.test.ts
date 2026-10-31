import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { app } from '../app.js';
import { generateToken } from '../middleware/auth.js';

describe('HTTP REST API Integration & Route Coverage Suite', () => {
  let server: Server;
  let baseUrl: string;
  let authToken: string;
  const testUserId = 'usr_http_test_runner';
  const testEmail = 'httprunner@eventpilot.ai';
  let createdEventId: string;
  let createdBudgetItemId: string;
  let createdTaskId: string;
  let createdVendorId: string;

  beforeAll(async () => {
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const addr = server.address() as { port: number };
    baseUrl = `http://localhost:${addr.port}`;
    authToken = generateToken({ id: testUserId, email: testEmail });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // 1. Authentication Routes
  describe('1. Authentication API (/api/auth)', () => {
    const regEmail = `test_${Date.now()}@eventpilot.ai`;

    it('POST /api/auth/register creates user account and returns jwt token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Tester',
          email: regEmail,
          password: 'TestPassword123!',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(regEmail);
    });

    it('POST /api/auth/register rejects duplicate registration with 409 Conflict', async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Integration Tester Duplicate',
          email: regEmail,
          password: 'TestPassword123!',
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toMatch(/already exists/i);
    });

    it('POST /api/auth/login validates credentials and issues token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: 'TestPassword123!',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(regEmail);
    });

    it('POST /api/auth/login rejects incorrect passwords with 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: 'WrongPassword999!',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/invalid credentials/i);
    });

    it('GET /api/auth/me returns current session user with valid Bearer token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe(testEmail);
    });
  });

  // 2. Events API Endpoints
  describe('2. Events API (/api/events)', () => {
    it('POST /api/events creates an event with validation', async () => {
      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'HTTP Integration Gala',
          event_type: 'community',
          event_date: '2026-11-20',
          location: 'Hyderabad International Convention Centre',
          budget: 150000,
          currency: 'INR',
          guest_count: 250,
          theme_preference: 'Cyber Gala',
          priority_areas: ['venue', 'catering'],
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe('HTTP Integration Gala');
      createdEventId = data.id;
    });

    it('POST /api/events rejects invalid payload (e.g. negative budget) with 400', async () => {
      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Invalid Budget Event',
          event_type: 'birthday',
          event_date: '2026-12-10',
          location: 'Delhi',
          budget: -1000,
          guest_count: 10,
        }),
      });

      expect(res.status).toBe(400);
    });

    it('GET /api/events lists events for the user', async () => {
      const res = await fetch(`${baseUrl}/api/events`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((e: { id: string }) => e.id === createdEventId)).toBe(true);
    });

    it('GET /api/events/:id returns full event details', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(createdEventId);
      expect(data.title).toBe('HTTP Integration Gala');
    });

    it('GET /api/events/:id returns 404 for non-existent event ID', async () => {
      const res = await fetch(`${baseUrl}/api/events/00000000-0000-4000-8000-000000000000`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(404);
    });

    it('PATCH /api/events/:id updates event attributes', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'HTTP Integration Gala (Updated)',
          budget: 180000,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('HTTP Integration Gala (Updated)');
      expect(data.budget).toBe(180000);
    });
  });

  // 3. Budget Management API
  describe('3. Budget API (/api/events/:id/budget)', () => {
    it('POST /api/events/:id/budget-items adds a line item', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/budget-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          category: 'Catering',
          name: 'Executive Lunch Buffet',
          estimated_cost: 45000,
          actual_cost: 0,
          notes: 'Multi-cuisine lunch for attendees',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Executive Lunch Buffet');
      createdBudgetItemId = data.id;
    });

    it('GET /api/events/:id/budget calculates summary and balances', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/budget`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.summary.totalBudget).toBe(180000);
      expect(data.summary.totalEstimated).toBeGreaterThanOrEqual(45000);
      expect(data.summary.remainingBalance).toBeDefined();
    });

    it('PATCH /api/budget-items/:id updates costs and status', async () => {
      const res = await fetch(`${baseUrl}/api/budget-items/${createdBudgetItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          actual_cost: 42000,
          paid_amount: 20000,
          status: 'booked',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.actual_cost).toBe(42000);
      expect(data.paid_amount).toBe(20000);
    });
  });

  // 4. Tasks API
  describe('4. Tasks API (/api/events/:id/tasks)', () => {
    it('POST /api/events/:id/tasks creates a workflow task', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Finalize Audio/Visual vendor',
          category: 'production',
          days_before_event: 14,
          priority: 'high',
          status: 'pending',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.title).toBe('Finalize Audio/Visual vendor');
      createdTaskId = data.id;
    });

    it('GET /api/events/:id/tasks lists all tasks', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((t: { id: string }) => t.id === createdTaskId)).toBe(true);
    });

    it('PATCH /api/tasks/:id marks a task completed', async () => {
      const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'completed',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('completed');
    });
  });

  // 5. Vendors API
  describe('5. Vendors API (/api/events/:id/vendors)', () => {
    it('POST /api/events/:id/vendors registers a vendor for the event', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          category: 'Photography',
          name: 'PixelCraft Studios',
          contact_name: 'Rahul Sen',
          contact_email: 'rahul@pixelcraft.io',
          contact_phone: '+91 98765 43210',
          quoted_amount: 35000,
          booking_status: 'researching',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe('PixelCraft Studios');
      createdVendorId = data.id;
    });

    it('GET /api/events/:id/vendors retrieves vendors list', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/vendors`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((v: { id: string }) => v.id === createdVendorId)).toBe(true);
    });

    it('PATCH /api/vendors/:id updates vendor status and quote', async () => {
      const res = await fetch(`${baseUrl}/api/vendors/${createdVendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          booking_status: 'booked',
          quoted_amount: 32000,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.booking_status).toBe('booked');
      expect(data.quoted_amount).toBe(32000);
    });
  });

  // 6. Collaborators API
  describe('6. Collaborators API (/api/events/:id/collaborators)', () => {
    let createdCollabId: string;

    it('POST /api/events/:id/collaborators invites a new team member', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: 'assistant.coordinator@eventpilot.ai',
          name: 'Co-Organizer Sarah',
          role: 'editor',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.collaborator.id).toBeDefined();
      expect(data.collaborator.role).toBe('editor');
      createdCollabId = data.collaborator.id;
    });

    it('GET /api/events/:id/collaborators returns active collaborators', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/collaborators`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.collaborators.length).toBeGreaterThan(0);
    });

    it('DELETE /api/events/:id/collaborators/:collabId removes collaborator', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/collaborators/${createdCollabId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  // 7. Individual Resource Deletion Tests
  describe('7. Resource Deletion Verification', () => {
    it('DELETE /api/vendors/:id removes vendor', async () => {
      const res = await fetch(`${baseUrl}/api/vendors/${createdVendorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/tasks/:id removes task', async () => {
      const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/budget-items/:id removes budget item', async () => {
      const res = await fetch(`${baseUrl}/api/budget-items/${createdBudgetItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
    });
  });

  // 8. AI Plan & Budget Rescue API
  describe('8. AI Plan Generation & Budget Rescue Endpoints', () => {
    it('POST /api/events/:id/generate-plan generates deterministic plan fallback or AI items', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.budget_items).toBeDefined();
      expect(data.tasks).toBeDefined();
      expect(data.budget_items.length).toBeGreaterThan(0);
    });

    it('POST /api/events/:id/budget-rescue/preview returns trade-off adjustments', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}/budget-rescue/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          targetBudget: 120000,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.proposals).toBeDefined();
      expect(Array.isArray(data.proposals)).toBe(true);
    });
  });

  // 9. GDPR Privacy & Account Endpoints
  describe('9. GDPR Privacy API', () => {
    it('GET /api/user/data-export returns complete user data package', async () => {
      const res = await fetch(`${baseUrl}/api/user/data-export`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.events).toBeDefined();
      expect(Array.isArray(data.events)).toBe(true);
    });
  });

  // 10. Event Cleanup
  describe('10. Event Cleanup Verification', () => {
    it('DELETE /api/events/:id removes event and associated children', async () => {
      const res = await fetch(`${baseUrl}/api/events/${createdEventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(200);
    });
  });
});
