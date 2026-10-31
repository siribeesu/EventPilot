import crypto from 'crypto';
import { AIGeneratedPlan, AIGeneratedPlanSchema } from '../schemas/index.js';
import { AIUsageMetrics } from '../types/index.js';

/**
 * Known Prompt Injection & Jailbreak Attack Patterns
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|directions)/i,
  /disregard\s+(all\s+)?(previous|prior|safety)\s+(instructions|rules|guidelines)/i,
  /act\s+as\s+(dan|an\s+unrestricted|a\s+jailbroken|godmode)/i,
  /you\s+are\s+now\s+(in\s+developer\s+mode|unfiltered)/i,
  /system\s*:\s*override/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\].*\[\/INST\]/is,
  /reveal\s+(your\s+)?(system\s+prompt|internal\s+instructions|api\s+keys?)/i,
  /output\s+only\s+(the\s+)?password/i,
  /bypass\s+(safety|content\s+filters|moderation)/i,
];

export interface PromptInspectionResult {
  isSafe: boolean;
  reason?: string;
  riskScore: number; // 0 to 1
  sanitized: string;
}

/**
 * Real-time Prompt Injection and Delimiter Hijack Detector
 */
export function inspectPromptSafety(input: string): PromptInspectionResult {
  if (!input || typeof input !== 'string') {
    return { isSafe: true, riskScore: 0, sanitized: '' };
  }

  let riskScore = 0;
  const matchedPatterns: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      riskScore += 0.45;
      matchedPatterns.push(pattern.source);
    }
  }

  // Check for suspicious control characters or delimiter stuffing
  const delimiterCount = (input.match(/```|---|===|<\|/g) || []).length;
  if (delimiterCount > 4) {
    riskScore += 0.45;
    matchedPatterns.push('Excessive markdown delimiter stuffing');
  }

  // Sanitize: strip out control characters and prompt boundary tokens
  const sanitized = input
    .replace(/<\|im_start\|>|<\|im_end\|>/gi, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '')
    .trim();

  const isSafe = riskScore < 0.4;

  return {
    isSafe,
    riskScore: Math.min(1, riskScore),
    reason: isSafe ? undefined : `Potential prompt injection flagged: ${matchedPatterns.join('; ')}`,
    sanitized,
  };
}

/**
 * Output Validation & Hallucination Guardrail
 * Ensures AI responses conform strictly to schema and bounds
 */
export function validateAndSanitizeAIPlan(
  rawPlanInput: unknown,
  eventBudget: number
): { valid: boolean; plan?: AIGeneratedPlan; error?: string } {
  try {
    if (!rawPlanInput || typeof rawPlanInput !== 'object' || Array.isArray(rawPlanInput)) {
      return { valid: false, error: 'AI output must be a valid JSON object' };
    }

    const rawPlan = { ...(rawPlanInput as Record<string, unknown>) };

    // Pre-sanitize text fields to eliminate script injection
    const cleanText = (s: unknown) => (typeof s === 'string' ? s.replace(/<[^>]*>?/gm, '').trim() : '');
    if (typeof rawPlan.eventSummary === 'string') {
      rawPlan.eventSummary = cleanText(rawPlan.eventSummary);
    }

    // Clamp budget items to realistic bounds
    if (Array.isArray(rawPlan.budget)) {
      rawPlan.budget = rawPlan.budget.map((b: unknown) => {
        const item = (typeof b === 'object' && b !== null ? b : {}) as Record<string, unknown>;
        return {
          ...item,
          name: cleanText(item.name),
          reason: cleanText(item.reason),
          estimatedCost: Math.min(Math.max(0, Number(item.estimatedCost) || 0), eventBudget),
        };
      });
    }

    if (Array.isArray(rawPlan.themes)) {
      rawPlan.themes = rawPlan.themes.map((t: unknown) => {
        const item = (typeof t === 'object' && t !== null ? t : {}) as Record<string, unknown>;
        return {
          ...item,
          name: cleanText(item.name),
          description: cleanText(item.description),
          estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
        };
      });
    }

    if (Array.isArray(rawPlan.decorations)) {
      rawPlan.decorations = rawPlan.decorations.map((d: unknown) => {
        const item = (typeof d === 'object' && d !== null ? d : {}) as Record<string, unknown>;
        return {
          ...item,
          title: cleanText(item.title),
          description: cleanText(item.description),
          estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
        };
      });
    }

    if (Array.isArray(rawPlan.menus)) {
      rawPlan.menus = rawPlan.menus.map((m: unknown) => {
        const item = (typeof m === 'object' && m !== null ? m : {}) as Record<string, unknown>;
        return {
          ...item,
          title: cleanText(item.title),
          description: cleanText(item.description),
          estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
        };
      });
    }

    if (Array.isArray(rawPlan.activities)) {
      rawPlan.activities = rawPlan.activities.map((a: unknown) => {
        const item = (typeof a === 'object' && a !== null ? a : {}) as Record<string, unknown>;
        return {
          ...item,
          title: cleanText(item.title),
          description: cleanText(item.description),
          estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
        };
      });
    }

    if (Array.isArray(rawPlan.timeline)) {
      rawPlan.timeline = rawPlan.timeline.map((t: unknown) => {
        const item = (typeof t === 'object' && t !== null ? t : {}) as Record<string, unknown>;
        return {
          ...item,
          task: cleanText(item.task),
          daysBeforeEvent: Math.max(0, Math.floor(Number(item.daysBeforeEvent) || 0)),
        };
      });
    }

    const parsed = AIGeneratedPlanSchema.parse(rawPlan);

    // Guardrail: Check for non-positive total
    const totalProposed = parsed.budget.reduce((acc, b) => acc + (Number(b.estimatedCost) || 0), 0);
    if (totalProposed <= 0) {
      return { valid: false, error: 'AI budget estimation generated non-positive total' };
    }

    return { valid: true, plan: parsed };
  } catch (err) {
    return { valid: false, error: (err as Error).message };
  }
}

/**
 * Semantic / Deterministic Plan Cache for Cost & Latency Optimization
 */
interface CacheEntry {
  plan: AIGeneratedPlan;
  timestamp: number;
}

class AICacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 60 * 60 * 1000; // 1 hour TTL
  private metrics: AIUsageMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    promptInjectionsBlocked: 0,
    estimatedTokensSaved: 0,
    costSavedUSD: 0,
  };

  createKey(params: {
    eventId: string;
    budget: number;
    guestCount: number;
    eventType: string;
    location: string;
    priorities: string[];
  }): string {
    const normalized = `${params.eventId}|${params.budget}|${params.guestCount}|${params.eventType}|${params.location}|${params.priorities.sort().join(',')}`;
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  get(key: string): AIGeneratedPlan | null {
    this.metrics.totalRequests++;
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    this.metrics.cacheHits++;
    this.metrics.estimatedTokensSaved += 2400; // Average plan prompt + completion tokens
    this.metrics.costSavedUSD = parseFloat((this.metrics.estimatedTokensSaved * 0.000002).toFixed(4));
    return entry.plan;
  }

  set(key: string, plan: AIGeneratedPlan): void {
    // Keep max 200 items in memory cache
    if (this.cache.size > 200) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { plan, timestamp: Date.now() });
  }

  recordBlockedInjection(): void {
    this.metrics.promptInjectionsBlocked++;
  }

  getMetrics(): AIUsageMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.cache.clear();
  }
}

export const aiCache = new AICacheManager();
