# 🚀 EventPilot Production Readiness & Operations Manual

This document outlines the operational architecture, deployment guidelines, environment configuration, monitoring infrastructure, data retention policies, and disaster recovery procedures for **EventPilot**.

---

## 📋 Table of Contents
1. [Deployment Topologies](#1-deployment-topologies)
2. [Environment Configuration Matrix](#2-environment-configuration-matrix)
3. [Health Checks & Observability Metrics](#3-health-checks--observability-metrics)
4. [Fault Tolerance & Graceful Degradation](#4-fault-tolerance--graceful-degradation)
5. [Data Retention, Backups & GDPR Compliance](#5-data-retention-backups--gdpr-compliance)
6. [Operational Runbooks](#6-operational-runbooks)

---

## 1. Deployment Topologies

EventPilot supports two production deployment architectures:

### Topology A: Serverless Edge (Vercel Production)
- **Frontend**: Distributed across global Edge CDNs via Vercel Edge Network.
- **Backend**: Deployed as an optimized Vercel Serverless Function via [`api/index.ts`](../api/index.ts).
- **Database**: External managed PostgreSQL (Neon Serverless Postgres / Supabase / AWS Aurora Serverless) with SSL connection pooling.
- **AI Engine**: Direct HTTPS outbound integration with Google Gemini 2.5 API with automatic rule-based heuristics fallback.

### Topology B: Containerized Linux / Node.js Cluster
- **Process Manager**: PM2 or Docker / Kubernetes deployment.
- **Port**: Listens on `:5000` (configurable via `PORT` environment variable).
- **Reverse Proxy**: Nginx or Cloudflare managing SSL termination and rate limiting.

---

## 2. Environment Configuration Matrix

The following table documents all production environment variables:

| Variable | Required? | Default / Fallback | Purpose & Security Note |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `development` | Set to `production` in production. Disables debug logs and enforces strict security assertions. |
| `PORT` | Optional | `5000` | HTTP listen port for containerized backend executions. |
| `JWT_SECRET` | **Required (Prod)** | *Throws in production* | Secret key for signing and verifying HS256 auth tokens. Must be &ge; 32 random characters. |
| `DATABASE_URL` | Optional | In-memory / file JSON store | PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db?sslmode=require`). |
| `GEMINI_API_KEY` | Optional | Rule-based engine fallback | Google Gemini API key for GenAI master plan and copilot generation. |
| `OPENAI_API_KEY` | Optional | None | Secondary/alternative AI provider key if enabled. |
| `CORS_ORIGIN` | Optional | Localhost + `*.vercel.app` | Comma-separated list of allowed origins. |
| `LOG_LEVEL` | Optional | `info` (or `silent` in test) | Controls winston/custom logger granularity (`debug`, `info`, `warn`, `error`). |

---

## 3. Health Checks & Observability Metrics

EventPilot exposes live observability and telemetry endpoints that do not require authentication:

### Liveness & Readiness Probe: `GET /api/health`
Returns system status, active database drivers, AI provider configuration, and defensive security feature flags.

```json
{
  "status": "ok",
  "service": "EventPilot Enterprise Core",
  "timestamp": "2026-11-01T14:12:36.000Z",
  "environment": "production",
  "postgresConfigured": true,
  "aiConfigured": true,
  "security": {
    "helmet": true,
    "rateLimiting": true,
    "sanitization": true,
    "ownershipGuards": true,
    "rbac": true,
    "promptInjectionDefense": true,
    "auditLogging": true
  },
  "privacy": {
    "gdprRightOfAccess": true,
    "gdprRightToErasure": true
  },
  "efficiency": {
    "compression": true,
    "inMemoryCaching": true,
    "aiSemanticHashCaching": true
  }
}
```

### Telemetry & Memory Profiling: `GET /api/metrics`
Reports process uptime, request counters, error rates, and memory telemetry (RSS, Heap Used, Heap Total):

```json
{
  "uptime_seconds": 84210,
  "requests_total": 128450,
  "errors_total": 4,
  "error_rate_pct": "0.003%",
  "memory": {
    "rss_mb": 42.15,
    "heap_used_mb": 21.08,
    "heap_total_mb": 34.50
  }
}
```

---

## 4. Fault Tolerance & Graceful Degradation

EventPilot is engineered to stay fully functional even when external cloud dependencies experience outages:

1. **AI Provider Outage or Rate Limit (HTTP 429/503)**:
   - When Gemini API quotas are exhausted or offline, the system automatically falls back to deterministic rule-based algorithms with zero user downtime.
2. **Database Outage / Unreachable PostgreSQL**:
   - If `DATABASE_URL` is unavailable or connection times out, the `StorageManager` gracefully transitions to local memory/JSON persistence with forensic error logging.
3. **Budget Rescue Mode™ Determinism**:
   - Algorithmic budget deficit resolution operates purely on integer financial arithmetic without relying on external cloud APIs, ensuring instant recovery proposals.

---

## 5. Data Retention, Backups & GDPR Compliance

### Automated Data Retention Policies
- **Audit Logs**: Activity and audit records are retained for **90 days** in compliance with SOC 2 forensic retention standards.
- **GDPR Article 15 (Right of Access)**: Endpoints at `/api/events/:id/gdpr-export` allow users to export their complete event ledger in JSON format.
- **GDPR Article 17 (Right to Erasure)**: Cascading erasure permanently purges event items, vendor records, collaborator invites, and logs upon owner request.

### Backup Schedule (PostgreSQL Managed Deployments)
- **Point-in-Time Recovery (PITR)**: 7-day continuous archiving via PostgreSQL WAL logs.
- **Daily Snapshots**: Automated encrypted daily snapshots retained for 30 days.

---

## 6. Operational Runbooks

### Runbook 1: High Latency or Memory Spike
1. Inspect `GET /api/metrics` to verify memory RSS and error rates.
2. Check PostgreSQL connection pool statistics to identify slow or unindexed queries.
3. Review AI semantic cache hit ratios; consider increasing cache TTL or scaling memory limits.

### Runbook 2: Rotating the JWT Secret
1. Set the new secret in your secret manager / environment variables.
2. Trigger a rolling deployment of serverless functions or container replicas.
3. Existing client sessions will receive a standard `401 Unauthorized` and cleanly re-authenticate without corrupting state.
