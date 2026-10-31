import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../app.js';
import { db } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';
import { Server } from 'http';

interface CollaboratorsListResponse {
  collaborators: Array<{ id: string; user_email: string; role: string }>;
}
interface CollaboratorActionResponse {
  code?: string;
  collaborator: { role: string; user_email: string };
  success?: boolean;
}
interface SimpleActionResponse {
  code?: string;
  success?: boolean;
}

describe('RBAC & Team Collaboration Suite', () => {
  let server: Server;
  let baseUrl: string;
  let ownerToken: string;
  let editorToken: string;
  let viewerToken: string;
  let strangerToken: string;
  let testEventId: string;

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

    // 1. Create test users
    const owner = await db.createUser({ email: 'owner@eventpilot.ai', name: 'Owner User' });
    const editor = await db.createUser({ email: 'editor@eventpilot.ai', name: 'Editor User' });
    const viewer = await db.createUser({ email: 'viewer@eventpilot.ai', name: 'Viewer User' });
    const stranger = await db.createUser({ email: 'stranger@eventpilot.ai', name: 'Stranger User' });

    ownerToken = generateToken({ id: owner.id, email: owner.email });
    editorToken = generateToken({ id: editor.id, email: editor.email });
    viewerToken = generateToken({ id: viewer.id, email: viewer.email });
    strangerToken = generateToken({ id: stranger.id, email: stranger.email });

    // 2. Owner creates an event
    const event = await db.createEvent({
      user_id: owner.id,
      title: 'Global Tech Conference 2026',
      event_type: 'college',
      event_date: '2026-12-15',
      location: 'Grand Ballroom',
      indoor_outdoor: 'indoor',
      budget: 250000,
      currency: 'INR',
      guest_count: 300,
      priority_areas: ['venue', 'catering'],
      ai_summary: '',
    });
    testEventId = event.id;

    // 3. Add collaborators
    await db.addCollaborator({
      event_id: testEventId,
      user_id: editor.id,
      user_email: editor.email,
      user_name: editor.name,
      role: 'editor',
      invited_by: owner.id,
    });

    await db.addCollaborator({
      event_id: testEventId,
      user_id: viewer.id,
      user_email: viewer.email,
      user_name: viewer.name,
      role: 'viewer',
      invited_by: owner.id,
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('1. Owner has owner role and can access event collaborators', async () => {
    const res = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators`, {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as CollaboratorsListResponse;
    expect(body.collaborators).toBeDefined();
    expect(body.collaborators.length).toBe(2);
  });

  it('1b. Editor can read event collaborators list', async () => {
    const res = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators`, {
      headers: { Authorization: `Bearer ${editorToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('2. Viewer can view event details and collaborators list but cannot add collaborators', async () => {
    // Read: OK
    const readRes = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    expect(readRes.status).toBe(200);

    // Write: Forbidden (403)
    const writeRes = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${viewerToken}`,
      },
      body: JSON.stringify({ email: 'newbie@eventpilot.ai', role: 'viewer' }),
    });
    expect(writeRes.status).toBe(403);
    const writeBody = (await writeRes.json()) as SimpleActionResponse;
    expect(writeBody.code).toBe('INSUFFICIENT_ROLE');
  });

  it('3. Stranger user cannot access event details or audit trail (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/api/events/${testEventId}/audit-trail`, {
      headers: { Authorization: `Bearer ${strangerToken}` },
    });

    expect(res.status).toBe(403);
    const body = (await res.json()) as SimpleActionResponse;
    expect(body.code).toBe('FORBIDDEN_EVENT_ACCESS');
  });

  it('4. Owner can invite new collaborators with validation and audit logging', async () => {
    const res = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({ email: 'coordinator@eventpilot.ai', role: 'editor', name: 'Coordinator' }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as CollaboratorActionResponse;
    expect(body.collaborator.role).toBe('editor');
    expect(body.collaborator.user_email).toBe('coordinator@eventpilot.ai');
  });

  it('5. Removing a collaborator successfully revokes access from event', async () => {
    const collabs = await db.getCollaborators(testEventId);
    const target = collabs.find(c => c.user_email === 'coordinator@eventpilot.ai');
    expect(target).toBeDefined();

    const deleteRes = await fetch(`${baseUrl}/api/events/${testEventId}/collaborators/${target!.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    expect(deleteRes.status).toBe(200);
    const body = (await deleteRes.json()) as SimpleActionResponse;
    expect(body.success).toBe(true);

    const remaining = await db.getCollaborators(testEventId);
    expect(remaining.some(c => c.id === target!.id)).toBe(false);
  });
});
