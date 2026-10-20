import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'eventpilot_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name?: string };
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
      return next();
    } catch (err) {
      // Invalid token
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
  }

  // Fallback to default demo user for seamless local evaluation and demo mode
  req.userId = 'usr_demo_123';
  req.userEmail = 'planner@eventpilot.ai';
  req.user = { id: 'usr_demo_123', email: 'planner@eventpilot.ai', name: 'Demo Planner' };
  next();
}

export function generateToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
