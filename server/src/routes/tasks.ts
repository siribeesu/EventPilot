import { Router } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/index.js';

const router = Router();

// GET all tasks for an event
router.get('/events/:id/tasks', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const tasks = await db.getTasks(event.id);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST add task to an event
router.post('/events/:id/tasks', async (req: AuthenticatedRequest, res) => {
  try {
    const eventId = String(req.params.id);
    const userId = req.userId || 'usr_demo_123';
    const event = await db.getEventById(eventId, userId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const task = await db.createTask({
      event_id: event.id,
      ...parsed.data,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// PATCH update task
router.patch('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const taskId = String(req.params.id);
    const parsed = UpdateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const updated = await db.updateTask(taskId, parsed.data);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// DELETE task
router.delete('/tasks/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const taskId = String(req.params.id);
    const deleted = await db.deleteTask(taskId);
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
