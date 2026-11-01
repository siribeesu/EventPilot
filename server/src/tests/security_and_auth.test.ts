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

  it('handles invalid password hash formats safely without throwing exceptions', () => {
    expect(verifyPassword('password', 'salt', 'invalid-hex-length')).toBe(false);
    expect(verifyPassword('', '', '')).toBe(false);
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

  it('strips inline HTML event handlers to prevent DOM XSS', () => {
    const attack1 = '<img src=x onerror=alert(document.cookie)>';
    const attack2 = '<button onclick="exploit()" onload=\'bad()\'>Click</button>';
    expect(sanitizeString(attack1)).toBe('');
    expect(sanitizeString(attack2)).toBe('Click');
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

  it('protects against Prototype Pollution attacks', () => {
    const maliciousPayload = JSON.parse(
      '{"__proto__": {"polluted": true}, "constructor": {"prototype": {"isAdmin": true}}, "title": "Secure Gala"}'
    );
    const sanitized = sanitizeObject(maliciousPayload);

    expect(sanitized.title).toBe('Secure Gala');
    expect(Object.prototype.hasOwnProperty.call(sanitized, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(sanitized, 'constructor')).toBe(false);
    expect((sanitized as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).isAdmin).toBeUndefined();
  });

  it('validates UUID formats correctly and rejects invalid tampering', () => {
    expect(isValidUUID('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d')).toBe(true);
    expect(isValidUUID('usr_demo_123')).toBe(true);
    expect(isValidUUID('../../etc/passwd')).toBe(false);
    expect(isValidUUID("1' OR '1'='1")).toBe(false);
    expect(isValidUUID('invalid-uuid-string')).toBe(false);
    expect(isValidUUID('usr_123\0admin')).toBe(false);
    expect(isValidUUID('evt_123; DROP TABLE events;--')).toBe(false);
    expect(isValidUUID('..\\..\\windows\\system32')).toBe(false);
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
    const csp = res.headers.get('content-security-policy') || '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
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

  it('rejects tokens signed with "none" algorithm (CVE algorithm confusion mitigation)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 'usr_hacker', email: 'hacker@evil.com' })).toString('base64url');
    const unsignedNoneToken = `${header}.${payload}.`;

    const { authMiddleware } = await import('../middleware/auth.js');
    let statusCode = 0;
    let errorMessage = '';

    const reqMock = {
      headers: { authorization: `Bearer ${unsignedNoneToken}` },
    };
    const resMock = {
      status: (code: number) => { statusCode = code; return resMock; },
      json: (data: { error?: string }) => { errorMessage = data.error || ''; },
    };

    authMiddleware(reqMock as unknown as Parameters<typeof authMiddleware>[0], resMock as unknown as Parameters<typeof authMiddleware>[1], () => {});
    expect(statusCode).toBe(401);
    expect(errorMessage).toContain('Invalid or expired');
  });

  it('rejects expired JWT tokens immediately', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    const expiredToken = jwt.sign(
      { id: 'usr_expired', email: 'expired@eventpilot.ai' },
      'eventpilot_secret_jwt_key_2026',
      { expiresIn: '-10s', algorithm: 'HS256' }
    );

    const { authMiddleware } = await import('../middleware/auth.js');
    let statusCode = 0;
    let errorMessage = '';

    const reqMock = {
      headers: { authorization: `Bearer ${expiredToken}` },
    };
    const resMock = {
      status: (code: number) => { statusCode = code; return resMock; },
      json: (data: { error?: string }) => { errorMessage = data.error || ''; },
    };

    authMiddleware(reqMock as unknown as Parameters<typeof authMiddleware>[0], resMock as unknown as Parameters<typeof authMiddleware>[1], () => {});
    expect(statusCode).toBe(401);
    expect(errorMessage).toContain('Invalid or expired');
  });

  it('generates verifiable tokens with pinned HS256 algorithm', async () => {
    const { generateToken, authMiddleware } = await import('../middleware/auth.js');
    const validToken = generateToken({ id: 'usr_valid_sec', email: 'sec@eventpilot.ai' });
    expect(typeof validToken).toBe('string');

    let nextCalled = false;
    const reqMock: Record<string, unknown> = {
      headers: { authorization: `Bearer ${validToken}` },
    };
    const resMock = {
      status: () => resMock,
      json: () => {},
    };

    authMiddleware(reqMock as unknown as Parameters<typeof authMiddleware>[0], resMock as unknown as Parameters<typeof authMiddleware>[1], () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(reqMock.userId).toBe('usr_valid_sec');
    expect(reqMock.userEmail).toBe('sec@eventpilot.ai');
  });
});
