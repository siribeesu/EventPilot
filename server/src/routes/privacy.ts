import express from 'express';
import { db } from '../database/db.js';
import { logAuditEvent } from '../services/auditService.js';
import { requireEventRole } from '../middleware/rbac.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

/**
 * GDPR Article 15 (Right of Access) & Data Portability Package
 * GET /api/user/data-export
 */
router.get('/user/data-export', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || req.userId || 'usr_demo_123';
    const dataPackage = await db.exportUserData(userId);

    await logAuditEvent(req, {
      action: 'GDPR_DATA_EXPORT',
      resource_type: 'user',
      resource_id: userId,
      status: 'success',
      metadata: { itemsExported: dataPackage.events.length },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=eventpilot-gdpr-export-${Date.now()}.json`);
    res.json(dataPackage);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * GDPR Article 17 (Right to Erasure / Right to be Forgotten)
 * DELETE /api/user/account
 */
router.delete('/user/account', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || req.userId || 'usr_demo_123';

    await logAuditEvent(req, {
      action: 'GDPR_ACCOUNT_PURGE_REQUESTED',
      resource_type: 'user',
      resource_id: userId,
      status: 'success',
    });

    await db.deleteUserAccount(userId);

    res.json({
      success: true,
      message: 'Account, owned events, and personal identification data have been completely purged under GDPR Right to Erasure.',
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Enterprise Data Privacy & Retention Disclosures
 * GET /api/privacy/policy
 */
router.get('/privacy/policy', (_req, res) => {
  res.json({
    compliance: ['GDPR', 'CCPA', 'SOC2-Type-II-Ready'],
    dataController: 'EventPilot AI Technologies Inc.',
    retentionPolicy: {
      activeEventData: 'Retained until user explicitly deletes event or account',
      auditLogs: 'Encrypted rolling 90-day retention for incident forensics and access auditing',
      aiInteractionData: 'Zero data retention agreement: prompts are not retained or used for LLM foundation model training',
    },
    rightsSupported: [
      'Right to Access & Portability (JSON download)',
      'Right to Erasure (Immediate cascade delete)',
      'Right to Rectification (Live updating of events and budgets)',
      'Role-based access limitation and isolation',
    ],
    securityGuards: {
      encryptionInTransit: 'TLS 1.3 / Strict-Transport-Security (HSTS 1 year)',
      passwords: 'PBKDF2 SHA-512 with cryptographically random salt (10,000 iterations)',
      rateLimiting: 'Per-IP token bucket against DDoS & automated scraping',
      promptInjectionDefense: 'Real-time lexical & heuristic input guardrails',
    },
  });
});

/**
 * User Security & Activity Log
 * GET /api/user/audit-logs
 */
router.get('/user/audit-logs', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || req.userId || 'usr_demo_123';
    const logs = await db.getAuditLogs({ actorId: userId, limit: 100 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/**
 * Event-Specific Audit Trail
 * GET /api/events/:id/audit-trail
 */
router.get('/events/:id/audit-trail', requireEventRole('viewer'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const logs = await db.getAuditLogs({ eventId, limit: 100 });
    res.json({ eventId, logs });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
