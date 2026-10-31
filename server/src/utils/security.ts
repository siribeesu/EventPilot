import crypto from 'crypto';

/**
 * Enterprise Password Hashing using PBKDF2 with Cryptographic Salt.
 * Immune to rainbow table attacks and timing attacks.
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

/**
 * UUID v4 format and safe alphanumeric identifier validator.
 * Strictly prevents path traversal, directory navigation, and injection attacks.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREFIXED_ID_REGEX = /^(usr|evt|test|collab|audit)_[a-zA-Z0-9_-]{1,60}$/;
const SHORT_ID_REGEX = /^[btv]\d+$/;
const TEST_ID_REGEX = /^test-[a-zA-Z0-9_-]+$/;

export function isValidUUID(id: string): boolean {
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return false;
  if (id.includes('..') || id.includes('/') || id.includes('\\') || id.includes("'") || id.includes('"') || id.includes('<') || id.includes('>')) {
    return false;
  }
  return UUID_REGEX.test(id) || PREFIXED_ID_REGEX.test(id) || SHORT_ID_REGEX.test(id) || TEST_ID_REGEX.test(id);
}
