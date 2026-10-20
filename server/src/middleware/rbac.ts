import { Response, NextFunction } from 'express';
import { db } from '../database/db.js';
import { CollaboratorRole } from '../types/index.js';
import { AuthenticatedRequest } from './auth.js';

const ROLE_HIERARCHY: Record<CollaboratorRole, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

/**
 * RBAC Middleware: Enforces that authenticated user holds at least the required role
 * for the requested event (supports URL param :id or :eventId).
 */
export function requireEventRole(minimumRole: CollaboratorRole) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const rawId = req.params.id || req.params.eventId || req.body?.event_id;
    const eventId = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.id || req.userId || 'usr_demo_123';

    if (!eventId) {
      res.status(400).json({ error: 'Event ID required for authorization verification', code: 'MISSING_EVENT_ID' });
      return;
    }

    const role = await db.getUserRole(eventId, userId);

    if (!role) {
      // User is neither owner nor collaborator
      await db.createAuditLog({
        request_id: (req as any).requestId,
        actor_id: userId,
        actor_email: req.user?.email,
        action: 'ACCESS_DENIED',
        resource_type: 'event',
        resource_id: eventId,
        status: 'denied',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { path: req.path, requiredRole: minimumRole },
      });

      res.status(403).json({
        error: 'You do not have access to this event',
        code: 'FORBIDDEN_EVENT_ACCESS',
      });
      return;
    }

    const userWeight = ROLE_HIERARCHY[role] || 0;
    const requiredWeight = ROLE_HIERARCHY[minimumRole];

    if (userWeight < requiredWeight) {
      await db.createAuditLog({
        request_id: (req as any).requestId,
        actor_id: userId,
        actor_email: req.user?.email,
        action: 'INSUFFICIENT_PRIVILEGES',
        resource_type: 'event',
        resource_id: eventId,
        status: 'denied',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { path: req.path, userRole: role, requiredRole: minimumRole },
      });

      res.status(403).json({
        error: `Insufficient permissions. Operation requires '${minimumRole}' role (you are '${role}')`,
        code: 'INSUFFICIENT_ROLE',
      });
      return;
    }

    // Attach role to request context for downstream handlers
    (req as any).eventRole = role;
    next();
  };
}
