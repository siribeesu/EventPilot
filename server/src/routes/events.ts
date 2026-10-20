import { Router } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  CreateEventSchema,
  UpdateEventSchema,
  AIAssistantMessageSchema,
} from '../schemas/index.js';
import {
  generateAIEventPlan,
  calculateBudgetRescue,
  processAssistantMessage,
} from '../ai/planner.js';

const router = Router();

// 1. GET all events for logged-in user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId || 'usr_demo_123';
    const events = await db.getEvents(userId);

    // Enrich each event with calculated quick metrics
    const enriched = await Promise.all(
      events.map(async (e) => {
        const full = await db.getFullEvent(e.id, userId);
        return full;
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 2. POST create new event with optimized batch insertion
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId || 'usr_demo_123';
    const parsed = CreateEventSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const newEvent = await db.createEvent({
      ...parsed.data,
      user_id: userId,
      ai_summary: '',
    });

    // Automatically generate initial AI event plan
    try {
      const plan = await generateAIEventPlan(newEvent);

      // Save summary
      await db.updateEvent(newEvent.id, userId, {
        ai_summary: plan.eventSummary,
      });

      // Batch save budget items
      const budgetItemsToInsert = plan.budget.map(b => ({
        event_id: newEvent.id,
        category: b.category,
        name: b.name,
        estimated_cost: b.estimatedCost,
        actual_cost: 0,
        paid_amount: 0,
        notes: b.reason,
        status: 'estimated' as const,
      }));
      await db.createBudgetItemsBatch(budgetItemsToInsert);

      // Batch save tasks
      const tasksToInsert = [
        ...plan.timeline.map(t => {
          const targetDate = new Date(newEvent.event_date);
          targetDate.setDate(targetDate.getDate() - (t.daysBeforeEvent || 0));
          return {
            event_id: newEvent.id,
            title: t.task,
            category: t.category || 'General',
            due_date: targetDate.toISOString().split('T')[0],
            days_before_event: t.daysBeforeEvent,
            priority: t.priority,
            status: 'pending' as const,
          };
        }),
        ...plan.tasks.map(t => ({
          event_id: newEvent.id,
          title: t.title,
          category: t.category,
          priority: t.priority,
          status: 'pending' as const,
        })),
      ];
      await db.createTasksBatch(tasksToInsert);

      // Batch save vendors
      const vendorsToInsert = plan.vendorCategories.map(v => ({
        event_id: newEvent.id,
        category: v.category,
        name: `${v.category} Specialist (AI Estimated)`,
        quoted_amount: 0,
        estimated_budget: v.estimatedBudget,
        booking_status: 'researching' as const,
        payment_status: 'unpaid' as const,
        notes: v.notes,
        is_ai_estimate: true,
      }));
      await db.createVendorsBatch(vendorsToInsert);

      // Batch save ideas
      const ideasToInsert = [
        ...plan.themes.map(t => ({
          event_id: newEvent.id,
          type: 'theme' as const,
          title: t.name,
          description: t.description,
          estimated_cost: t.estimatedCost,
        })),
        ...plan.decorations.map(d => ({
          event_id: newEvent.id,
          type: 'decoration' as const,
          title: d.title,
          description: d.description,
          estimated_cost: d.estimatedCost,
        })),
        ...plan.menus.map(m => ({
          event_id: newEvent.id,
          type: 'menu' as const,
          title: m.title,
          description: m.description,
          estimated_cost: m.estimatedCost,
        })),
        ...plan.activities.map(a => ({
          event_id: newEvent.id,
          type: 'activity' as const,
          title: a.title,
          description: a.description,
          estimated_cost: a.estimatedCost,
        })),
        ...plan.recommendations.map(r => ({
          event_id: newEvent.id,
          type: 'recommendation' as const,
          title: 'Planning Recommendation',
          description: r,
          estimated_cost: 0,
        })),
      ];
      await db.createIdeasBatch(ideasToInsert);
    } catch (genErr) {
      console.error('Plan generation background error:', genErr);
    }

    const fullEvent = await db.getFullEvent(newEvent.id, userId);
    res.status(201).json(fullEvent);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 3. GET full event by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const full = await db.getFullEvent(eventId, userId);
    if (!full) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 4. PATCH update event
router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const parsed = UpdateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updated = await db.updateEvent(eventId, userId, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    const full = await db.getFullEvent(eventId, userId);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. DELETE event
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const deleted = await db.deleteEvent(eventId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }
    res.json({ success: true, message: 'Event successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 6. POST regenerate AI plan with batch operations
router.post('/:id/generate-plan', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await db.clearEventPlan(event.id);

    const plan = await generateAIEventPlan(event);

    await db.updateEvent(event.id, userId, {
      ai_summary: plan.eventSummary,
    });

    const budgetItems = plan.budget.map(b => ({
      event_id: event.id,
      category: b.category,
      name: b.name,
      estimated_cost: b.estimatedCost,
      actual_cost: 0,
      paid_amount: 0,
      notes: b.reason,
      status: 'estimated' as const,
    }));
    await db.createBudgetItemsBatch(budgetItems);

    const tasksToInsert = [
      ...plan.timeline.map(t => {
        const targetDate = new Date(event.event_date);
        targetDate.setDate(targetDate.getDate() - (t.daysBeforeEvent || 0));
        return {
          event_id: event.id,
          title: t.task,
          category: t.category || 'General',
          due_date: targetDate.toISOString().split('T')[0],
          days_before_event: t.daysBeforeEvent,
          priority: t.priority,
          status: 'pending' as const,
        };
      }),
      ...plan.tasks.map(t => ({
        event_id: event.id,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: 'pending' as const,
      })),
    ];
    await db.createTasksBatch(tasksToInsert);

    const vendorsToInsert = plan.vendorCategories.map(v => ({
      event_id: event.id,
      category: v.category,
      name: `${v.category} Specialist (AI Estimated)`,
      quoted_amount: 0,
      estimated_budget: v.estimatedBudget,
      booking_status: 'researching' as const,
      payment_status: 'unpaid' as const,
      notes: v.notes,
      is_ai_estimate: true,
    }));
    await db.createVendorsBatch(vendorsToInsert);

    const ideasToInsert = [
      ...plan.themes.map(t => ({
        event_id: event.id,
        type: 'theme' as const,
        title: t.name,
        description: t.description,
        estimated_cost: t.estimatedCost,
      })),
      ...plan.decorations.map(d => ({
        event_id: event.id,
        type: 'decoration' as const,
        title: d.title,
        description: d.description,
        estimated_cost: d.estimatedCost,
      })),
      ...plan.menus.map(m => ({
        event_id: event.id,
        type: 'menu' as const,
        title: m.title,
        description: m.description,
        estimated_cost: m.estimatedCost,
      })),
      ...plan.activities.map(a => ({
        event_id: event.id,
        type: 'activity' as const,
        title: a.title,
        description: a.description,
        estimated_cost: a.estimatedCost,
      })),
      ...plan.recommendations.map(r => ({
        event_id: event.id,
        type: 'recommendation' as const,
        title: 'Planning Recommendation',
        description: r,
        estimated_cost: 0,
      })),
    ];
    await db.createIdeasBatch(ideasToInsert);

    const full = await db.getFullEvent(event.id, userId);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 7. BUDGET RESCUE: Preview proposals
router.post('/:id/budget-rescue/preview', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { targetBudget } = req.body;
    const newTarget = Number(targetBudget);
    if (isNaN(newTarget) || newTarget <= 0) {
      return res.status(400).json({ error: 'Valid targetBudget number required' });
    }

    const budgetItems = await db.getBudgetItems(event.id);
    const rescue = calculateBudgetRescue(event, budgetItems, newTarget);
    res.json(rescue);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 8. BUDGET RESCUE: Apply accepted proposals
router.post('/:id/budget-rescue/apply', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { newTargetBudget, acceptedProposalIds, proposals } = req.body;
    if (!acceptedProposalIds || !Array.isArray(acceptedProposalIds)) {
      return res.status(400).json({ error: 'acceptedProposalIds array is required' });
    }

    const budgetItems = await db.getBudgetItems(event.id);
    const changesApplied: any[] = [];

    for (const p of proposals || []) {
      if (acceptedProposalIds.includes(p.id)) {
        const item = budgetItems.find(b => b.id === p.id);
        if (item) {
          const oldCost = item.estimated_cost;
          await db.updateBudgetItem(item.id, {
            estimated_cost: p.proposedEstimatedCost,
            notes: (item.notes ? item.notes + ' | ' : '') + `Budget Rescue: ${p.explanation}`,
          });
          changesApplied.push({
            itemId: item.id,
            name: item.name,
            oldCost,
            newCost: p.proposedEstimatedCost,
            savings: oldCost - p.proposedEstimatedCost,
          });
        }
      }
    }

    // Update event budget target if provided
    if (newTargetBudget && Number(newTargetBudget) > 0) {
      await db.updateEvent(event.id, userId, {
        budget: Number(newTargetBudget),
      });
    }

    // Save revision history
    await db.createRevision({
      event_id: event.id,
      revision_note: `Budget Rescue applied: ${changesApplied.length} optimizations accepted. Total savings: ${changesApplied.reduce((a, b) => a + b.savings, 0)}`,
      previous_budget: Number(event.budget),
      new_budget: Number(newTargetBudget || event.budget),
      changes_applied: changesApplied,
    });

    const full = await db.getFullEvent(event.id, userId);
    res.json({
      success: true,
      changesApplied,
      event: full,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 9. AI Assistant interactive conversation
router.post('/:id/assistant', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const parsed = AIAssistantMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid message request', details: parsed.error });
    }

    const budgetItems = await db.getBudgetItems(event.id);
    const tasks = await db.getTasks(event.id);

    const action = await processAssistantMessage(event, budgetItems, tasks, parsed.data.message);
    res.json(action);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 10. AI Assistant: Apply approved changes
router.post('/:id/assistant/apply', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { proposedChanges, revisionNote } = req.body;
    const changesApplied: any[] = [];

    if (proposedChanges) {
      if (proposedChanges.budgetAdjustments && Array.isArray(proposedChanges.budgetAdjustments)) {
        for (const adj of proposedChanges.budgetAdjustments) {
          if (adj.action === 'update' && adj.budgetItemId) {
            await db.updateBudgetItem(adj.budgetItemId, {
              estimated_cost: adj.newCost,
            });
            changesApplied.push({ type: 'budget_update', ...adj });
          } else if (adj.action === 'add') {
            await db.createBudgetItem({
              event_id: event.id,
              category: adj.category,
              name: adj.name,
              estimated_cost: adj.newCost || 0,
              actual_cost: 0,
              paid_amount: 0,
              notes: adj.reason,
              status: 'estimated',
            });
            changesApplied.push({ type: 'budget_add', ...adj });
          }
        }
      }

      if (proposedChanges.tasksToAdd && Array.isArray(proposedChanges.tasksToAdd)) {
        for (const t of proposedChanges.tasksToAdd) {
          const targetDate = new Date(event.event_date);
          if (t.daysBeforeEvent) {
            targetDate.setDate(targetDate.getDate() - t.daysBeforeEvent);
          }
          await db.createTask({
            event_id: event.id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            status: 'pending',
            days_before_event: t.daysBeforeEvent,
            due_date: targetDate.toISOString().split('T')[0],
          });
          changesApplied.push({ type: 'task_add', ...t });
        }
      }

      if (proposedChanges.ideasToAdd && Array.isArray(proposedChanges.ideasToAdd)) {
        for (const idea of proposedChanges.ideasToAdd) {
          await db.createIdea({
            event_id: event.id,
            type: idea.type,
            title: idea.title,
            description: idea.description,
            estimated_cost: idea.estimatedCost || 0,
          });
          changesApplied.push({ type: 'idea_add', ...idea });
        }
      }

      if (proposedChanges.updatedSummary) {
        await db.updateEvent(event.id, userId, {
          ai_summary: proposedChanges.updatedSummary,
        });
      }

      await db.createRevision({
        event_id: event.id,
        revision_note: revisionNote || 'AI Assistant proposed changes applied by user',
        previous_budget: Number(event.budget),
        new_budget: Number(event.budget),
        changes_applied: changesApplied,
      });
    }

    const full = await db.getFullEvent(event.id, userId);
    res.json({ success: true, changesApplied, event: full });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 11. Full Export Package
router.get('/:id/export', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const full = await db.getFullEvent(eventId, userId);
    if (!full) return res.status(404).json({ error: 'Event not found' });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
