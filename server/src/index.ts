import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import budgetRouter from './routes/budget.js';
import tasksRouter from './routes/tasks.js';
import vendorsRouter from './routes/vendors.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EventPilot Backend',
    timestamp: new Date().toISOString(),
    postgresConfigured: !!process.env.DATABASE_URL,
    aiConfigured: !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
  });
});

// Mount Public Auth Routes
app.use('/api/auth', authRouter);

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
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Persistent Storage (database.json)'}`);
  console.log(`🤖 AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini API' : (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Intelligent Deterministic Engine (Demo Mode)')}`);
  console.log(`===============================================`);
});
