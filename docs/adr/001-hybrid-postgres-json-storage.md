# ADR 001: Hybrid PostgreSQL and Persistent JSON Storage Engine

## Status
**Accepted** (2026-10-18)

## Context
EventPilot is designed for diverse deployment environments:
1. Production cloud hosting (Vercel Serverless + Supabase / PostgreSQL).
2. Zero-config local development and portfolio evaluation (Node.js runtime without forcing local Docker or PostgreSQL daemons).

Traditional ORMs (Prisma, TypeORM) introduce heavy binary query engines that often create deployment friction on serverless platforms and require complex local setup steps for evaluators.

## Decision
We implemented a dual-mode storage engine in `server/src/database/db.ts`:
- **PostgreSQL / Supabase Mode**: Automatically engaged when `DATABASE_URL` is set, leveraging pooled database connections with full SQL schemas, UUID keys, and transaction integrity.
- **Local Persistent JSON Mode**: Operates automatically when no external database is configured, persisting data atomically to disk with complete in-memory index mapping and identical method signatures.

## Consequences
### Positive
- Evaluators and developers can clone and execute `npm run verify` or `npm run dev` with **zero database configuration**.
- Serverless deploys on Vercel boot instantaneously without cold-start query engine penalties.
- 100% test coverage can run in CI matrix builds without spinning up containerized databases.

### Negative
- Local JSON store is suitable for single-node development; production high-scale deployments require `DATABASE_URL`.
