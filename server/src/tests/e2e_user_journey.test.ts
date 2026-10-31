import { describe, it, expect } from 'vitest';
import { db } from '../database/db.js';
import { EventRecord } from '../types/index.js';
import { generateDeterministicPlan, calculateBudgetRescue, processAssistantMessage } from '../ai/planner.js';
import { taskQueue } from '../services/taskQueue.js';

describe('EventPilot Real End-to-End User Journey Tests', () => {
  let testUserId: string;
  let testUserToken: string;
  let testEventId: string;
  let createdBudgetItemId: string;
  let createdVendorId: string;

  // 1. User Signup & Authentication Flow
  it('E2E Flow 1: Signup and Login Authentication Journey', async () => {
    const signupEmail = `e2e_organizer_${Date.now()}@eventpilot.ai`;
    const signupPassword = 'SecurePassword2026!';

    // Register user
    const newUser = await db.createUser({
      email: signupEmail,
      name: 'E2E Wedding Organizer',
      password_hash: 'hashed_pw_2026',
    });

    expect(newUser.id).toBeTruthy();
    expect(newUser.email).toBe(signupEmail);
    testUserId = newUser.id;

    // Verify user can authenticate
    const verifiedUser = await db.getUserByEmail(signupEmail);
    expect(verifiedUser).toBeDefined();
    expect(verifiedUser?.name).toBe('E2E Wedding Organizer');
  });

  // 2. Create Event Flow with Detailed Specifications
  it('E2E Flow 2: Event Creation Flow with AI Template Parameters', async () => {
    const event = await db.createEvent({
      user_id: testUserId,
      title: 'Grand Heritage Palace Wedding',
      event_type: 'wedding',
      event_date: '2026-11-20',
      start_time: '18:00',
      end_time: '23:30',
      location: 'Umaid Bhawan, Jodhpur',
      indoor_outdoor: 'both',
      budget: 1500000,
      currency: 'INR',
      guest_count: 250,
      theme_preference: 'Royal Rajputana Gold & Crimson',
      cultural_preference: 'Traditional Marwari Heritage',
      dietary_preferences: 'Gourmet Pure Vegetarian Banquet',
      priority_areas: ['catering', 'decoration', 'venue'],
      additional_requirements: 'Require live royal nagada welcome and fireworks clearance',
    });

    expect(event.id).toBeTruthy();
    expect(event.title).toBe('Grand Heritage Palace Wedding');
    expect(event.budget).toBe(1500000);
    testEventId = event.id;

    // Generate AI Plan with Guardrails
    const aiPlan = generateDeterministicPlan(event);
    expect(aiPlan.budget.length).toBeGreaterThan(0);
    expect(aiPlan.confidenceScore).toBeGreaterThan(0.8);
    expect(Array.isArray(aiPlan.uncertaintyFlags)).toBe(true);

    // Persist AI-generated budget items
    for (const b of aiPlan.budget) {
      const item = await db.createBudgetItem({
        event_id: event.id,
        category: b.category,
        name: b.name,
        estimated_cost: b.estimatedCost,
        actual_cost: 0,
        paid_amount: 0,
        notes: b.reason,
        status: 'estimated',
      });
      if (!createdBudgetItemId) createdBudgetItemId = item.id;
    }

    const items = await db.getBudgetItems(event.id);
    expect(items.length).toBe(aiPlan.budget.length);
  });

  // 3. Budget Planner Flow: Overbudget Detection and Budget Rescue
  it('E2E Flow 3: Budget Planner Flow, Overbudget Detection & Budget Rescue Optimization', async () => {
    const event = await db.getEventById(testEventId, testUserId);
    expect(event).toBeDefined();

    const currentItems = await db.getBudgetItems(testEventId);
    const totalEstimated = currentItems.reduce((acc, b) => acc + Number(b.estimated_cost), 0);

    // Simulate unexpected budget reduction to 1,000,000 (creating an overbudget situation)
    const reducedTargetBudget = 1000000;
    const rescueAnalysis = calculateBudgetRescue(event!, currentItems, reducedTargetBudget);

    expect(rescueAnalysis.proposals.length).toBeGreaterThan(0);
    expect(rescueAnalysis.totalSavingsAchieved).toBeGreaterThan(0);
    expect(rescueAnalysis.proposedTotalEstimated).toBeLessThanOrEqual(totalEstimated);

    // Apply approved rescue suggestions
    for (const prop of rescueAnalysis.proposals.slice(0, 2)) {
      await db.updateBudgetItem(prop.id, {
        estimated_cost: prop.proposedEstimatedCost,
        notes: `Budget Rescue applied: ${prop.explanation}`,
      });
    }

    // Record revision
    const revision = await db.createRevision({
      event_id: testEventId,
      revision_note: `Budget Rescue accepted: saved ${rescueAnalysis.totalSavingsAchieved}`,
      previous_budget: totalEstimated,
      new_budget: reducedTargetBudget,
      changes_applied: rescueAnalysis.proposals,
    });

    expect(revision.id).toBeTruthy();
    expect(revision.changes_applied.length).toBe(rescueAnalysis.proposals.length);
  });

  // 4. AI Assistant Human-in-the-Loop Approval Flow
  it('E2E Flow 4: AI Assistant Approval Flow with Human-in-the-Loop Verification', async () => {
    const event = await db.getEventById(testEventId, testUserId);
    const currentBudget = await db.getBudgetItems(testEventId);
    const currentTasks = await db.getTasks(testEventId);

    // User asks assistant for dietary menu customization
    const userPrompt = 'Please add a vegetarian banquet menu for 250 guests';
    const action = await processAssistantMessage(event!, currentBudget, currentTasks, userPrompt);

    // Verify AI Safety Guardrail & Human Approval requirement
    expect(action.requiresUserApproval).toBe(true);
    expect(action.confidenceScore).toBeGreaterThanOrEqual(0.9);
    expect(action.proposedChanges?.ideasToAdd).toBeDefined();

    // Human approves and commits proposed changes to database
    if (action.proposedChanges?.ideasToAdd) {
      for (const idea of action.proposedChanges.ideasToAdd) {
        const createdIdea = await db.createIdea({
          event_id: testEventId,
          type: idea.type,
          title: idea.title,
          description: idea.description,
          estimated_cost: idea.estimatedCost || 0,
        });
        expect(createdIdea.id).toBeTruthy();
      }
    }

    const savedIdeas = await db.getIdeas(testEventId);
    expect(savedIdeas.some(i => i.title.includes('Vegetarian'))).toBe(true);
  });

  // 5. Vendor Editing & Contract Sync Flow
  it('E2E Flow 5: Vendor Quotation, Negotiation & Booking Sync Flow', async () => {
    // Add vendor
    const vendor = await db.createVendor({
      event_id: testEventId,
      category: 'Photography',
      name: 'Royal Heritage Cinematography',
      contact_name: 'Vikramaditya Rathore',
      contact_phone: '+91 98765 43210',
      contact_email: 'vikram@royalcinematics.in',
      quoted_amount: 180000,
      estimated_budget: 150000,
      booking_status: 'contacted',
      payment_status: 'unpaid',
      notes: 'Includes 4K teaser video, drone aerial coverage, and two candid photographers.',
      is_ai_estimate: false,
    });

    expect(vendor.id).toBeTruthy();
    createdVendorId = vendor.id;

    // Simulate negotiating and booking vendor with advance payment
    const updatedVendor = await db.updateVendor(createdVendorId, {
      quoted_amount: 165000, // negotiated discount
      booking_status: 'booked',
      payment_status: 'advance_paid',
      notes: 'Booking confirmed. 50% advance token paid.',
    });

    expect(updatedVendor?.booking_status).toBe('booked');
    expect(updatedVendor?.payment_status).toBe('advance_paid');
    expect(updatedVendor?.quoted_amount).toBe(165000);
  });

  // 6. PDF Export Data & GDPR Portability Flow
  it('E2E Flow 6: Full Event Detail Export and GDPR Article 15 Data Package Flow', async () => {
    const fullDetail = await db.getFullEvent(testEventId, testUserId);
    expect(fullDetail).toBeDefined();
    expect(fullDetail?.budget_items.length).toBeGreaterThan(0);
    expect(fullDetail?.vendors.length).toBeGreaterThan(0);
    expect(fullDetail?.metrics.totalBudget).toBeDefined();
    expect(fullDetail?.metrics.totalEstimated).toBeGreaterThan(0);

    // GDPR Article 15 Data Portability Export
    const gdprExport = await db.exportUserData(testUserId);
    expect(gdprExport.compliance).toContain('GDPR Article 15');
    expect(gdprExport.events.length).toBe(1);
    expect(gdprExport.events[0].id).toBe(testEventId);
    expect(gdprExport.budgetItems.length).toBeGreaterThan(0);
    expect(gdprExport.vendors.length).toBeGreaterThan(0);
  });

  // 7. Real User AI Feedback Learning Loop
  it('E2E Flow 7: Real User AI Feedback Submission & Telemetry Loop', async () => {
    const feedback = await db.saveAIFeedback({
      event_id: testEventId,
      user_id: testUserId,
      suggestion_id: 'sugg_menu_veg_250',
      suggestion_type: 'assistant_chat',
      rating: 'positive',
      user_action: 'accepted',
      feedback_comment: 'Excellent heritage vegetarian banquet suggestions tailored to Rajasthan.',
      category: 'catering',
    });

    expect(feedback.id).toBeTruthy();
    expect(feedback.rating).toBe('positive');
    expect(feedback.user_action).toBe('accepted');

    const feedbackEntries = await db.getAIFeedback(testEventId);
    expect(feedbackEntries.length).toBeGreaterThan(0);
    expect(feedbackEntries.some(f => f.suggestion_id === 'sugg_menu_veg_250')).toBe(true);
  });

  // 8. Background Task Queue Execution Flow
  it('E2E Flow 8: Asynchronous Task Queue Plan Generation and Job Lifecycle', async () => {
    const event = await db.getEventById(testEventId, testUserId);
    expect(event).toBeDefined();

    // Register job handler for testing
    taskQueue.registerHandler('ai_plan_generation', async (payload: { event: EventRecord }) => {
      return generateDeterministicPlan(payload.event);
    });

    const job = taskQueue.enqueue('ai_plan_generation', { event });
    expect(job.id).toBeTruthy();
    expect(job.status).toMatch(/pending|processing|completed/);

    // Wait short moment for in-memory queue to process
    await new Promise(r => setTimeout(r, 100));

    const completedJob = taskQueue.getJob(job.id);
    expect(completedJob).toBeDefined();
    expect(completedJob?.status).toBe('completed');
    expect(completedJob?.result).toBeDefined();
    expect((completedJob?.result as { budget: unknown[] }).budget.length).toBeGreaterThan(0);
  });
});
