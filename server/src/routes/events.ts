import { Router } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { validateBody, validateIdParam } from '../middleware/validate.js';
import { memoryCache } from '../utils/cache.js';
import {
  CreateEventSchema,
  UpdateEventSchema,
  AIAssistantMessageSchema,
  AIFeedbackSchema,
} from '../schemas/index.js';
import {
  generateAIEventPlan,
  calculateBudgetRescue,
  processAssistantMessage,
} from '../ai/planner.js';
import { logAuditEvent } from '../services/auditService.js';
import { taskQueue } from '../services/taskQueue.js';

const router = Router();

// Register async AI plan generation worker
taskQueue.registerHandler('ai_plan_generation', async (payload: { event: any }) => {
  return await generateAIEventPlan(payload.event);
});


// 1. GET all events for logged-in user with caching
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId || 'usr_demo_123';
    const cacheKey = `events:${userId}`;
    const cached = memoryCache.get<any[]>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const events = await db.getEvents(userId);
    const enriched = await Promise.all(
      events.map(async (e) => {
        const full = await db.getFullEvent(e.id, userId);
        return full;
      })
    );

    memoryCache.set(cacheKey, enriched, 30);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 2. POST create new event with validation & cache invalidation
router.post('/', validateBody(CreateEventSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId || 'usr_demo_123';
    const newEvent = await db.createEvent({
      ...req.body,
      user_id: userId,
      ai_summary: '',
    });

    // Invalidate user events cache
    memoryCache.invalidate(`events:${userId}`);

    await logAuditEvent(req, {
      action: 'EVENT_CREATED',
      resource_type: 'event',
      resource_id: newEvent.id,
      status: 'success',
      metadata: { title: newEvent.title, budget: newEvent.budget, type: newEvent.event_type },
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

// 3. GET full event by ID with caching & param validation
router.get('/:id', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const cacheKey = `event:${eventId}`;

    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const full = await db.getFullEvent(eventId, userId);
    if (!full) {
      return res.status(404).json({ error: 'Event not found or access denied', code: 'EVENT_NOT_FOUND' });
    }

    memoryCache.set(cacheKey, full, 30);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 4. PATCH update event with validation & cache invalidation
router.patch('/:id', validateIdParam('id'), validateBody(UpdateEventSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';

    const updated = await db.updateEvent(eventId, userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    memoryCache.invalidate(`event:${eventId}`);
    memoryCache.invalidate(`events:${userId}`);

    await logAuditEvent(req, {
      action: 'EVENT_UPDATED',
      resource_type: 'event',
      resource_id: eventId,
      status: 'success',
      metadata: { fields: Object.keys(req.body) },
    });

    const full = await db.getFullEvent(eventId, userId);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. DELETE event with cache invalidation
router.delete('/:id', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const deleted = await db.deleteEvent(eventId, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    memoryCache.invalidate(`event:${eventId}`);
    memoryCache.invalidate(`events:${userId}`);

    await logAuditEvent(req, {
      action: 'EVENT_DELETED',
      resource_type: 'event',
      resource_id: eventId,
      status: 'success',
    });

    res.json({ success: true, message: 'Event successfully deleted' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 6. POST regenerate AI plan with batch operations & cache invalidation
router.post('/:id/generate-plan', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
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

    memoryCache.invalidate(`event:${eventId}`);
    memoryCache.invalidate(`events:${userId}`);

    const full = await db.getFullEvent(event.id, userId);
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 7. BUDGET RESCUE: Preview proposals
router.post('/:id/budget-rescue/preview', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
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

// 8. BUDGET RESCUE: Apply accepted proposals with cache invalidation
router.post('/:id/budget-rescue/apply', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
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

    if (newTargetBudget && Number(newTargetBudget) > 0) {
      await db.updateEvent(event.id, userId, {
        budget: Number(newTargetBudget),
      });
    }

    await db.createRevision({
      event_id: event.id,
      revision_note: `Budget Rescue applied: ${changesApplied.length} optimizations accepted. Total savings: ${changesApplied.reduce((a, b) => a + b.savings, 0)}`,
      previous_budget: Number(event.budget),
      new_budget: Number(newTargetBudget || event.budget),
      changes_applied: changesApplied,
    });

    memoryCache.invalidate(`event:${eventId}`);
    memoryCache.invalidate(`events:${userId}`);

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
router.post('/:id/assistant', validateIdParam('id'), validateBody(AIAssistantMessageSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const budgetItems = await db.getBudgetItems(event.id);
    const tasks = await db.getTasks(event.id);

    const action = await processAssistantMessage(event, budgetItems, tasks, req.body.message);
    res.json(action);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 10. AI Assistant: Apply approved changes with cache invalidation
router.post('/:id/assistant/apply', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
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

    memoryCache.invalidate(`event:${eventId}`);
    memoryCache.invalidate(`events:${userId}`);

    const full = await db.getFullEvent(event.id, userId);
    res.json({ success: true, changesApplied, event: full });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 11. Full Export Package
router.get('/:id/export', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
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


// 12. Submit Real User AI Feedback (Human-in-the-loop Learning Loop)
router.post('/:id/ai/feedback', validateIdParam('id'), validateBody(AIFeedbackSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const feedback = await db.saveAIFeedback({
      event_id: event.id,
      user_id: userId,
      suggestion_id: req.body.suggestionId,
      suggestion_type: req.body.suggestionType,
      rating: req.body.rating,
      user_action: req.body.userAction,
      feedback_comment: req.body.feedbackComment,
      category: req.body.category,
    });

    await logAuditEvent(req, {
      action: 'AI_FEEDBACK_SUBMITTED',
      resource_type: 'ai',
      resource_id: feedback.id,
      status: 'success',
      metadata: { rating: feedback.rating, action: feedback.user_action, suggestionType: feedback.suggestion_type },
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 13. Get AI Feedback entries for event
router.get('/:id/ai/feedback', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const feedbackList = await db.getAIFeedback(eventId);
    res.json(feedbackList);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 14. Background / Asynchronous AI Plan Generation Job Queue
router.post('/:id/ai/async-generate', validateIdParam('id'), async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const job = taskQueue.enqueue('ai_plan_generation', { event });
    res.status(202).json({
      message: 'AI plan generation job queued',
      jobId: job.id,
      status: job.status,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 15. Poll Background Job Status
router.get('/jobs/:jobId', (req, res) => {
  const job = taskQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

export default router;
