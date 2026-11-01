# ✅ EventPilot Engineering & Quality Gate Checklist

This document formalizes the mandatory quality gates, code review standards, and verification criteria required for all changes merged into `update` or `main`.

---

## 📋 Pre-Merge Verification Matrix

Every pull request must pass all gates in this checklist before maintainer approval:

### 1. Code Quality & Strict Type Safety
- [ ] **Zero Warnings Standard**: `npm run lint` passes with **0 errors and 0 warnings** across ESLint, Oxlint, and TypeScript.
- [ ] **No Lingering `any`**: No explicit or implicit `any` types; all API responses, database records, and component props are strictly typed.
- [ ] **No Dead Code**: Zero unused variables, unreferenced functions, or obsolete scaffolding imports (`no-unused-vars`).
- [ ] **Production Logging Cleanliness**: Zero raw `console.log` statements in application source; logging routed through structured `logger` utility.

### 2. Test Rigor & Coverage Proof
- [ ] **All Test Suites Green**: `npm test` passes **107/107 automated tests** across all 11 suites.
- [ ] **Critical Path Verification**: `npm run test:critical` passes with zero regressions on edge-case scenarios (negative values, budget overflows, auth failures).
- [ ] **End-to-End User Journeys**: `npm run test:e2e` verifies complete multi-step event lifecycles.
- [ ] **Coverage Gate Satisfied**: `npm run test:coverage` maintains or exceeds mandated thresholds (&ge;70% lines, &ge;80% functions, 100% security utils).

### 3. Security & Cryptographic Review
- [ ] **Input Sanitization**: All incoming payload fields are sanitized against XSS, DOM event injections (`onload=`, `onerror=`), and Prototype Pollution (`__proto__`, `constructor`, `prototype`).
- [ ] **Authentication & Token Safety**: JWT algorithm explicitly pinned to `HS256` with zero clock tolerance (`clockTolerance: 0`).
- [ ] **Granular Authorization (RBAC)**: All modifying API routes enforce event role checks (`requireEventRole`) and Direct Object Reference (IDOR) validations.
- [ ] **Zero Hardcoded Secrets**: No credentials or private tokens in source code or sample configs.
- [ ] **Dependency Audit**: `npm audit` / Dependabot shows 0 known high or critical vulnerabilities.

### 4. AI Guardrails & Safety Review (AI Changes)
- [ ] **Prompt Injection Defense**: All user inputs routed to LLM endpoints are filtered through the heuristic safety layer.
- [ ] **Graceful Heuristic Fallback**: Deterministic rule-based fallback executes reliably when AI API keys are absent or rate-limited.
- [ ] **Deterministic Financial Calculations**: All budget amounts, deficit resolutions, and sums are computed using integer base currency math.

### 5. UI/UX Accessibility Review (Frontend Changes)
- [ ] **Keyboard Navigability**: All modal dialogs, drawers, dropdowns, and buttons are operable with `Tab`, `Shift+Tab`, `Enter`, and `Escape`.
- [ ] **Focus Management**: Active focus trapping is enforced in modals and restored to triggering elements upon dismissal.
- [ ] **WCAG 2.1 AA Compliance**: Color contrast meets &ge; 4.5:1 ratio for text; non-text controls have accessible `aria-label` or `aria-labelledby` attributes.
- [ ] **Responsive Viewports**: Interfaces adapt cleanly across mobile (`375px`), tablet (`768px`), and desktop (`1440px`) breakpoints.

### 6. Documentation & Architecture
- [ ] **ADR Recording**: Any major design, dependency, or schema alteration is documented in an Architecture Decision Record (`docs/adr/`).
- [ ] **API Documentation**: New or updated endpoints are reflected in `README.md` and system architecture diagrams.
