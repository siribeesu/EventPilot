# 🛠️ EventPilot Backend Service

Production-grade, secure RESTful API service and real-time streaming backend for **EventPilot**, built with TypeScript, Express, PostgreSQL, and Vitest.

---

## 🏗️ Architecture Overview

The backend is architected following clean separation of concerns and defense-in-depth principles:

```
server/
├── src/
│   ├── database/          # Connection pool & zero-downtime schema migrator
│   │   ├── db.ts          # PostgreSQL pool with resilient memory store fallback
│   │   └── migrator.ts    # DDL execution & idempotent table creation
│   ├── middleware/        # Express middleware pipeline
│   │   ├── auth.ts        # JWT verification, RBAC permissions, token extraction
│   │   └── rateLimiter.ts # Per-IP rate limiting (100 req / 15 min)
│   ├── routes/            # REST API route handlers
│   │   ├── auth.ts        # Register, login, session validation
│   │   ├── events.ts      # CRUD, budget items, tasks, vendors, AI synthesis
│   │   └── collaborators.ts # Invite, update role, revoke access
│   ├── services/          # Core domain business logic
│   │   ├── aiPlanner.ts   # Rule-based heuristics & Gemini LLM synthesis
│   │   ├── auditTrail.ts  # Tamper-evident activity logging
│   │   └── taskQueue.ts   # In-memory async worker queue with concurrency control
│   ├── tests/             # Comprehensive Vitest test suites (98 tests across 11 suites)
│   ├── types/             # Strict TypeScript domain interfaces
│   ├── utils/             # Sanitizers, structured logger, validation helpers
│   └── index.ts           # Server bootstrap & graceful shutdown hooks
```

---

## 🔒 Security Architecture

1. **Strict Input Sanitization & Schema Validation**:
   - Every incoming request is parsed and validated against strict `Zod` schemas before entering business logic.
   - Text fields pass through `server/src/utils/sanitize.ts` which strips malicious `<script>` tags, event handlers (`onload`, `onerror`), and unwanted control characters to prevent Stored & Reflected XSS.

2. **HTTP Hardening**:
   - **Helmet**: Adds security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`).
   - **CORS**: Enforces origin whitelist (Vercel production domains, local development ports).
   - **Body Limit**: Enforces a strict 1MB payload ceiling to prevent Denial of Service (DoS) attacks via memory exhaustion.

3. **Authentication & Role-Based Access Control (RBAC)**:
   - High-entropy JSON Web Tokens (`HS256`) signed with `JWT_SECRET`.
   - Granular role enforcement:
     - **Owner**: Full access, can delete event, manage billing, and invite/remove collaborators.
     - **Editor**: Can create, update, and delete budget items, tasks, and vendors.
     - **Viewer**: Read-only access to event dashboard and financial breakdowns.
   - Unauthenticated or unauthorized actions return `401 Unauthorized` or `403 Forbidden` with structured JSON errors.

4. **Zero-Secret Logging**:
   - Structured JSON logger (`server/src/utils/logger.ts`) automatically masks authorization tokens, passwords, and API keys before outputting logs.

---

## ⚡ Background Task Queue & Real-Time SSE

- **`TaskQueue`**: In-memory async worker processing event heavy-lifting (budget re-calculations, AI suggestions, audit trail flushing) with max concurrency limits and timeout management.
- **Server-Sent Events (`/api/events/:id/stream`)**: Pushes real-time updates to connected clients whenever collaborators modify budget items, tasks, or vendor statuses.

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session | Yes |

### Events & Planning
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/events` | List all events accessible by the user | Yes |
| `POST` | `/api/events` | Create a new event with initial budget/tasks | Yes |
| `GET` | `/api/events/:id` | Fetch complete event aggregate | Yes |
| `PUT` | `/api/events/:id` | Update event metadata | Yes (Owner/Editor) |
| `DELETE` | `/api/events/:id` | Delete event and cascading records | Yes (Owner) |
| `POST` | `/api/events/:id/ai-plan` | Generate AI-driven budget and task breakdown | Yes (Owner/Editor) |
| `POST` | `/api/events/:id/budget` | Add or update budget line item | Yes (Owner/Editor) |
| `POST` | `/api/events/:id/tasks` | Create or update milestone task | Yes (Owner/Editor) |
| `POST` | `/api/events/:id/vendors` | Add or update vendor quote/contract | Yes (Owner/Editor) |
| `GET` | `/api/events/:id/audit-trail` | Fetch tamper-evident activity log | Yes |
| `GET` | `/api/events/:id/stream` | Real-time SSE event stream | Yes |

### Collaborators & RBAC
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/events/:id/collaborators` | List collaborators & roles | Yes |
| `POST` | `/api/events/:id/collaborators` | Invite collaborator by email | Yes (Owner) |
| `PATCH` | `/api/events/:id/collaborators/:uid` | Update collaborator role | Yes (Owner) |
| `DELETE` | `/api/events/:id/collaborators/:uid` | Revoke collaborator access | Yes (Owner) |

### Health & Monitoring
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service uptime, memory usage, DB status | No |

---

## 🧪 Testing & Quality Gates

The test suite contains **98 unit, integration, RBAC, and end-to-end tests** across 11 test files using Vitest.

```bash
# Run complete test suite
npm test

# Run critical path & edge cases
npm run test:critical

# Run end-to-end simulated user journeys
npm run test:e2e

# Run coverage report with CI gates
npm run test:coverage

# Run strict linter (Oxlint + TypeScript check)
npm run lint
```

### CI Coverage Thresholds
- **Lines**: &ge; 65%
- **Functions**: &ge; 70%
- **Statements**: &ge; 65%
- **Branches**: &ge; 50%
