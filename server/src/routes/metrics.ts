import express from 'express';
import os from 'os';
import { db } from '../database/db.js';
import { aiCache } from '../ai/guardrails.js';

const router = express.Router();
const startTime = Date.now();

// Track requests and error counts in memory for real-time telemetry
let requestCount = 0;
let errorCount = 0;

export function recordMetricRequest(isError = false) {
  requestCount++;
  if (isError) errorCount++;
}

/**
 * System Telemetry & Operational Health Observability
 * GET /api/metrics
 */
router.get('/metrics', async (_req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const aiMetrics = aiCache.getMetrics();
  const events = await db.getEvents('usr_demo_123');

  res.json({
    timestamp: new Date().toISOString(),
    status: 'operational',
    uptime: {
      seconds: uptimeSeconds,
      formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    },
    performance: {
      totalRequestsServed: requestCount,
      errorCount,
      errorRate: requestCount > 0 ? `${((errorCount / requestCount) * 100).toFixed(2)}%` : '0.00%',
    },
    memory: {
      rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
      heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuCount: os.cpus().length,
      freeMemoryMB: (os.freemem() / 1024 / 1024).toFixed(2),
    },
    aiOptimization: {
      ...aiMetrics,
      cacheHitRatio:
        aiMetrics.totalRequests > 0
          ? `${((aiMetrics.cacheHits / aiMetrics.totalRequests) * 100).toFixed(1)}%`
          : '0.0%',
    },
    storage: {
      databaseType: process.env.DATABASE_URL ? 'PostgreSQL (Supabase/Neon)' : 'Local Persistent JSON Engine',
      activeEvents: events.length,
    },
  });
});

export default router;
