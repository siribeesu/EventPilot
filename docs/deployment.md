# 🚀 EventPilot Deployment & Infrastructure Guide

This guide provides end-to-end instructions for deploying, configuring, and operating **EventPilot** across cloud and serverless production environments.

---

## 📋 Table of Contents
1. [Prerequisites & Required Services](#1-prerequisites--required-services)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Setup & Migrations](#3-database-setup--migrations)
4. [Deployment Workflows](#4-deployment-workflows)
   - [A. Vercel Serverless (Recommended Production)](#a-vercel-serverless-recommended-production)
   - [B. Docker & Containerized Linux](#b-docker--containerized-linux)
   - [C. Node.js Production Cluster](#c-nodejs-production-cluster)
5. [Monitoring, Telemetry & Health Checks](#5-monitoring-telemetry--health-checks)
6. [Data Backups & Disaster Recovery](#6-data-backups--disaster-recovery)

---

## 1. Prerequisites & Required Services

| Component | Technology | Recommended Service | Minimum Requirement |
| :--- | :--- | :--- | :--- |
| **Edge & Frontend** | React 19 + Tailwind v4 | Vercel CDN / Cloudflare Pages | Node.js &ge; 20.x |
| **Serverless API** | Express 5 on Node.js | Vercel Serverless Functions | Node.js 20.x / 22.x LTS |
| **Database** | PostgreSQL | Neon Serverless / Supabase / AWS Aurora | PostgreSQL 15+ (or JSON storage fallback) |
| **AI LLM Engine** | Gemini 2.5 API | Google AI Studio | Optional (built-in rule heuristics fallback) |
| **Object Storage** | Client-Side / Memory | In-browser PDF renderer | Zero external bucket dependency |

---

## 2. Environment Configuration

### Required Production Secrets
```bash
# Cryptographically secure random secret (min 32 chars)
JWT_SECRET="your_production_secure_jwt_secret_hex_or_base64"

# Node production runtime environment flag
NODE_ENV="production"
```

### Optional External Service Integrations
```bash
# Managed PostgreSQL Connection String (SSL enabled)
DATABASE_URL="postgresql://eventpilot_user:strong_password@ep-host.neon.tech/eventpilot?sslmode=require"

# Google Gemini API key for GenAI event planning and Copilot drawer
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Alternative LLM Provider (if enabled)
OPENAI_API_KEY="sk-proj-YourOpenAIApiKey"

# Custom CORS allowed origins (comma-separated)
CORS_ORIGIN="https://eventpilot.ai,https://admin.eventpilot.ai"

# HTTP Listen Port (for standalone containerized deployments)
PORT=5000
```

---

## 3. Database Setup & Migrations

EventPilot features an automated hybrid dual-layer storage engine:
1. **Automated Schema Provisioning**: When `DATABASE_URL` is configured, PostgreSQL connection pools initialize automatically. The server checks and provisions `events`, `budget_items`, `tasks`, `vendors`, `collaborators`, and `audit_logs` tables on startup without requiring manual SQL migrations.
2. **Zero-Config Resilient Fallback**: If `DATABASE_URL` is not supplied or experiences intermittent downtime, the engine gracefully transitions to an ACID-safe file/memory fallback (`server/data/database.json`), ensuring zero downtime during infrastructure migrations.

---

## 4. Deployment Workflows

### A. Vercel Serverless (Recommended Production)
The repo contains root-level [`vercel.json`](../vercel.json) configured for single-repo multi-target deployment:
- **Client Bundle**: Built from `client/` and served via global CDN edges.
- **Server API**: Packaged via [`api/index.ts`](../api/index.ts) as a serverless Express application.

#### Deployment Steps:
```bash
# 1. Login to Vercel CLI
npx vercel login

# 2. Deploy to Preview
npx vercel

# 3. Deploy to Production
npx vercel --prod
```

### B. Docker & Containerized Linux
Build and run the unified monorepo container:
```bash
# Build production Docker image
docker build -t eventpilot:latest .

# Run container with environment bindings
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e JWT_SECRET="your_production_secret_key" \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --name eventpilot-app \
  eventpilot:latest
```

### C. Node.js Production Cluster
```bash
# 1. Install production dependencies
npm ci --omit=dev

# 2. Build client and server bundles
npm run build

# 3. Start production server using PM2
pm2 start server/dist/index.js --name "eventpilot-api" -i max
```

---

## 5. Monitoring, Telemetry & Health Checks

EventPilot provides unauthenticated liveness and system observability endpoints:

### Liveness Probe
- **Endpoint**: `GET /api/health`
- **Expected Status**: `HTTP 200 OK`
- **Output**: JSON containing uptime, database state, AI engine status, and active security middleware.

### Telemetry & Memory Profiling
- **Endpoint**: `GET /api/metrics`
- **Expected Status**: `HTTP 200 OK`
- **Key Metrics Tracked**: Total requests, unhandled errors, error rate %, RSS memory footprint, and heap allocations.

---

## 6. Data Backups & Disaster Recovery

### Continuous Data Protection (PostgreSQL)
- **Point-in-Time Recovery (PITR)**: Enable 7-day WAL log archiving in Neon / Supabase.
- **Daily Automated Snapshots**: Retained for 30 days across multiple availability zones.
- **Manual Backup Trigger**:
  ```bash
  pg_dump -Fc -v "$DATABASE_URL" > "eventpilot_backup_$(date +%Y%m%d_%H%M%S).dump"
  ```

### Restoration Runbook
```bash
pg_restore -v --clean --no-acl --no-owner -d "$DATABASE_URL" "eventpilot_backup_20261101.dump"
```
