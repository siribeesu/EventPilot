import { Router } from 'express';
import { db } from '../database/db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = await db.getUserByEmail(email);
    if (!user) {
      // Auto-create or login demo user
      user = await db.createUser({
        email,
        name: email.split('@')[0],
        password_hash: password || 'default',
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const user = await db.createUser({
      email,
      name,
      password_hash: password || 'default',
    });

    const token = generateToken({ id: user.id, email: user.email });
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.getUserById(req.userId || 'usr_demo_123');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
