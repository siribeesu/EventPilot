import { db } from '../database/db.js';
import { AuditLog } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function logAuditEvent(
  req: AuthenticatedRequest,
  entry: {
    action: string;
    resource_type: AuditLog['resource_type'];
    resource_id?: string;
    status: 'success' | 'denied' | 'failed';
    metadata?: Record<string, any>;
  }
): Promise<AuditLog> {
  const actorId = req.user?.id || req.userId || 'usr_demo_123';
  const actorEmail = req.user?.email || req.userEmail || 'planner@eventpilot.ai';
  const requestId = (req as any).requestId;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';

  return db.createAuditLog({
    request_id: requestId,
    actor_id: actorId,
    actor_email: actorEmail,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id,
    status: entry.status,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: entry.metadata,
  });
}
