# ADR 003: Multi-Tenant RBAC & GDPR Data Portability Architecture

## Status
**Accepted** (2026-10-19)

## Context
Event planning involves sensitive personal data (guest headcounts, financial budgets, vendor contracts, personal dietary preferences). Compliance with GDPR (Articles 15 & 17) and CCPA is mandatory for modern SaaS applications. Furthermore, event hosts need collaborative access with granular permissions.

## Decision
1. **Three-Tier Role-Based Access Control (RBAC)**:
   - `owner`: Full administrative privileges (delete event, manage collaborators, transfer ownership).
   - `editor`: Can create/update budget items, tasks, and vendors; run AI rescue mode.
   - `viewer`: Read-only access to plans, timelines, and metrics; forbidden from mutating data (HTTP 403 Forbidden).
2. **GDPR Data Portability (Article 15)**:
   - Endpoint `GET /api/privacy/export-data` compiles a complete, machine-readable JSON package containing all owned events, budgets, tasks, vendors, and audit logs.
3. **Right to Erasure (Article 17)**:
   - Endpoint `DELETE /api/privacy/delete-account` cascades deletions across all child relations (budget items, vendors, tasks, collaborations) and removes the user record.
4. **Append-Only Audit Trail**:
   - Critical events (collaborator invites, role changes, budget modifications, AI feedback submissions) are permanently logged with timestamps, request IDs, and actor metadata.

## Consequences
### Positive
- Enterprise-grade compliance out of the box.
- Safe family and vendor collaboration without risk of unauthorized budget edits.
