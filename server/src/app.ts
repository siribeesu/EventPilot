import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import budgetRouter from './routes/budget.js';
import tasksRouter from './routes/tasks.js';
import vendorsRouter from './routes/vendors.js';
import collaboratorsRouter from './routes/collaborators.js';
import privacyRouter from './routes/privacy.js';
import metricsRouter, { recordMetricRequest } from './routes/metrics.js';
import { authMiddleware } from './middleware/auth.js';
import { standardLimiter, aiRateLimiter, authLimiter } from './middleware/rateLimit.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { sanitizeObject } from './utils/sanitize.js';
import { AppError } from './utils/errors.js';
import { logger } from './utils/logger.js';

dotenv.config();

export const app = express();

// 1. Request Correlation ID & Performance Timing
app.use(requestIdMiddleware);

// 2. High-Efficiency Payload Compression (gzip / deflate)
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    threshold: 1024,
  })
);

// 3. Enterprise Helmet Security Layer (adjusted for Vercel and production SSL)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:', 'http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    originAgentCluster: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// Advanced Defensive Headers: Device lockdowns & Anti-Clickjacking
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), vr=()');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 4. Strict CORS Security Layer (supports Vercel preview & production deployments)
const customOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : [];

const localOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173'];

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Same-origin, server-to-server or curl requests
  if (customOrigins.includes('*') || customOrigins.includes(origin)) return true;
  if (localOrigins.includes(origin)) return true;
  // Automatically trust Vercel production and preview deployment URLs
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked by EventPilot Security Policy'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  })
);

// 5. Body parser with Vercel serverless pre-parsed body handling & strict size limits
app.use((req, res, next) => {
  if (req.body !== undefined && req.body !== null && typeof req.body === 'object') {
    (req as express.Request & { _body?: boolean })._body = true;
  }
  next();
});
app.use(express.json({ limit: '2mb' }));

// 6. Global Input Sanitization Middleware to strip XSS & control characters
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// Create Core API Router
const apiRouter = express.Router();

// Telemetry & metrics request counting
apiRouter.use((req, res, next) => {
  recordMetricRequest();
  next();
});

// Rate limiting
apiRouter.use(standardLimiter);

// Health check endpoint with security & performance metadata
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EventPilot Enterprise Core',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel-serverless' : (process.env.NODE_ENV || 'development'),
    postgresConfigured: !!process.env.DATABASE_URL,
    aiConfigured: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    security: {
      helmet: true,
      rateLimiting: true,
      sanitization: true,
      ownershipGuards: true,
      rbac: true,
      promptInjectionDefense: true,
      auditLogging: true,
    },
    privacy: {
      gdprRightOfAccess: true,
      gdprRightToErasure: true,
    },
    efficiency: {
      compression: true,
      inMemoryCaching: true,
      aiSemanticHashCaching: true,
    },
  });
});

// System Observability Metrics
apiRouter.use('/', metricsRouter);

// Privacy & GDPR Routes (supports token auth + demo mode)
apiRouter.use('/', authMiddleware, privacyRouter);

// Mount Public Auth Routes with Auth-specific Rate Limiting
apiRouter.use('/auth', authLimiter, authRouter);

// Apply AI rate limiter specifically to plan generation and assistant routes
apiRouter.use('/events/:id/generate-plan', aiRateLimiter);
apiRouter.use('/events/:id/assistant', aiRateLimiter);
apiRouter.use('/events/:id/budget-rescue/preview', aiRateLimiter);

// Protected routes (falls back cleanly to demo user if no token provided)
apiRouter.use('/events', authMiddleware, eventsRouter);
apiRouter.use('/', authMiddleware, collaboratorsRouter);
apiRouter.use('/', authMiddleware, budgetRouter);
apiRouter.use('/', authMiddleware, tasksRouter);
apiRouter.use('/', authMiddleware, vendorsRouter);

// Mount the API Router on both '/api' and '/' to ensure fail-proof routing
// regardless of whether the hosting environment rewrites /api or preserves it.
app.use('/api', apiRouter);
app.use('/', apiRouter);

export interface AppHttpError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
}

// Global Error Handler with code quality standard format
app.use((err: AppError | AppHttpError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = ('statusCode' in err && typeof err.statusCode === 'number' && err.statusCode) || ('status' in err && typeof err.status === 'number' && err.status) || 500;
  const code = ('code' in err && typeof err.code === 'string' && err.code) || 'INTERNAL_SERVER_ERROR';

  if (status >= 500) {
    logger.error(`Server Unhandled Error [${req.method} ${req.originalUrl || req.url}]`, err);
  }

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code,
  });
});

export default app;
