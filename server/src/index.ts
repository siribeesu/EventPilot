import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import budgetRouter from './routes/budget.js';
import tasksRouter from './routes/tasks.js';
import vendorsRouter from './routes/vendors.js';
import { authMiddleware } from './middleware/auth.js';
import { standardLimiter, aiRateLimiter, authLimiter } from './middleware/rateLimit.js';
import { sanitizeObject } from './utils/sanitize.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Helmet Security Layer (CSP, Frameguard, XSS protection, MIME sniffing prevention)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:5173'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Security Layer
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in allowed list
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Cross-Origin Request Blocked by EventPilot Security Policy'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body parser with strict size limits
app.use(express.json({ limit: '2mb' }));

// 4. Global Input Sanitization Middleware to strip XSS & control characters
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// 5. Standard Rate Limiting for all API requests
app.use('/api', standardLimiter);

// Health check endpoint (exempt from auth)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EventPilot Backend',
    timestamp: new Date().toISOString(),
    postgresConfigured: !!process.env.DATABASE_URL,
    aiConfigured: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
  });
});

// Mount Public Auth Routes with Auth-specific Rate Limiting
app.use('/api/auth', authLimiter, authRouter);

// Apply AI rate limiter specifically to plan generation and assistant routes
app.use('/api/events/:id/generate-plan', aiRateLimiter);
app.use('/api/events/:id/assistant', aiRateLimiter);
app.use('/api/events/:id/budget-rescue/preview', aiRateLimiter);

// Protected routes (falls back cleanly to demo user if no token provided)
app.use('/api/events', authMiddleware, eventsRouter);
app.use('/api', authMiddleware, budgetRouter);
app.use('/api', authMiddleware, tasksRouter);
app.use('/api', authMiddleware, vendorsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Unhandled Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`✨ EventPilot Backend running on port ${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🛡️  Security: Helmet Enabled | Rate Limiting Active | CORS Restricted`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Persistent Storage (database.json)'}`);
  console.log(`🤖 AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini API' : (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Intelligent Deterministic Engine (Demo Mode)')}`);
  console.log(`===============================================`);
});
