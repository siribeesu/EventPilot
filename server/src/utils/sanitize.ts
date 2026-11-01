/**
 * Security input sanitizer:
 * Strips dangerous HTML tags, javascript: URIs, inline event handlers, and control characters to prevent XSS.
 * Protects against Prototype Pollution by blocking __proto__, constructor, and prototype property injection.
 */

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/\bon[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '') // strip inline event handlers (onerror=, onload=, etc.)
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // strip non-printable ASCII control characters
    .trim();
}

export function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' && item !== null
        ? sanitizeObject(item)
        : typeof item === 'string'
        ? sanitizeString(item)
        : item
    ) as unknown as T;
  }
  const sanitized: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Defend against Prototype Pollution attacks
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return Object.assign({}, sanitized) as T;
}
