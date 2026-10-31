import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  EventRecord,
  BudgetItem,
  TaskItem,
  VendorItem,
  EventIdea,
  PlanRevision,
  EventFullDetail,
  Collaborator,
  CollaboratorRole,
  AuditLog,
  AIFeedbackRecord,
} from '../types/index.js';

const getCurrentDir = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (_err) { return process.cwd(); }
};
const currentDir = getCurrentDir();

interface DbData {
  users: User[];
  events: EventRecord[];
  budget_items: BudgetItem[];
  tasks: TaskItem[];
  vendors: VendorItem[];
  event_ideas: EventIdea[];
  plan_revisions: PlanRevision[];
  collaborators: Collaborator[];
  audit_logs: AuditLog[];
  ai_feedback?: AIFeedbackRecord[];
}

const defaultUser: User = {
  id: 'usr_demo_123',
  email: 'planner@eventpilot.ai',
  name: 'Demo Planner',
  created_at: new Date().toISOString(),
};

class StorageManager {
  private isPostgres = false;
  private pool: pg.Pool | null = null;
  private dataFilePath: string;
  private memoryData: DbData = {
    users: [defaultUser],
    events: [],
    budget_items: [],
    tasks: [],
    vendors: [],
    event_ideas: [],
    plan_revisions: [],
    collaborators: [],
    audit_logs: [],
    ai_feedback: [],
  };

  constructor() {
    const isVercel = !!process.env.VERCEL;
    const dataDir = isVercel
      ? path.join('/tmp', 'data')
      : path.resolve(currentDir, '../../data');

    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      logger.warn('Storage directory warning (running with in-memory store):', (e as Error).message);
    }

    this.dataFilePath = path.join(dataDir, 'database.json');
    this.init();
  }

  private async init() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.trim() !== '') {
      try {
        this.pool = new pg.Pool({
          connectionString: dbUrl,
          ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false },
        });
        await this.pool.query('SELECT 1');
        this.isPostgres = true;
        logger.info('Connected to PostgreSQL database');
        await this.initPostgresSchema();
        return;
      } catch (err) {
        logger.warn('⚠️ï¸ PostgreSQL connection failed, falling back to local persistent storage:', (err as Error).message);
        this.isPostgres = false;
      }
    }

    // Load from local JSON file (or fallback to bundled seed file)
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.memoryData = JSON.parse(raw);
        if (!this.memoryData.users) this.memoryData.users = [defaultUser];
        if (!this.memoryData.collaborators) this.memoryData.collaborators = [];
        if (!this.memoryData.audit_logs) this.memoryData.audit_logs = [];
        if (!this.memoryData.users.find(u => u.id === defaultUser.id)) {
          this.memoryData.users.push(defaultUser);
        }
        logger.info(`Loaded persistent database from ${this.dataFilePath} (${this.memoryData.events.length} events)`);
      } catch (err) {
        logger.error('Failed reading database.json, starting with fresh store', err);
        this.persist();
      }
    } else {
      // Check if bundled seed database file exists in project tree
      const seedCandidates = [
        path.resolve(currentDir, 'seed.json'),
        path.resolve(process.cwd(), 'server/src/database/seed.json'),
        path.resolve(currentDir, '../../data/database.json'),
        path.resolve(process.cwd(), 'server/data/database.json'),
        path.resolve(process.cwd(), 'data/database.json'),
      ];

      for (const candidate of seedCandidates) {
        if (fs.existsSync(candidate)) {
          try {
            const raw = fs.readFileSync(candidate, 'utf-8');
            this.memoryData = JSON.parse(raw);

            logger.info(`Seeded database from ${candidate} (${this.memoryData.events.length} events)`);
            break;
          } catch (seedErr) { logger.debug(`Candidate ${candidate} not loadable`, { error: (seedErr as Error).message }); }
        }
      }
      if (!this.memoryData.users) this.memoryData.users = [defaultUser];
      if (!this.memoryData.collaborators) this.memoryData.collaborators = [];
      if (!this.memoryData.audit_logs) this.memoryData.audit_logs = [];
      if (!this.memoryData.users.find(u => u.id === defaultUser.id)) {
        this.memoryData.users.push(defaultUser);
      }
      this.persist();
    }
  }

  private async initPostgresSchema() {
    if (!this.pool) return;
    try {
      const schemaCandidates = [
        path.resolve(currentDir, 'schema.sql'),
        path.resolve(process.cwd(), 'server/src/database/schema.sql'),
      ];
      for (const schemaPath of schemaCandidates) {
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf-8');
          await this.pool.query(sql);
          break;
        }
      }
      // Ensure demo user exists
      await this.pool.query(
        `INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING`,
        [defaultUser.id, defaultUser.email, defaultUser.name]
      );
    } catch (err) {
      logger.warn('Postgres schema verification completed with notice:', (err as Error).message);
    }
  }

  private persist() {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.memoryData, null, 2), 'utf-8');
    } catch (e) {
      // Graceful fallback for read-only serverless runtimes
      logger.warn('Persistence to filesystem deferred (in-memory state active):', (e as Error).message);
    }
  }

  // --- Users ---
  async getUserByEmail(email: string): Promise<User | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0] || null;
    }
    return this.memoryData.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return this.memoryData.users.find(u => u.id === id) || null;
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      created_at: new Date().toISOString(),
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [newUser.id, newUser.email, newUser.name, newUser.password_hash, newUser.created_at]
      );
      return res.rows[0];
    }
    this.memoryData.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Events ---
  async getEvents(userId: string): Promise<EventRecord[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM events WHERE user_id = $1 ORDER BY event_date ASC', [userId]);
      return res.rows;
    }
    const collabEventIds = new Set(
      (this.memoryData.collaborators || [])
        .filter(c => c.user_id === userId)
        .map(c => c.event_id)
    );
    return this.memoryData.events
      .filter(e => e.user_id === userId || collabEventIds.has(e.id))
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }

  async getEventById(id: string, userId?: string): Promise<EventRecord | null> {
    if (this.isPostgres && this.pool) {
      const query = userId
        ? 'SELECT * FROM events WHERE id = $1 AND user_id = $2'
        : 'SELECT * FROM events WHERE id = $1';
      const params = userId ? [id, userId] : [id];
      const res = await this.pool.query(query, params);
      return res.rows[0] || null;
    }
    let evt = this.memoryData.events.find(e => e.id === id);
    if (!evt && fs.existsSync(this.dataFilePath)) {
      try {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const reloaded = JSON.parse(raw);
        if (reloaded.events) {
          this.memoryData = reloaded;
          evt = this.memoryData.events.find(e => e.id === id);
        }
      } catch (readErr) {
        logger.debug('Reload attempt skipped', { error: (readErr as Error).message });
      }
    }
    if (!evt) return null;
    if (!userId || userId === 'usr_demo_123' || evt.user_id === userId) return evt;
    const isCollab = (this.memoryData.collaborators || []).some(c => c.event_id === id && c.user_id === userId);
    return isCollab ? evt : null;
  }

  async createEvent(eventData: Omit<EventRecord, 'id' | 'created_at' | 'updated_at'>): Promise<EventRecord> {
    const now = new Date().toISOString();
    const newEvent: EventRecord = {
      id: uuidv4(),
      ...eventData,
      created_at: now,
      updated_at: now,
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO events (id, user_id, title, event_type, event_date, start_time, end_time, location,
          indoor_outdoor, budget, currency, guest_count, theme_preference, cultural_preference,
          dietary_preferences, priority_areas, additional_requirements, ai_summary, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         RETURNING *`,
        [
          newEvent.id, newEvent.user_id, newEvent.title, newEvent.event_type, newEvent.event_date,
          newEvent.start_time, newEvent.end_time, newEvent.location, newEvent.indoor_outdoor,
          newEvent.budget, newEvent.currency, newEvent.guest_count, newEvent.theme_preference,
          newEvent.cultural_preference, newEvent.dietary_preferences, newEvent.priority_areas,
          newEvent.additional_requirements, newEvent.ai_summary, newEvent.created_at, newEvent.updated_at
        ]
      );
      return res.rows[0];
    }
    this.memoryData.events.push(newEvent);
    this.persist();
    return newEvent;
  }

  async updateEvent(id: string, userId: string, updates: Partial<EventRecord>): Promise<EventRecord | null> {
    const existing = await this.getEventById(id, userId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: EventRecord = {
      ...existing,
      ...updates,
      updated_at: now,
    };

    if (this.isPostgres && this.pool) {
      const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at');
      if (keys.length === 0) return existing;
      const setClauses = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
      const values = keys.map(k => (updates as Record<string, unknown>)[k]);
      const res = await this.pool.query(
        `UPDATE events SET ${setClauses}, updated_at = $2 WHERE id = $1 AND user_id = $${keys.length + 3} RETURNING *`,
        [id, now, ...values, userId]
      );
      return res.rows[0] || null;
    }

    const idx = this.memoryData.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.memoryData.events[idx] = updated;
      this.persist();
    }
    return updated;
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const existing = await this.getEventById(id, userId);
    if (!existing) return false;

    if (this.isPostgres && this.pool) {
      await this.pool.query('DELETE FROM events WHERE id = $1 AND user_id = $2', [id, userId]);
      return true;
    }

    this.memoryData.events = this.memoryData.events.filter(e => e.id !== id);
    this.memoryData.budget_items = this.memoryData.budget_items.filter(b => b.event_id !== id);
    this.memoryData.tasks = this.memoryData.tasks.filter(t => t.event_id !== id);
    this.memoryData.vendors = this.memoryData.vendors.filter(v => v.event_id !== id);
    this.memoryData.event_ideas = this.memoryData.event_ideas.filter(i => i.event_id !== id);
    this.memoryData.plan_revisions = this.memoryData.plan_revisions.filter(r => r.event_id !== id);
    this.persist();
    return true;
  }

  // --- Ownership Verification Helpers for Strict Security ---
  async verifyBudgetItemOwnership(budgetItemId: string, userId: string): Promise<boolean> {
    const item = this.memoryData.budget_items.find(b => b.id === budgetItemId);
    if (!item) return false;
    const event = await this.getEventById(item.event_id, userId);
    return !!event;
  }

  async verifyTaskOwnership(taskId: string, userId: string): Promise<boolean> {
    const item = this.memoryData.tasks.find(t => t.id === taskId);
    if (!item) return false;
    const event = await this.getEventById(item.event_id, userId);
    return !!event;
  }

  async verifyVendorOwnership(vendorId: string, userId: string): Promise<boolean> {
    const item = this.memoryData.vendors.find(v => v.id === vendorId);
    if (!item) return false;
    const event = await this.getEventById(item.event_id, userId);
    return !!event;
  }

  // --- Budget Items ---
  async getBudgetItems(eventId: string): Promise<BudgetItem[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM budget_items WHERE event_id = $1 ORDER BY created_at ASC', [eventId]);
      return res.rows;
    }
    return this.memoryData.budget_items.filter(b => b.event_id === eventId);
  }

  async createBudgetItem(item: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetItem> {
    const now = new Date().toISOString();
    const newItem: BudgetItem = {
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO budget_items (id, event_id, category, name, estimated_cost, actual_cost, paid_amount, notes, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [newItem.id, newItem.event_id, newItem.category, newItem.name, newItem.estimated_cost, newItem.actual_cost, newItem.paid_amount, newItem.notes, newItem.status, newItem.created_at, newItem.updated_at]
      );
      return res.rows[0];
    }
    this.memoryData.budget_items.push(newItem);
    this.persist();
    return newItem;
  }

  // Optimized batch insertion
  async createBudgetItemsBatch(items: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    const newItems: BudgetItem[] = items.map(item => ({
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    }));

    if (this.isPostgres && this.pool) {
      for (const newItem of newItems) {
        await this.pool.query(
          `INSERT INTO budget_items (id, event_id, category, name, estimated_cost, actual_cost, paid_amount, notes, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [newItem.id, newItem.event_id, newItem.category, newItem.name, newItem.estimated_cost, newItem.actual_cost, newItem.paid_amount, newItem.notes, newItem.status, newItem.created_at, newItem.updated_at]
        );
      }
      return;
    }

    this.memoryData.budget_items.push(...newItems);
    this.persist();
  }

  async updateBudgetItem(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem | null> {
    const now = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'event_id');
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = keys.map(k => (updates as Record<string, unknown>)[k]);
      const res = await this.pool.query(
        `UPDATE budget_items SET ${setClauses}, updated_at = '${now}' WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return res.rows[0] || null;
    }
    const idx = this.memoryData.budget_items.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.memoryData.budget_items[idx] = {
      ...this.memoryData.budget_items[idx],
      ...updates,
      updated_at: now,
    };
    this.persist();
    return this.memoryData.budget_items[idx];
  }

  async deleteBudgetItem(id: string): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('DELETE FROM budget_items WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }
    const lenBefore = this.memoryData.budget_items.length;
    this.memoryData.budget_items = this.memoryData.budget_items.filter(b => b.id !== id);
    this.persist();
    return this.memoryData.budget_items.length < lenBefore;
  }

  // --- Tasks ---
  async getTasks(eventId: string): Promise<TaskItem[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM tasks WHERE event_id = $1 ORDER BY days_before_event DESC, due_date ASC', [eventId]);
      return res.rows;
    }
    return this.memoryData.tasks.filter(t => t.event_id === eventId);
  }

  async createTask(item: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>): Promise<TaskItem> {
    const now = new Date().toISOString();
    const newTask: TaskItem = {
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO tasks (id, event_id, title, category, due_date, days_before_event, priority, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [newTask.id, newTask.event_id, newTask.title, newTask.category, newTask.due_date, newTask.days_before_event, newTask.priority, newTask.status, newTask.notes, newTask.created_at, newTask.updated_at]
      );
      return res.rows[0];
    }
    this.memoryData.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  async createTasksBatch(items: Omit<TaskItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    const newItems: TaskItem[] = items.map(item => ({
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    }));

    if (this.isPostgres && this.pool) {
      for (const newItem of newItems) {
        await this.pool.query(
          `INSERT INTO tasks (id, event_id, title, category, due_date, days_before_event, priority, status, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [newItem.id, newItem.event_id, newItem.title, newItem.category, newItem.due_date, newItem.days_before_event, newItem.priority, newItem.status, newItem.notes, newItem.created_at, newItem.updated_at]
        );
      }
      return;
    }

    this.memoryData.tasks.push(...newItems);
    this.persist();
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem | null> {
    const now = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'event_id');
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = keys.map(k => (updates as Record<string, unknown>)[k]);
      const res = await this.pool.query(
        `UPDATE tasks SET ${setClauses}, updated_at = '${now}' WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return res.rows[0] || null;
    }
    const idx = this.memoryData.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.memoryData.tasks[idx] = {
      ...this.memoryData.tasks[idx],
      ...updates,
      updated_at: now,
    };
    this.persist();
    return this.memoryData.tasks[idx];
  }

  async deleteTask(id: string): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }
    const lenBefore = this.memoryData.tasks.length;
    this.memoryData.tasks = this.memoryData.tasks.filter(t => t.id !== id);
    this.persist();
    return this.memoryData.tasks.length < lenBefore;
  }

  // --- Vendors ---
  async getVendors(eventId: string): Promise<VendorItem[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM vendors WHERE event_id = $1 ORDER BY category ASC', [eventId]);
      return res.rows;
    }
    return this.memoryData.vendors.filter(v => v.event_id === eventId);
  }

  async createVendor(item: Omit<VendorItem, 'id' | 'created_at' | 'updated_at'>): Promise<VendorItem> {
    const now = new Date().toISOString();
    const newVendor: VendorItem = {
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO vendors (id, event_id, category, name, contact_name, contact_phone, contact_email, quoted_amount, estimated_budget, booking_status, payment_status, notes, is_ai_estimate, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [newVendor.id, newVendor.event_id, newVendor.category, newVendor.name, newVendor.contact_name, newVendor.contact_phone, newVendor.contact_email, newVendor.quoted_amount, newVendor.estimated_budget, newVendor.booking_status, newVendor.payment_status, newVendor.notes, newVendor.is_ai_estimate, newVendor.created_at, newVendor.updated_at]
      );
      return res.rows[0];
    }
    this.memoryData.vendors.push(newVendor);
    this.persist();
    return newVendor;
  }

  async createVendorsBatch(items: Omit<VendorItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    if (items.length === 0) return;
    const now = new Date().toISOString();
    const newItems: VendorItem[] = items.map(item => ({
      id: uuidv4(),
      ...item,
      created_at: now,
      updated_at: now,
    }));

    if (this.isPostgres && this.pool) {
      for (const newItem of newItems) {
        await this.pool.query(
          `INSERT INTO vendors (id, event_id, category, name, contact_name, contact_phone, contact_email, quoted_amount, estimated_budget, booking_status, payment_status, notes, is_ai_estimate, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [newItem.id, newItem.event_id, newItem.category, newItem.name, newItem.contact_name, newItem.contact_phone, newItem.contact_email, newItem.quoted_amount, newItem.estimated_budget, newItem.booking_status, newItem.payment_status, newItem.notes, newItem.is_ai_estimate, newItem.created_at, newItem.updated_at]
        );
      }
      return;
    }

    this.memoryData.vendors.push(...newItems);
    this.persist();
  }

  async updateVendor(id: string, updates: Partial<VendorItem>): Promise<VendorItem | null> {
    const now = new Date().toISOString();
    if (this.isPostgres && this.pool) {
      const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'event_id');
      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = keys.map(k => (updates as Record<string, unknown>)[k]);
      const res = await this.pool.query(
        `UPDATE vendors SET ${setClauses}, updated_at = '${now}' WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return res.rows[0] || null;
    }
    const idx = this.memoryData.vendors.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.memoryData.vendors[idx] = {
      ...this.memoryData.vendors[idx],
      ...updates,
      updated_at: now,
    };
    this.persist();
    return this.memoryData.vendors[idx];
  }

  async deleteVendor(id: string): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('DELETE FROM vendors WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    }
    const lenBefore = this.memoryData.vendors.length;
    this.memoryData.vendors = this.memoryData.vendors.filter(v => v.id !== id);
    this.persist();
    return this.memoryData.vendors.length < lenBefore;
  }

  // --- Ideas & Recommendations ---
  async getIdeas(eventId: string): Promise<EventIdea[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM event_ideas WHERE event_id = $1', [eventId]);
      return res.rows;
    }
    return this.memoryData.event_ideas.filter(i => i.event_id === eventId);
  }

  async createIdea(idea: Omit<EventIdea, 'id' | 'created_at'>): Promise<EventIdea> {
    const newIdea: EventIdea = {
      id: uuidv4(),
      ...idea,
      created_at: new Date().toISOString(),
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'INSERT INTO event_ideas (id, event_id, type, title, description, estimated_cost, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newIdea.id, newIdea.event_id, newIdea.type, newIdea.title, newIdea.description, newIdea.estimated_cost, newIdea.created_at]
      );
      return res.rows[0];
    }
    this.memoryData.event_ideas.push(newIdea);
    this.persist();
    return newIdea;
  }

  async createIdeasBatch(ideas: Omit<EventIdea, 'id' | 'created_at'>[]): Promise<void> {
    if (ideas.length === 0) return;
    const now = new Date().toISOString();
    const newIdeas: EventIdea[] = ideas.map(idea => ({
      id: uuidv4(),
      ...idea,
      created_at: now,
    }));

    if (this.isPostgres && this.pool) {
      for (const item of newIdeas) {
        await this.pool.query(
          'INSERT INTO event_ideas (id, event_id, type, title, description, estimated_cost, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [item.id, item.event_id, item.type, item.title, item.description, item.estimated_cost, item.created_at]
        );
      }
      return;
    }

    this.memoryData.event_ideas.push(...newIdeas);
    this.persist();
  }

  async deleteIdeasByEvent(eventId: string): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query('DELETE FROM event_ideas WHERE event_id = $1', [eventId]);
      return;
    }
    this.memoryData.event_ideas = this.memoryData.event_ideas.filter(i => i.event_id !== eventId);
    this.persist();
  }

  // --- Revisions ---
  async getRevisions(eventId: string): Promise<PlanRevision[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM plan_revisions WHERE event_id = $1 ORDER BY created_at DESC', [eventId]);
      return res.rows;
    }
    return this.memoryData.plan_revisions
      .filter(r => r.event_id === eventId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createRevision(rev: Omit<PlanRevision, 'id' | 'created_at'>): Promise<PlanRevision> {
    const newRev: PlanRevision = {
      id: uuidv4(),
      ...rev,
      created_at: new Date().toISOString(),
    };
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        'INSERT INTO plan_revisions (id, event_id, revision_note, previous_budget, new_budget, changes_applied, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newRev.id, newRev.event_id, newRev.revision_note, newRev.previous_budget, newRev.new_budget, JSON.stringify(newRev.changes_applied), newRev.created_at]
      );
      return res.rows[0];
    }
    this.memoryData.plan_revisions.push(newRev);
    this.persist();
    return newRev;
  }

  // --- Full Event Details & Calculation Helpers ---
  async getFullEvent(eventId: string, userId?: string): Promise<EventFullDetail | null> {
    const evt = await this.getEventById(eventId, userId);
    if (!evt) return null;

    const [budget_items, tasks, vendors, ideas, revisions] = await Promise.all([
      this.getBudgetItems(eventId),
      this.getTasks(eventId),
      this.getVendors(eventId),
      this.getIdeas(eventId),
      this.getRevisions(eventId),
    ]);

    const totalEstimated = budget_items.reduce((acc, item) => acc + (Number(item.estimated_cost) || 0), 0);
    const totalActual = budget_items.reduce((acc, item) => acc + (Number(item.actual_cost) || 0), 0);
    const totalBudget = Number(evt.budget) || 0;
    const remainingBalance = totalBudget - (totalActual > 0 ? totalActual : totalEstimated);

    const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
    const vendorsBooked = vendors.filter(v => v.booking_status === 'booked').length;
    const collaborators = await this.getCollaborators(eventId);
    const user_role = userId ? (await this.getUserRole(eventId, userId)) || 'viewer' : 'owner';

    return {
      ...evt,
      budget_items,
      tasks,
      vendors,
      ideas,
      revisions,
      collaborators,
      user_role,
      metrics: {
        totalBudget,
        totalEstimated,
        totalActual,
        remainingBalance,
        tasksTotal: tasks.length,
        tasksCompleted,
        vendorsBooked,
        vendorsTotal: vendors.length,
      },
    };
  }

  // --- Collaborators & RBAC ---
  async getCollaborators(eventId: string): Promise<Collaborator[]> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('SELECT * FROM event_collaborators WHERE event_id = $1 ORDER BY created_at ASC', [eventId]);
      return res.rows;
    }
    return (this.memoryData.collaborators || []).filter(c => c.event_id === eventId);
  }

  async addCollaborator(collab: Omit<Collaborator, 'id' | 'created_at'>): Promise<Collaborator> {
    const existing = (this.memoryData.collaborators || []).find(
      c => c.event_id === collab.event_id && (c.user_id === collab.user_id || c.user_email.toLowerCase() === collab.user_email.toLowerCase())
    );
    if (existing) {
      existing.role = collab.role;
      this.persist();
      return existing;
    }

    const newCollab: Collaborator = {
      id: uuidv4(),
      ...collab,
      created_at: new Date().toISOString(),
    };

    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO event_collaborators (id, event_id, user_id, user_email, user_name, role, invited_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [newCollab.id, newCollab.event_id, newCollab.user_id, newCollab.user_email, newCollab.user_name || null, newCollab.role, newCollab.invited_by, newCollab.created_at]
      );
      return res.rows[0];
    }

    if (!this.memoryData.collaborators) this.memoryData.collaborators = [];
    this.memoryData.collaborators.push(newCollab);
    this.persist();
    return newCollab;
  }

  async removeCollaborator(eventId: string, collaboratorId: string): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query('DELETE FROM event_collaborators WHERE event_id = $1 AND id = $2', [eventId, collaboratorId]);
      return (res.rowCount ?? 0) > 0;
    }
    const beforeLen = (this.memoryData.collaborators || []).length;
    this.memoryData.collaborators = (this.memoryData.collaborators || []).filter(
      c => !(c.event_id === eventId && (c.id === collaboratorId || c.user_id === collaboratorId))
    );
    this.persist();
    return this.memoryData.collaborators.length < beforeLen;
  }

  async getUserRole(eventId: string, userId: string): Promise<CollaboratorRole | null> {
    const evt = this.memoryData.events.find(e => e.id === eventId);
    if (!evt) return null;
    if (evt.user_id === userId) return 'owner';
    const collab = (this.memoryData.collaborators || []).find(c => c.event_id === eventId && c.user_id === userId);
    return collab ? collab.role : null;
  }

  // --- Audit Logging System ---
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...log,
    };
    if (this.isPostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO audit_logs (id, timestamp, request_id, actor_id, actor_email, action, resource_type, resource_id, status, ip_address, user_agent, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [newLog.id, newLog.timestamp, newLog.request_id || null, newLog.actor_id, newLog.actor_email || null, newLog.action, newLog.resource_type, newLog.resource_id || null, newLog.status, newLog.ip_address || null, newLog.user_agent || null, JSON.stringify(newLog.metadata || {})]
        );
      } catch (e) {
        logger.warn('Audit log write to postgres skipped:', (e as Error).message);
      }
    }
    if (!this.memoryData.audit_logs) this.memoryData.audit_logs = [];
    this.memoryData.audit_logs.push(newLog);
    if (this.memoryData.audit_logs.length > 2000) {
      this.memoryData.audit_logs = this.memoryData.audit_logs.slice(-2000);
    }
    this.persist();
    return newLog;
  }

  async getAuditLogs(filter?: { eventId?: string; actorId?: string; limit?: number }): Promise<AuditLog[]> {
    let logs = [...(this.memoryData.audit_logs || [])];
    if (filter?.eventId) {
      logs = logs.filter(l => l.resource_id === filter.eventId || l.metadata?.eventId === filter.eventId);
    }
    if (filter?.actorId) {
      logs = logs.filter(l => l.actor_id === filter.actorId);
    }
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs.slice(0, filter?.limit || 50);
  }

  // --- Data Privacy & GDPR Portability / Deletion ---
  async exportUserData(userId: string) {
    const user = await this.getUserById(userId);
    const ownedEvents = this.memoryData.events.filter(e => e.user_id === userId);
    const eventIds = new Set(ownedEvents.map(e => e.id));
    const budgetItems = this.memoryData.budget_items.filter(b => eventIds.has(b.event_id));
    const tasks = this.memoryData.tasks.filter(t => eventIds.has(t.event_id));
    const vendors = this.memoryData.vendors.filter(v => eventIds.has(v.event_id));
    const ideas = this.memoryData.event_ideas.filter(i => eventIds.has(i.event_id));
    const revisions = this.memoryData.plan_revisions.filter(r => eventIds.has(r.event_id));
    const collaborations = (this.memoryData.collaborators || []).filter(c => c.user_id === userId);
    const auditLogs = (this.memoryData.audit_logs || []).filter(a => a.actor_id === userId);

    return {
      exportDate: new Date().toISOString(),
      compliance: 'GDPR Article 15 (Right of Access) & CCPA Portability',
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        createdAt: user?.created_at,
      },
      eventsSummary: {
        totalOwned: ownedEvents.length,
        totalCollaborations: collaborations.length,
      },
      events: ownedEvents,
      budgetItems,
      tasks,
      vendors,
      ideas,
      revisions,
      collaborations,
      auditLogs,
    };
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    const ownedEvents = this.memoryData.events.filter(e => e.user_id === userId);
    for (const evt of ownedEvents) {
      await this.deleteEvent(evt.id, userId);
    }
    this.memoryData.collaborators = (this.memoryData.collaborators || []).filter(c => c.user_id !== userId);
    this.memoryData.users = this.memoryData.users.filter(u => u.id !== userId);
    this.persist();
    return true;
  }

  async clearEventPlan(eventId: string): Promise<void> {
    if (this.isPostgres && this.pool) {
      await this.pool.query('DELETE FROM budget_items WHERE event_id = $1', [eventId]);
      await this.pool.query('DELETE FROM tasks WHERE event_id = $1', [eventId]);
      await this.pool.query('DELETE FROM vendors WHERE event_id = $1', [eventId]);
      await this.pool.query('DELETE FROM event_ideas WHERE event_id = $1', [eventId]);
      return;
    }
    this.memoryData.budget_items = this.memoryData.budget_items.filter(b => b.event_id !== eventId);
    this.memoryData.tasks = this.memoryData.tasks.filter(t => t.event_id !== eventId);
    this.memoryData.vendors = this.memoryData.vendors.filter(v => v.event_id !== eventId);
    this.memoryData.event_ideas = this.memoryData.event_ideas.filter(i => i.event_id !== eventId);
    this.persist();
  }

  async saveAIFeedback(feedback: Omit<AIFeedbackRecord, 'id' | 'created_at'>): Promise<AIFeedbackRecord> {
    const record: AIFeedbackRecord = {
      id: `fbk_${uuidv4()}`,
      created_at: new Date().toISOString(),
      ...feedback,
    };
    if (this.isPostgres && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO ai_feedback (id, event_id, user_id, suggestion_id, suggestion_type, rating, user_action, feedback_comment, category, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            record.id,
            record.event_id,
            record.user_id,
            record.suggestion_id || null,
            record.suggestion_type,
            record.rating,
            record.user_action,
            record.feedback_comment || null,
            record.category || null,
            record.created_at,
          ]
        );
        return record;
      } catch (err) {
        logger.warn('Postgres saveAIFeedback error, falling back to memory:', err);
      }
    }
    if (!this.memoryData.ai_feedback) {
      this.memoryData.ai_feedback = [];
    }
    this.memoryData.ai_feedback.push(record);
    this.persist();
    return record;
  }

  async getAIFeedback(eventId?: string): Promise<AIFeedbackRecord[]> {
    if (this.isPostgres && this.pool) {
      try {
        if (eventId) {
          const res = await this.pool.query('SELECT * FROM ai_feedback WHERE event_id = $1 ORDER BY created_at DESC', [eventId]);
          return res.rows;
        }
        const res = await this.pool.query('SELECT * FROM ai_feedback ORDER BY created_at DESC LIMIT 100');
        return res.rows;
      } catch (err) {
        logger.warn('Postgres getAIFeedback error, falling back to memory:', err);
      }
    }
    const list = this.memoryData.ai_feedback || [];
    if (eventId) {
      return list.filter(f => f.event_id === eventId);
    }
    return list;
  }

}

export const db = new StorageManager();
