import { Router } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateBudgetItemSchema, UpdateBudgetItemSchema } from '../schemas/index.js';

const router = Router();

// GET all budget items for an event
router.get('/events/:id/budget', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found or access denied' });

    const items = await db.getBudgetItems(event.id);
    const totalEstimated = items.reduce((acc, i) => acc + (Number(i.estimated_cost) || 0), 0);
    const totalActual = items.reduce((acc, i) => acc + (Number(i.actual_cost) || 0), 0);
    const totalPaid = items.reduce((acc, i) => acc + (Number(i.paid_amount) || 0), 0);
    const totalBudget = Number(event.budget) || 0;

    res.json({
      items,
      summary: {
        totalBudget,
        totalEstimated,
        totalActual,
        totalPaid,
        remainingBalance: totalBudget - (totalActual > 0 ? totalActual : totalEstimated),
        isOverBudget: (totalActual > 0 ? totalActual : totalEstimated) > totalBudget,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST add budget item to an event
router.post('/events/:id/budget-items', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found or access denied' });

    const parsed = CreateBudgetItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const item = await db.createBudgetItem({
      event_id: event.id,
      ...parsed.data,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH update budget item with strict ownership verification
router.patch('/budget-items/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const itemId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';

    // Verify ownership
    const isOwner = await db.verifyBudgetItemOwnership(itemId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: item does not belong to user events' });
    }

    const parsed = UpdateBudgetItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const updated = await db.updateBudgetItem(itemId, parsed.data);
    if (!updated) return res.status(404).json({ error: 'Budget item not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE budget item with strict ownership verification
router.delete('/budget-items/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const itemId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';

    // Verify ownership
    const isOwner = await db.verifyBudgetItemOwnership(itemId, userId);
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: item does not belong to user events' });
    }

    const deleted = await db.deleteBudgetItem(itemId);
    if (!deleted) return res.status(404).json({ error: 'Budget item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
