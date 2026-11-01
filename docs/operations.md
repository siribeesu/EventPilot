# 🛠️ EventPilot Operations Manual

This document provides runtime operational procedures, system observability guides, alerting baselines, and disaster recovery runbooks for maintainers of **EventPilot**.

For initial environment setup and cloud deployment workflows, refer to [`docs/deployment.md`](deployment.md).

---

## 📋 Table of Contents
1. [Service Architecture & Boundaries](#1-service-architecture--boundaries)
2. [Runtime Health & Observability](#2-runtime-health--observability)
3. [Incident Response & Runbooks](#3-incident-response--runbooks)
4. [Data Retention & GDPR Operations](#4-data-retention--gdpr-operations)
5. [Routine Maintenance Tasks](#5-routine-maintenance-tasks)

---

## 1. Service Architecture & Boundaries

EventPilot operates across three isolated boundaries:
- **Presentation Layer (React 19)**: Client-side routing, optimistic state mutations, offline cache, and accessible UI controls.
- **Application & Security Pipeline (Express 5)**: JWT HS256 auth, RBAC authorization matrix, input sanitization, prototype pollution defense, and rate limiting.
- **Persistence & Fallback Engine**: Hybrid PostgreSQL primary store with seamless in-memory / JSON fallback.

---

## 2. Runtime Health & Observability

### Health Monitoring Baselines
- **Health Check (`GET /api/health`)**: Should respond in `< 50ms`. Return code must be `200`.
- **Metrics Telemetry (`GET /api/metrics`)**:
  - `error_rate_pct`: Expected baseline `< 0.05%`. Alert if sustained `> 1.0%`.
  - `memory.rss_mb`: Normal baseline `40MB - 120MB`. Alert if sustained `> 512MB`.
  - `uptime_seconds`: Monitored for unexpected container restarts.

---

## 3. Incident Response & Runbooks

### Incident 1: Surge in AI Rate Limits or 429 Errors
- **Symptom**: User receives alert that AI generation is taking longer or falling back.
- **Behavior**: EventPilot automatically engages its deterministic rule-based planning heuristics.
- **Remediation**:
  1. Inspect Gemini API quota usage in Google Cloud Console.
  2. Increase API quota limits or rotate API keys.
  3. Verify in-memory AI semantic caching is functioning.

### Incident 2: Database Connection Saturation
- **Symptom**: Latency increases on event read/write operations.
- **Behavior**: Connection pool queues requests up to maximum pool capacity (default 20 connections).
- **Remediation**:
  1. Verify connection pooling proxy (PgBouncer or Neon connection pooler).
  2. Verify slow queries via PostgreSQL `pg_stat_activity`.

---

## 4. Data Retention & GDPR Operations

- **Audit Trails**: Stored in `audit_logs` table for 90 days.
- **Right to Access (GDPR Article 15)**: Accessible via `GET /api/events/:id/gdpr-export`.
- **Right to Erasure (GDPR Article 17)**: Triggered via `DELETE /api/events/:id`. Cascades deletions across budget items, tasks, vendors, and collaborator mappings.

---

## 5. Routine Maintenance Tasks

| Frequency | Task | Command / Reference |
| :--- | :--- | :--- |
| **Weekly** | Automated Dependency Audit | `npm audit` / Dependabot |
| **Bi-weekly** | Code Quality Verification | `npm run verify` |
| **Monthly** | Database Backup Verification | Test restore of latest `.dump` file |
| **Quarterly** | Secret Rotation | Rotate `JWT_SECRET` and API credentials |
