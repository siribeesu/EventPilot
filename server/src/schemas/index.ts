import { z } from 'zod';

// Event input schema
export const CreateEventSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters'),
  event_type: z.enum(['wedding', 'birthday', 'anniversary', 'college', 'community', 'other']),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Event date must be in YYYY-MM-DD format'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  indoor_outdoor: z.enum(['indoor', 'outdoor', 'both']).default('indoor'),
  budget: z.number().positive('Budget must be greater than 0'),
  currency: z.string().min(1).default('INR'),
  guest_count: z.number().int().positive('Guest count must be at least 1'),
  theme_preference: z.string().optional(),
  cultural_preference: z.string().optional(),
  dietary_preferences: z.string().optional(),
  priority_areas: z.array(z.string()).default([]),
  additional_requirements: z.string().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

// Budget item schema
export const CreateBudgetItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Item name is required'),
  estimated_cost: z.number().min(0, 'Estimated cost cannot be negative'),
  actual_cost: z.number().min(0).default(0),
  paid_amount: z.number().min(0).default(0),
  notes: z.string().optional(),
  status: z.enum(['estimated', 'booked', 'paid']).default('estimated'),
});

export const UpdateBudgetItemSchema = CreateBudgetItemSchema.partial();

// Task item schema
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  category: z.string().default('General'),
  due_date: z.string().optional(),
  days_before_event: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  notes: z.string().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// Vendor schema
export const CreateVendorSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Vendor name is required'),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  quoted_amount: z.number().min(0).default(0),
  estimated_budget: z.number().min(0).default(0),
  booking_status: z.enum(['researching', 'contacted', 'quote_received', 'booked', 'rejected']).default('researching'),
  payment_status: z.enum(['unpaid', 'advance_paid', 'fully_paid']).default('unpaid'),
  notes: z.string().optional(),
  is_ai_estimate: z.boolean().default(false),
});

export const UpdateVendorSchema = CreateVendorSchema.partial();

// AI Generated Plan Schema
export const AIThemeIdeaSchema = z.object({
  name: z.string(),
  description: z.string(),
  estimatedCost: z.number().nonnegative(),
});

export const AIBudgetItemSchema = z.object({
  category: z.string(),
  name: z.string(),
  estimatedCost: z.number().nonnegative(),
  reason: z.string(),
});

export const AITimelineTaskSchema = z.object({
  task: z.string(),
  daysBeforeEvent: z.number().int().min(0),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().default('General'),
});

export const AIVendorCategorySchema = z.object({
  category: z.string(),
  estimatedBudget: z.number().nonnegative(),
  notes: z.string(),
});

export const AIGeneratedPlanSchema = z.object({
  eventSummary: z.string(),
  themes: z.array(AIThemeIdeaSchema),
  budget: z.array(AIBudgetItemSchema),
  timeline: z.array(AITimelineTaskSchema),
  tasks: z.array(
    z.object({
      title: z.string(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string().default('General'),
    })
  ),
  vendorCategories: z.array(AIVendorCategorySchema),
  decorations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedCost: z.number().nonnegative(),
    })
  ),
  menus: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedCost: z.number().nonnegative(),
    })
  ),
  activities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedCost: z.number().nonnegative(),
    })
  ),
  recommendations: z.array(z.string()),
});

export type AIGeneratedPlan = z.infer<typeof AIGeneratedPlanSchema>;

// Budget Rescue Schemas
export const BudgetRescueProposalItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  currentEstimatedCost: z.number(),
  proposedEstimatedCost: z.number(),
  savings: z.number(),
  explanation: z.string(),
  tradeOffOrAlternative: z.string(),
  recommendedAction: z.enum(['reduce', 'substitute', 'eliminate', 'keep']),
});

export const BudgetRescueResponseSchema = z.object({
  analysis: z.string(),
  targetBudget: z.number(),
  currentTotalEstimated: z.number(),
  proposedTotalEstimated: z.number(),
  totalSavingsAchieved: z.number(),
  remainingShortfall: z.number(),
  proposals: z.array(BudgetRescueProposalItemSchema),
  priorityAdvice: z.array(z.string()),
});

export type BudgetRescueResponse = z.infer<typeof BudgetRescueResponseSchema>;

// Assistant Modification Schema
export const AIAssistantMessageSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ).default([]),
});

export const AIAssistantActionSchema = z.object({
  reply: z.string(),
  proposedChanges: z.object({
    budgetAdjustments: z.array(
      z.object({
        budgetItemId: z.string().optional(),
        category: z.string(),
        name: z.string(),
        action: z.enum(['add', 'update', 'remove']),
        newCost: z.number().optional(),
        reason: z.string(),
      })
    ).optional(),
    tasksToAdd: z.array(
      z.object({
        title: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']),
        category: z.string(),
        daysBeforeEvent: z.number().optional(),
      })
    ).optional(),
    ideasToAdd: z.array(
      z.object({
        type: z.enum(['theme', 'decoration', 'menu', 'activity', 'recommendation']),
        title: z.string(),
        description: z.string(),
        estimatedCost: z.number().default(0),
      })
    ).optional(),
    updatedSummary: z.string().optional(),
  }).optional(),
  clarifyingQuestions: z.array(z.string()).optional(),
  requiresUserApproval: z.boolean().default(false),
});

export type AIAssistantAction = z.infer<typeof AIAssistantActionSchema>;
