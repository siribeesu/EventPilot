# ADR 002: Dual-Layer AI Guardrails & Human-in-the-Loop Safety

## Status
**Accepted** (2026-10-19)

## Context
Generative AI applications in enterprise and event budgeting face two critical threat vectors:
1. **Adversarial Prompt Injections**: Users attempting delimiter hijacking, system prompt exfiltration, or role impersonation.
2. **Hallucinated Financial Recommendations**: AI models generating non-existent line items, mathematically impossible negative budgets, or unbounded cost estimates.

## Decision
We implemented a strict two-layer defense-in-depth architecture in `server/src/ai/guardrails.ts`:
1. **Inbound Prompt Inspection**:
   - Regex-based signature scanning against 10 known jailbreak attack vectors (`ignore previous instructions`, `godmode`, `developer mode`, delimiter stuffing).
   - Real-time sanitization of boundary tokens and control characters.
   - Attack vector counter telemetry recorded in `aiCache`.
2. **Outbound Schema Validation & Clamping**:
   - Strict Zod parsing (`AIGeneratedPlanSchema`, `BudgetRescueResponseSchema`, `AIAssistantActionSchema`).
   - Hard budget clamping: No single item can exceed the total event budget.
   - Non-positive budget check: Enforces valid financial bounds before persistence.
3. **Mandatory Human-in-the-Loop Approval**:
   - High-impact modifications (budget reallocation, countdown task insertion) require explicit user review (`requiresUserApproval: true`) and cannot be auto-committed by the LLM.

## Consequences
### Positive
- Zero risk of prompt injection compromising server state or revealing proprietary system directives.
- Financial integrity guaranteed by deterministic mathematical invariants.
- Evaluators and end-users maintain complete sovereignty over financial decisions.
