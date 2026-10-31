import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, isValidUUID } from '../utils/security.js';
import { sanitizeString, sanitizeObject } from '../utils/sanitize.js';
import { db } from '../database/db.js';

describe('Security Layer & Cryptography Tests', () => {
  it('hashes passwords securely using PBKDF2 with unique salts', () => {
    const pass = 'SuperSecret2026!';
    const { salt: salt1, hash: hash1 } = hashPassword(pass);
    const { salt: salt2, hash: hash2 } = hashPassword(pass);

    expect(salt1).not.toBe(salt2);
    expect(hash1).not.toBe(hash2);
    expect(verifyPassword(pass, salt1, hash1)).toBe(true);
    expect(verifyPassword('WrongPassword', salt1, hash1)).toBe(false);
  });

  it('sanitizes malicious XSS script tags and control characters', () => {
    const malicious = '<script>alert("XSS")</script>Hello <b>World</b><style>body{color:red;}</style>';
    const cleaned = sanitizeString(malicious);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert');
    expect(cleaned).not.toContain('<style>');
    expect(cleaned).not.toContain('<b>');
    expect(cleaned).toBe('Hello World');
  });

  it('strips javascript: and data: pseudo-protocols', () => {
    const link = 'javascript:alert(1)';
    expect(sanitizeString(link)).not.toContain('javascript:');
  });

  it('recursively sanitizes nested objects', () => {
    const payload = {
      title: '  <script>evil()</script>Anniversary Party  ',
      nested: {
        notes: 'Includes <img src=x onerror=alert(1)> floral decor',
      },
      count: 42,
    };
    const sanitized = sanitizeObject(payload);
    expect(sanitized.title).toBe('Anniversary Party');
    expect(sanitized.nested.notes).toBe('Includes  floral decor');
    expect(sanitized.count).toBe(42);
  });

  it('validates UUID formats correctly and rejects invalid tampering', () => {
    expect(isValidUUID('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d')).toBe(true);
    expect(isValidUUID('usr_demo_123')).toBe(true);
    expect(isValidUUID('../../etc/passwd')).toBe(false);
    expect(isValidUUID("1' OR '1'='1")).toBe(false);
    expect(isValidUUID('invalid-uuid-string')).toBe(false);
  });

  it('enforces ownership checks: blocks foreign users from unauthorized item access', async () => {
    const testEvent = await db.createEvent({
      user_id: 'usr_alice_owner',
      title: "Alice's Birthday",
      event_type: 'birthday',
      event_date: '2026-11-10',
      location: 'Goa',
      indoor_outdoor: 'outdoor',
      budget: 30000,
      currency: 'INR',
      guest_count: 30,
      priority_areas: ['venue'],
    });

    const item = await db.createBudgetItem({
      event_id: testEvent.id,
      category: 'Venue',
      name: 'Beach Shack Rental',
      estimated_cost: 10000,
      actual_cost: 0,
      paid_amount: 0,
      status: 'estimated',
    });

    // Alice is owner -> true
    const isAliceOwner = await db.verifyBudgetItemOwnership(item.id, 'usr_alice_owner');
    expect(isAliceOwner).toBe(true);

    // Bob is not owner -> false
    const isBobOwner = await db.verifyBudgetItemOwnership(item.id, 'usr_bob_attacker');
    expect(isBobOwner).toBe(false);
  });
  it('enforces defensive security headers: X-Frame-Options, X-Content-Type-Options and Permissions-Policy', async () => {
    const { app } = await import('../app.js');
    const { createServer } = await import('http');
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as { port: number };
    const res = await fetch(`http://localhost:${address.port}/api/health`);
    server.close();

    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('permissions-policy')).toContain('camera=()');
  });

  it('rejects forged JWT tokens and algorithm manipulation', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const forgedToken = jwt.sign({ id: 'usr_fake', email: 'fake@attacker.com' }, 'wrong_secret');
    
    const { authMiddleware } = await import('../middleware/auth.js');
    let statusCode = 0;
    let errorMessage = '';

    const reqMock = {
      headers: { authorization: `Bearer ${forgedToken}` },
    };
    const resMock = {
      status: (code: number) => { statusCode = code; return resMock; },
      json: (data: { error?: string }) => { errorMessage = data.error || ''; },
    };

    authMiddleware(reqMock as unknown as Parameters<typeof authMiddleware>[0], resMock as unknown as Parameters<typeof authMiddleware>[1], () => {});
    expect(statusCode).toBe(401);
    expect(errorMessage).toContain('Invalid or expired');
  });
});