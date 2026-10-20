# EventPilot Privacy Policy & Data Retention Standard

**Effective Date:** October 20, 2026  
**Compliance Standards:** GDPR (EU Regulation 2016/679), CCPA / CPRA, SOC 2 Type II Privacy Principles  

---

## 1. Information We Collect
EventPilot collects information strictly necessary to provide AI-powered event planning and budget optimization services:
- **Account Data:** User display name, email address, cryptographic password hashes (PBKDF2 with unique salts).
- **Event Planning Data:** Celebration titles, dates, geographical locations, guest counts, budgetary ceilings, cultural/dietary preferences, vendor quotation details.
- **AI Interaction Data:** Prompts submitted to the AI assistant, budget rescue acceptance/rejection decisions, suggestion quality ratings.
- **Technical & Observability Logs:** IP addresses, client user-agents, request correlation IDs (`x-request-id`), HTTP status codes, and execution durations.

---

## 2. Lawful Basis for Processing
We process personal data under the following lawful bases pursuant to GDPR Article 6:
- **Contractual Necessity (Art. 6(1)(b)):** Providing real-time budget calculations, vendor contract tracking, and automated milestone countdowns.
- **Explicit Consent (Art. 6(1)(a)):** In-app consent banner for processing cultural and dietary preferences.
- **Legitimate Interests (Art. 6(1)(f)):** Blocking prompt injection attacks, preventing abusive request spikes via rate limiting, and optimizing LLM token caching.

---

## 3. Data Subject Rights (GDPR & CCPA)
EventPilot guarantees your data sovereignty:
1. **Right of Access & Portability (GDPR Art. 15):** You can download a complete, machine-readable JSON archive of all your events, budget items, tasks, vendors, and audit logs at any time via `GET /api/privacy/export-data` or through the in-app Privacy Modal.
2. **Right to Erasure / "To Be Forgotten" (GDPR Art. 17):** Initiating an account deletion via `DELETE /api/privacy/delete-account` immediately and permanently purges all owned events, linked budget items, vendor records, collaborator associations, and personal audit trails from active storage.
3. **Right to Rectification (GDPR Art. 16):** All personal information and event records can be edited directly via authenticated REST endpoints.

---

## 4. AI Guardrails & Prompt Privacy
- **Zero Third-Party Training:** Prompts submitted to EventPilot are **never** used to train commercial public foundation models.
- **Inbound Sanitization:** Prompts are stripped of executable scripting tags, delimiter injection vectors, and control characters prior to model dispatch.
- **Deterministic Fallback:** Users without external LLM keys receive fully deterministic, rule-based algorithmic planning that executes entirely within local memory.

---

## 5. Security & Encryption
- **Data in Transit:** Enforced TLS 1.3 encryption across all client-to-server communications with HTTP Strict Transport Security (HSTS) headers.
- **Data at Rest:** Encrypted PostgreSQL storage with Row-Level Security (RLS) policies.
- **Authentication:** Statistically secure PBKDF2 password hashing with 100,000 iterations and per-user cryptographic salts.

---

## 6. Contact & Data Protection Officer
For privacy inquiries or compliance requests:
- **Data Protection Office:** `privacy@eventpilot.ai`
- **Security Team:** `security@eventpilot.ai`
