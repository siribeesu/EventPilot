import { describe, it, expect } from 'vitest';
import { calculateBudgetRescue, generateDeterministicPlan } from '../ai/planner.js';
import { EventRecord, BudgetItem } from '../types/index.js';

describe('EventPilot Planner & Budget Calculations', () => {
  const mockEvent: EventRecord = {
    id: 'test-event-1',
    user_id: 'usr_demo_123',
    title: 'Aarav & Meera Wedding Celebration',
    event_type: 'wedding',
    event_date: '2026-11-20',
    start_time: '18:00',
    end_time: '23:00',
    location: 'Grand Palace Banquet, Mumbai',
    indoor_outdoor: 'indoor',
    budget: 50000,
    currency: 'INR',
    guest_count: 100,
    theme_preference: 'Traditional Marigold with Candlelight',
    cultural_preference: 'Indian Traditional',
    dietary_preferences: 'Pure Vegetarian Banquet',
    priority_areas: ['catering', 'decoration'],
    additional_requirements: 'Require live chaat counter and floral entrance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('generates a valid, balanced deterministic event plan matching target budget', () => {
    const plan = generateDeterministicPlan(mockEvent);

    expect(plan.eventSummary).toBeTruthy();
    expect(plan.themes.length).toBeGreaterThan(0);
    expect(plan.budget.length).toBeGreaterThan(0);
    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.vendorCategories.length).toBeGreaterThan(0);

    // Sum of budget items should equal the total event budget
    const sum = plan.budget.reduce((acc, item) => acc + item.estimatedCost, 0);
    expect(sum).toBe(mockEvent.budget);

    // Timeline tasks should have valid priorities
    for (const t of plan.timeline) {
      expect(['low', 'medium', 'high', 'urgent']).toContain(t.priority);
      expect(t.daysBeforeEvent).toBeGreaterThanOrEqual(0);
    }
  });

  it('runs Budget Rescue Mode when budget is reduced from ₹50,000 to ₹35,000', () => {
    const mockBudgetItems: BudgetItem[] = [
      {
        id: 'b-1',
        event_id: mockEvent.id,
        category: 'Venue',
        name: 'Grand Palace Hall Rental',
        estimated_cost: 14000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'b-2',
        event_id: mockEvent.id,
        category: 'Catering',
        name: 'Vegetarian Buffet for 100 guests',
        estimated_cost: 18000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'b-3',
        event_id: mockEvent.id,
        category: 'Decoration',
        name: 'Traditional Marigold Stage & Floral Entrance',
        estimated_cost: 9000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'b-4',
        event_id: mockEvent.id,
        category: 'Photography',
        name: 'Candid & Traditional Photographer',
        estimated_cost: 5000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'b-5',
        event_id: mockEvent.id,
        category: 'Entertainment',
        name: 'DJ & Sound Setup',
        estimated_cost: 4000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
    ];

    const targetBudget = 35000;
    const rescue = calculateBudgetRescue(mockEvent, mockBudgetItems, targetBudget);

    expect(rescue.targetBudget).toBe(35000);
    expect(rescue.currentTotalEstimated).toBe(50000);
    expect(rescue.proposals.length).toBeGreaterThan(0);
    expect(rescue.totalSavingsAchieved).toBeGreaterThan(0);

    // Each proposal must have clear explanation, alternative, and proposed lower cost
    for (const p of rescue.proposals) {
      expect(p.proposedEstimatedCost).toBeLessThan(p.currentEstimatedCost);
      expect(p.savings).toBe(p.currentEstimatedCost - p.proposedEstimatedCost);
      expect(p.explanation.length).toBeGreaterThan(5);
      expect(p.tradeOffOrAlternative.length).toBeGreaterThan(5);
    }

    // Proposed total should be significantly closer to or within 35,000
    expect(rescue.proposedTotalEstimated).toBeLessThanOrEqual(37000);
  });

  it('handles safe surplus in Budget Rescue when target budget is higher than current total', () => {
    const mockBudgetItems: BudgetItem[] = [
      {
        id: 'b-1',
        event_id: mockEvent.id,
        category: 'Venue',
        name: 'Hall Rental',
        estimated_cost: 10000,
        actual_cost: 0,
        paid_amount: 0,
        status: 'estimated',
        created_at: '',
        updated_at: '',
      },
    ];

    const rescue = calculateBudgetRescue(mockEvent, mockBudgetItems, 20000);
    expect(rescue.proposals.length).toBe(0);
    expect(rescue.totalSavingsAchieved).toBe(0);
    expect(rescue.analysis).toContain('already within your target budget');
  });
});
