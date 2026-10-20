import { Router } from 'express';
import { db } from '../database/db.js';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { hashPassword, verifyPassword } from '../utils/security.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required', code: 'MISSING_EMAIL' });
    }

    let user = await db.getUserByEmail(email);
    if (!user) {
      const pwd = password || 'EventPilot2026!';
      const { salt, hash } = hashPassword(pwd);
      user = await db.createUser({
        email,
        name: email.split('@')[0],
        password_hash: `${salt}:${hash}`,
      });
    } else if (password && user.password_hash && user.password_hash.includes(':')) {
      const [salt, hash] = user.password_hash.split(':');
      const isValid = verifyPassword(password, salt, hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message, code: 'AUTH_FAILED' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required', code: 'MISSING_FIELDS' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email', code: 'USER_EXISTS' });
    }

    const pwd = password || 'EventPilot2026!';
    const { salt, hash } = hashPassword(pwd);

    const user = await db.createUser({
      email,
      name,
      password_hash: `${salt}:${hash}`,
    });

    const token = generateToken({ id: user.id, email: user.email });
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message, code: 'REGISTRATION_FAILED' });
  }
});

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.getUserById(req.userId || 'usr_demo_123');
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
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
