import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../database/db.js';
import { calculateBudgetRescue, generateDeterministicPlan, processAssistantMessage } from '../ai/planner.js';

describe('Planora AI End-to-End System Integration', () => {
  let createdEventId: string;

  it('creates an event and persists it in storage', async () => {
    const newEvent = await db.createEvent({
      user_id: 'usr_demo_123',
      title: 'Dev & Ananya Grand Wedding',
      event_type: 'wedding',
      event_date: '2026-12-15',
      start_time: '17:00',
      end_time: '23:30',
      location: 'Taj West End, Bengaluru',
      indoor_outdoor: 'both',
      budget: 60000,
      currency: 'INR',
      guest_count: 120,
      theme_preference: 'Royal Marigold & Candlelight',
      cultural_preference: 'South Indian & Traditional Fusion',
      dietary_preferences: 'Gourmet South Indian & North Indian Vegetarian Buffet',
      priority_areas: ['catering', 'venue'],
      additional_requirements: 'Need live nadaswaram instrumental welcome and stage photo booth',
    });

    expect(newEvent.id).toBeTruthy();
    expect(newEvent.title).toBe('Dev & Ananya Grand Wedding');
    createdEventId = newEvent.id;

    // Generate AI Plan and persist
    const plan = generateDeterministicPlan(newEvent);
    expect(plan.budget.length).toBeGreaterThan(0);
    expect(plan.timeline.length).toBeGreaterThan(0);

    for (const b of plan.budget) {
      await db.createBudgetItem({
        event_id: newEvent.id,
        category: b.category,
        name: b.name,
        estimated_cost: b.estimatedCost,
        actual_cost: 0,
        paid_amount: 0,
        notes: b.reason,
        status: 'estimated',
      });
    }

    for (const t of plan.timeline) {
      await db.createTask({
        event_id: newEvent.id,
        title: t.task,
        category: t.category,
        days_before_event: t.daysBeforeEvent,
        priority: t.priority,
        status: 'pending',
      });
    }

    for (const v of plan.vendorCategories) {
      await db.createVendor({
        event_id: newEvent.id,
        category: v.category,
        name: `${v.category} Specialist`,
        quoted_amount: 0,
        estimated_budget: v.estimatedBudget,
        booking_status: 'researching',
        payment_status: 'unpaid',
        is_ai_estimate: true,
      });
    }
  });

  it('retrieves full event with calculated metrics', async () => {
    const full = await db.getFullEvent(createdEventId, 'usr_demo_123');
    expect(full).not.toBeNull();
    expect(full?.budget_items.length).toBeGreaterThan(0);
    expect(full?.tasks.length).toBeGreaterThan(0);
    expect(full?.vendors.length).toBeGreaterThan(0);

    expect(full?.metrics.totalBudget).toBe(60000);
    expect(full?.metrics.totalEstimated).toBe(60000);
    expect(full?.metrics.remainingBalance).toBe(0);
  });

  it('executes Budget Rescue Mode when reducing budget to ₹40,000', async () => {
    const event = await db.getEventById(createdEventId, 'usr_demo_123');
    const items = await db.getBudgetItems(createdEventId);

    const rescue = calculateBudgetRescue(event!, items, 40000);
    expect(rescue.targetBudget).toBe(40000);
    expect(rescue.proposals.length).toBeGreaterThan(0);
    expect(rescue.totalSavingsAchieved).toBeGreaterThanOrEqual(15000);

    // Apply first 3 proposals
    const acceptedIds = rescue.proposals.slice(0, 3).map(p => p.id);
    for (const p of rescue.proposals.slice(0, 3)) {
      await db.updateBudgetItem(p.id, {
        estimated_cost: p.proposedEstimatedCost,
        notes: `Budget Rescue: ${p.explanation}`,
      });
    }

    // Verify recalculation
    const updatedFull = await db.getFullEvent(createdEventId, 'usr_demo_123');
    expect(updatedFull?.metrics.totalEstimated).toBeLessThan(60000);
  });

  it('processes AI assistant conversational commands with approval workflow', async () => {
    const event = await db.getEventById(createdEventId, 'usr_demo_123');
    const items = await db.getBudgetItems(createdEventId);
    const tasks = await db.getTasks(createdEventId);

    // Request menu
    const menuAction = await processAssistantMessage(event!, items, tasks, 'Suggest a vegetarian menu for 120 guests');
    expect(menuAction.reply.toLowerCase()).toContain('vegetarian');
    expect(menuAction.requiresUserApproval).toBe(true);
    expect(menuAction.proposedChanges?.ideasToAdd?.length).toBeGreaterThan(0);

    // Request 7 days countdown priority
    const countdownAction = await processAssistantMessage(event!, items, tasks, 'The event is in seven days. What should I prioritize?');
    expect(countdownAction.reply.toLowerCase()).toContain('priority');
    expect(countdownAction.proposedChanges?.tasksToAdd?.length).toBeGreaterThan(0);
  });
});
