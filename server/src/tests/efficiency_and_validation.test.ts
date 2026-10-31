import { sanitizeObject } from '../utils/sanitize.js';
﻿import { describe, it, expect } from 'vitest';
import { memoryCache } from '../utils/cache.js';
import {
  CreateEventSchema,
  CreateBudgetItemSchema,
  CreateTaskSchema,
} from '../schemas/index.js';

describe('Efficiency, Caching & Validation Tests', () => {
  it('stores and retrieves items from in-memory cache with TTL', () => {
    memoryCache.set('test:key1', { hello: 'world' }, 10);
    const retrieved = memoryCache.get('test:key1');
    expect(retrieved).toEqual({ hello: 'world' });
  });

  it('invalidates cache keys by prefix', () => {
    memoryCache.set('events:user1', [1, 2, 3], 60);
    memoryCache.set('events:user2', [4, 5, 6], 60);
    memoryCache.set('other:key', 'keep me', 60);

    memoryCache.invalidate('events:user1');

    expect(memoryCache.get('events:user1')).toBeNull();
    expect(memoryCache.get('events:user2')).toEqual([4, 5, 6]);
    expect(memoryCache.get('other:key')).toBe('keep me');
  });

  it('validates event schema: rejects empty title and negative budget', () => {
    const invalidEvent = {
      title: 'A', // too short
      event_type: 'wedding',
      event_date: 'invalid-date',
      location: 'Goa',
      budget: -500, // negative budget
      currency: 'INR',
      guest_count: 0, // guest count must be at least 1
    };

    const result = CreateEventSchema.safeParse(invalidEvent);
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors.title).toBeDefined();
      expect(fieldErrors.budget).toBeDefined();
      expect(fieldErrors.event_date).toBeDefined();
    }
  });

  it('validates budget item schema: rejects negative costs', () => {
    const invalidBudgetItem = {
      category: 'Venue',
      name: 'Hall',
      estimated_cost: -1000,
    };

    const result = CreateBudgetItemSchema.safeParse(invalidBudgetItem);
    expect(result.success).toBe(false);
  });

  it('validates task schema: requires title and valid priorities', () => {
    const validTask = {
      title: 'Confirm caterer menu',
      priority: 'high',
      status: 'pending',
    };
    expect(CreateTaskSchema.safeParse(validTask).success).toBe(true);

    const invalidTask = {
      title: '',
      priority: 'invalid-priority',
    };
    expect(CreateTaskSchema.safeParse(invalidTask).success).toBe(false);
  });
  it('handles deep recursive sanitization across multi-dimensional arrays without type mutation', () => {
    const payload = {
      matrix: [
        ['<script>alert(1)</script>Clean', '<b>Bold</b>'],
        [{ inner: '  <iframe src=evil.com></iframe>Safe  ' }]
      ],
      numeric: 12345,
      flag: true
    };
    const sanitized = sanitizeObject(payload);
    expect(sanitized.matrix[0][0]).toBe('Clean');
    expect(sanitized.matrix[0][1]).toBe('Bold');
    expect((sanitized.matrix[1][0] as any).inner).toBe('Safe');
    expect(sanitized.numeric).toBe(12345);
    expect(sanitized.flag).toBe(true);
  });

  it('validates budget items reject non-numeric values and zero/negative costs correctly', () => {
    const invalidItem = {
      event_id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
      category: 'Catering',
      name: 'Buffet',
      estimated_cost: -500,
      actual_cost: 0,
      paid_amount: 0,
    };
    expect(() => CreateBudgetItemSchema.parse(invalidItem)).toThrow();
  });
});