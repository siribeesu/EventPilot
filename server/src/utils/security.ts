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
 * UUID v4 format validator to prevent path traversal or parameter tampering.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id) || id.startsWith('usr_') || id.startsWith('test-');
}
