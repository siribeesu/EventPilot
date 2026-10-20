import express from 'express';
import { z } from 'zod';
import { db } from '../database/db.js';
import { requireEventRole } from '../middleware/rbac.js';
import { logAuditEvent } from '../services/auditService.js';
import { validateBody } from '../middleware/validate.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

const AddCollaboratorSchema = z.object({
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']),
  name: z.string().min(1).max(100).optional(),
});

// GET /events/:id/collaborators
router.get('/events/:id/collaborators', requireEventRole('viewer'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const collabs = await db.getCollaborators(eventId);
    res.json({ collaborators: collabs });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /events/:id/collaborators
router.post(
  '/events/:id/collaborators',
  requireEventRole('owner'),
  validateBody(AddCollaboratorSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const eventId = String(req.params.id);
      const { email, role, name } = req.body;
      const currentUserId = req.user?.id || req.userId || 'usr_demo_123';

      // Check if user exists or create placeholder
      let targetUser = await db.getUserByEmail(email);
      let targetUserId = targetUser?.id;

      if (!targetUserId) {
        targetUserId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
      }

      const collab = await db.addCollaborator({
        event_id: eventId,
        user_id: targetUserId,
        user_email: email,
        user_name: name || targetUser?.name || email.split('@')[0],
        role,
        invited_by: currentUserId,
      });

      await logAuditEvent(req, {
        action: 'COLLABORATOR_INVITED',
        resource_type: 'collaborator',
        resource_id: collab.id,
        status: 'success',
        metadata: { eventId, invitedEmail: email, role },
      });

      res.status(201).json({ collaborator: collab, message: `Successfully invited ${email} as ${role}` });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// DELETE /events/:id/collaborators/:collaboratorId
router.delete('/events/:id/collaborators/:collaboratorId', requireEventRole('owner'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const collaboratorId = String(req.params.collaboratorId);
    const removed = await db.removeCollaborator(eventId, collaboratorId);

    if (!removed) {
      res.status(404).json({ error: 'Collaborator not found' });
      return;
    }

    await logAuditEvent(req, {
      action: 'COLLABORATOR_REMOVED',
      resource_type: 'collaborator',
      resource_id: collaboratorId,
      status: 'success',
      metadata: { eventId, collaboratorId },
    });

    res.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
