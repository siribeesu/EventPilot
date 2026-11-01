# 🛡️ EventPilot Security Policy

The EventPilot core team takes security, user privacy, and data protection with paramount seriousness. As an AI-powered financial planning platform, we uphold defense-in-depth principles across every layer of the application stack.

---

## 1. Supported Versions

Security patches and vulnerability hotfixes are actively maintained and backported for the following versions:

| Version | Status | Security Maintenance Window |
| :--- | :--- | :--- |
| **v1.x (Current)** | 🟢 Active Support | Full proactive patches and automated CVE scanning |
| **v0.9.x** | 🟡 Limited Support | Critical security hotfixes only |
| **< v0.9** | 🔴 End-of-Life | Unsupported; immediate upgrade recommended |

---

## 2. Reporting a Vulnerability

We believe in responsible, coordinated disclosure. If you discover an actionable security vulnerability or privacy risk in EventPilot, **please do not open a public GitHub issue.**

### Reporting Procedure

1. **Email us directly**: Send an email to **[security@eventpilot.ai](mailto:security@eventpilot.ai)** or submit a private security advisory via [GitHub Security Advisories](https://github.com/siribeesu/EventPilot/security/advisories/new).
2. **Provide Vulnerability Details**:
   - **Type of issue**: (e.g., Auth bypass, Prompt Injection, XSS, Prototype Pollution, Privilege Escalation).
   - **Affected component**: (client, server endpoint, database adapter, or AI engine).
   - **Reproducible steps**: Detailed step-by-step instructions or minimal Proof of Concept (PoC).
   - **Impact assessment**: Potential scope of confidentiality, integrity, or availability compromise.

### Response Time & SLAs

| Milestone | Target SLA | Description |
| :--- | :--- | :--- |
| **Initial Acknowledgment** | &le; 24 Hours | Confirmation of receipt by lead maintainer |
| **Triage & Reproduction** | &le; 48 Hours | Assessment of exploitability, severity, and blast radius |
| **Remediation & Patch** | &le; 5 Business Days | Verified fix staged on private patch branch |
| **Public Release & Advisory**| &le; 7 Business Days | Deployment to production, GitHub advisory release, and reporter credit |

---

## 3. Defense-in-Depth Architecture

EventPilot implements multi-tiered enterprise defenses across every layer:

### A. Authentication & Session Management
- **Strict JWT Algorithm Pinning**: Both signing and verification are explicitly pinned to `HS256` (`algorithms: ['HS256']`), completely immunizing the system from algorithm confusion attacks (such as `alg: "none"` or RS256 confusion exploits).
- **Zero-Tolerance Clock Drift**: Verification requires zero clock tolerance (`clockTolerance: 0`) to enforce exact expiration windows.
- **Constant-Time Password Hashing**: Passwords are hashed using PBKDF2 with unique cryptographic salts (`crypto.pbkdf2Sync` with 10,000 iterations of SHA-512) and verified using constant-time comparison (`crypto.timingSafeEqual`) to eliminate timing attacks.

### B. Input Sanitization & Anti-Injection
- **Prototype Pollution Defense**: The recursive JSON sanitizer explicitly strips `__proto__`, `constructor`, and `prototype` keys and utilizes null-prototype storage during cloning.
- **Zero DOM XSS Policy**: Global middleware strips HTML tags (`<script>`, `<iframe>`, `<b>`), inline event handler attributes (`onload=`, `onerror=`, `onclick=`), and pseudo-protocols (`javascript:`, `data:`, `vbscript:`).
- **UUID & SQL Injection Boundaries**: All route identifier parameters are strictly validated via hardened alphanumeric regular expressions (`isValidUUID`), blocking directory traversal probes (`../`), null bytes (`\0`), and SQL injection tokens.

### C. Prompt Injection & AI Guardrails
- **Dual-Layer Guardrail Architecture**: Every user prompt routed to the AI planner or copilot drawer is filtered against heuristic injection attack vectors (jailbreak bypasses, persona resets, instruction overrides).
- **Schema-Enforced Outputs**: AI responses are bounded by deterministic TypeScript validation before ingestion into application state.

### D. Granular RBAC & Data Ownership
- **Role Hierarchy**: Strict role enforcement (`Owner` > `Editor` > `Viewer`) verifies authorization on every mutating API endpoint.
- **Resource Ownership Guards**: Direct Object Reference (IDOR) checks verify that foreign users cannot view or manipulate budget items, tasks, or vendor entries belonging to events they do not have explicit access to.

### E. Network & HTTP Hardening
- **Helmet HTTP Security**: Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS with `preload` and `includeSubDomains`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy`.
- **Tiered Rate Limiting**: Dedicated rate limiting gates for authentication attempts (`authLimiter`), AI generation requests (`aiRateLimiter`), and standard API traffic (`standardLimiter`).
- **Strict CORS Origin Whitelisting**: CORS enforces verified origin checking, strictly blocking malicious external origins while preserving localhost development and verified Vercel production domains.

---

## 4. Secret Management & Environment Security

1. **Zero Secret Ingestion in VCS**:
   - Secrets (`JWT_SECRET`, `DATABASE_URL`, `GEMINI_API_KEY`) must **never** be checked into version control.
   - `.env.example` provides non-sensitive template configurations only.
   - CI/CD workflows utilize encrypted GitHub Actions Secrets.
2. **Production Secret Requirements**:
   - `JWT_SECRET` must be a cryptographically random string of at least 32 characters in production. If `NODE_ENV=production` is detected without an explicit `JWT_SECRET`, the server throws a fatal startup exception to prevent running with insecure defaults.
3. **Database Security**:
   - Production PostgreSQL connections enforce SSL mode (`ssl: { rejectUnauthorized: true }`).

---

## 5. Vulnerability Bounty & Recognition

We appreciate and credit ethical security researchers who responsibly report vulnerabilities according to this policy in our release notes and GitHub Security Advisories.
