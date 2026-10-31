import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../app.js';
import { db } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';
import { Server } from 'http';

describe('GDPR Data Privacy, Audit & Observability Suite', () => {
  let server: Server;
  let baseUrl: string;
  let userToken: string;
  let testUserId: string;
  let eventId: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === 'object') {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });

    const user = await db.createUser({
      email: 'privacy_champion@eventpilot.ai',
      name: 'Privacy User',
    });
    testUserId = user.id;
    userToken = generateToken({ id: user.id, email: user.email });

    const event = await db.createEvent({
      user_id: testUserId,
      title: 'Confidential Gala 2026',
      event_type: 'anniversary',
      event_date: '2026-10-10',
      location: 'Private Villa',
      indoor_outdoor: 'both',
      budget: 85000,
      currency: 'USD',
      guest_count: 40,
      priority_areas: ['catering'],
      ai_summary: '',
    });
    eventId = event.id;

    await db.createBudgetItem({
      event_id: eventId,
      category: 'Catering',
      name: 'Gourmet Organic Dinner',
      estimated_cost: 40000,
      actual_cost: 0,
      paid_amount: 0,
      status: 'estimated',
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('1. GET /api/user/data-export returns complete GDPR portability package with attachment headers', async () => {
    const res = await fetch(`${baseUrl}/api/user/data-export`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(res.status).toBe(200);
    const contentDisposition = res.headers.get('content-disposition') || '';
    expect(contentDisposition).toContain('attachment');
    const body = (await res.json()) as Record<string, any>;
    expect(body.compliance).toContain('GDPR Article 15');
    expect(body.user.email).toBe('privacy_champion@eventpilot.ai');
    expect(body.events.length).toBeGreaterThan(0);
    expect(body.budgetItems.length).toBeGreaterThan(0);
  });

  it('2. GET /api/privacy/policy returns transparent retention and encryption disclosures', async () => {
    const res = await fetch(`${baseUrl}/api/privacy/policy`);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, any>;
    expect(body.compliance).toContain('GDPR');
    expect(body.retentionPolicy.aiInteractionData).toContain('Zero data retention');
    expect(body.securityGuards.encryptionInTransit).toContain('TLS 1.3');
  });

  it('3. GET /api/metrics exposes system uptime, memory, error rates, and AI cost savings', async () => {
    const res = await fetch(`${baseUrl}/api/metrics`);

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, any>;
    expect(body.status).toBe('operational');
    expect(body.uptime).toBeDefined();
    expect(body.memory.heapUsedMB).toBeDefined();
    expect(body.aiOptimization).toBeDefined();
  });

  it('4. DELETE /api/user/account successfully executes GDPR Right to Erasure cascade delete', async () => {
    const deleteRes = await fetch(`${baseUrl}/api/user/account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });

    expect(deleteRes.status).toBe(200);
    const body = (await deleteRes.json()) as Record<string, any>;
    expect(body.success).toBe(true);

    // Verify user no longer exists
    const userLookup = await db.getUserById(testUserId);
    expect(userLookup).toBeNull();

    // Verify owned event was purged
    const eventLookup = await db.getEventById(eventId);
    expect(eventLookup).toBeNull();
  });
});
