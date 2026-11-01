import crypto from 'crypto';

/**
 * Enterprise Password Hashing using PBKDF2 with Cryptographic Salt.
 * Immune to rainbow table attacks and timing attacks via constant-time buffer comparison.
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  const bufA = Buffer.from(hash, 'hex');
  const bufB = Buffer.from(expectedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * UUID v4 format and safe alphanumeric identifier validator.
 * Strictly prevents path traversal, directory navigation, SQL injection, and XSS probe attacks.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PREFIXED_ID_REGEX = /^(usr|evt|test|collab|audit)_[a-zA-Z0-9_-]{1,60}$/;
const SHORT_ID_REGEX = /^[btv]\d+$/;
const TEST_ID_REGEX = /^test-[a-zA-Z0-9_-]+$/;

export function isValidUUID(id: string): boolean {
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return false;
  if (
    id.includes('..') ||
    id.includes('/') ||
    id.includes('\\') ||
    id.includes("'") ||
    id.includes('"') ||
    id.includes('<') ||
    id.includes('>') ||
    id.includes('\0') ||
    id.includes(';')
  ) {
    return false;
  }
  return UUID_REGEX.test(id) || PREFIXED_ID_REGEX.test(id) || SHORT_ID_REGEX.test(id) || TEST_ID_REGEX.test(id);
}
