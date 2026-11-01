# 📜 Architecture Decision Log & Roadmap

This log indexes all formal Architecture Decision Records (ADRs) and records key technical evolution decisions for **EventPilot**.

---

## 🏛️ Architecture Decision Records Index

| ID | Title | Status | Date | Primary Driver |
| :--- | :--- | :--- | :--- | :--- |
| [ADR-001](adr/001-hybrid-postgres-json-storage.md) | **Hybrid PostgreSQL & Local JSON Dual-Storage Engine** | Accepted | 2026-10 | Resilience against database network failures & zero-config local evaluation. |
| [ADR-002](adr/002-dual-layer-ai-guardrails.md) | **Dual-Layer AI Guardrails & Prompt Sanitization** | Accepted | 2026-10 | Defense against prompt injection, jailbreaks, and unpredictable LLM outputs. |
| [ADR-003](adr/003-rbac-and-gdpr-portability.md) | **Granular Event RBAC & GDPR Data Portability** | Accepted | 2026-10 | SOC 2 / GDPR compliance with multi-tenant role isolation. |
| [ADR-004](adr/004-client-side-pdf-generation.md) | **Client-Side Executive PDF Portfolio Generation** | Accepted | 2026-10 | Serverless resource optimization and zero backend rendering overhead. |

---

## 🧭 Technical Roadmap & Milestones

### Milestone 1: Production Hardening & Rigor (Completed)
- [x] Zero-warning linter standard enforced via ESLint + Oxlint.
- [x] Strict TypeScript configs across client and server with unified `tsconfig.base.json`.
- [x] 100% automated test pass rate across 107 tests in 11 suites.
- [x] Defense-in-depth security: JWT HS256 pinning, Prototype Pollution defense, constant-time crypto.
- [x] Complete governance documents: `SECURITY.md`, `CONTRIBUTING.md`, `.github/CODEOWNERS`, Issue & PR templates.

### Milestone 2: Enterprise Collaboration (Current & Near-Term)
- [x] Real-time collaboration role hierarchy (`Owner`, `Editor`, `Viewer`).
- [x] Forensic audit logging for all mutating financial and event operations.
- [ ] WebSocket / SSE live presence indicator for active collaborators on an event.
- [ ] Granular activity notification preferences (in-app, email alerts for budget deficits).

### Milestone 3: Multimodal & Offline Resilience
- [x] Semantic hash caching for AI prompts to reduce API costs by up to 70%.
- [x] Client-side offline cache for instant page loads.
- [ ] Service worker offline synchronization for field planners with intermittent network.
- [ ] Receipt OCR scanning using Gemini Vision for automated expense entry.
