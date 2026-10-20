export type EventType = 'wedding' | 'birthday' | 'anniversary' | 'college' | 'community' | 'other';
export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type BudgetItemStatus = 'estimated' | 'booked' | 'paid';
export type VendorBookingStatus = 'researching' | 'contacted' | 'quote_received' | 'booked' | 'rejected';
export type VendorPaymentStatus = 'unpaid' | 'advance_paid' | 'fully_paid';
export type IdeaType = 'theme' | 'decoration' | 'menu' | 'activity' | 'recommendation';

export interface EventRecord {
  id: string;
  user_id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  indoor_outdoor: IndoorOutdoor;
  budget: number;
  currency: string;
  guest_count: number;
  theme_preference?: string;
  cultural_preference?: string;
  dietary_preferences?: string;
  priority_areas: string[];
  additional_requirements?: string;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  event_id: string;
  category: string;
  name: string;
  estimated_cost: number;
  actual_cost: number;
  paid_amount: number;
  notes?: string;
  status: BudgetItemStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: string;
  event_id: string;
  title: string;
  category: string;
  due_date?: string;
  days_before_event?: number;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorItem {
  id: string;
  event_id: string;
  category: string;
  name: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  quoted_amount: number;
  estimated_budget: number;
  booking_status: VendorBookingStatus;
  payment_status: VendorPaymentStatus;
  notes?: string;
  is_ai_estimate: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventIdea {
  id: string;
  event_id: string;
  type: IdeaType;
  title: string;
  description: string;
  estimated_cost: number;
  created_at: string;
}

export interface PlanRevision {
  id: string;
  event_id: string;
  revision_note: string;
  previous_budget: number;
  new_budget: number;
  changes_applied: any[];
  created_at: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export interface Collaborator {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  role: CollaboratorRole;
  invited_by: string;
  created_at: string;
}

export interface EventFullDetail extends EventRecord {
  budget_items: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  ideas: EventIdea[];
  revisions: PlanRevision[];
  collaborators?: Collaborator[];
  user_role?: CollaboratorRole;
  metrics: {
    totalBudget: number;
    totalEstimated: number;
    totalActual: number;
    remainingBalance: number;
    tasksTotal: number;
    tasksCompleted: number;
    vendorsBooked: number;
    vendorsTotal: number;
  };
}

export interface BudgetRescueProposalItem {
  id: string;
  name: string;
  category: string;
  currentEstimatedCost: number;
  proposedEstimatedCost: number;
  savings: number;
  explanation: string;
  tradeOffOrAlternative: string;
  recommendedAction: 'reduce' | 'substitute' | 'eliminate' | 'keep';
}

export interface BudgetRescueResponse {
  analysis: string;
  targetBudget: number;
  currentTotalEstimated: number;
  proposedTotalEstimated: number;
  totalSavingsAchieved: number;
  remainingShortfall: number;
  proposals: BudgetRescueProposalItem[];
  priorityAdvice: string[];
}

export interface AIAssistantAction {
  reply: string;
  proposedChanges?: {
    budgetAdjustments?: Array<{
      budgetItemId?: string;
      category: string;
      name: string;
      action: 'add' | 'update' | 'remove';
      newCost?: number;
      reason: string;
    }>;
    tasksToAdd?: Array<{
      title: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
      category: string;
      daysBeforeEvent?: number;
    }>;
    ideasToAdd?: Array<{
      type: 'theme' | 'decoration' | 'menu' | 'activity' | 'recommendation';
      title: string;
      description: string;
      estimatedCost?: number;
    }>;
    updatedSummary?: string;
  };
  clarifyingQuestions?: string[];
  requiresUserApproval: boolean;
}
