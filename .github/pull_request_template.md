## 📌 Description
<!-- Provide a clear, concise summary of the changes and motivation behind this Pull Request. -->

Fixes / Relates to: #<!-- Issue Number -->

---

## 🔍 Type of Change
<!-- Select all that apply using [x] -->
- [ ] 🐛 **Bug fix** (non-breaking change fixing an issue)
- [ ] ✨ **New feature** (non-breaking change adding functionality)
- [ ] 🔒 **Security hardening** (vulnerability fix, dependency update, auth enhancement)
- [ ] ⚡ **Performance optimization** (latency, memory, bundle size reduction)
- [ ] 📝 **Documentation** (updates to docs, ADRs, or READMEs)
- [ ] ♻️ **Refactoring** (code structure improvement without behavior changes)
- [ ] 🧪 **Testing** (new or improved unit, integration, or e2e tests)

---

## 🧪 Verification & Testing Checklist
<!-- All items must be verified before merging into `main` or `update` -->
- [ ] Executed `npm run lint` with **0 errors and 0 warnings** (ESLint, Oxlint, strict TypeScript).
- [ ] Executed `npm run build` and confirmed both `client` and `server` compile cleanly.
- [ ] Executed `npm run test` with **100% test pass rate** (107+ automated tests).
- [ ] Executed `npm run test:coverage` and confirmed all coverage gates are satisfied.
- [ ] Executed `npm run verify` full monorepo pipeline passes end-to-end.

---

## 🛡️ Security & Privacy Checklist
- [ ] All new/modified endpoints implement appropriate authentication (`authMiddleware`) or role checks (`requireEventRole`).
- [ ] User inputs are strictly validated with Zod and sanitized (`sanitizeObject`/`sanitizeString`).
- [ ] No secrets, private keys, or credentials are hardcoded or committed.
- [ ] Passwords and cryptographic identifiers follow timing-safe practices.
- [ ] Sensitive actions emit structured audit log entries (`db.createAuditLog`).

---

## ♿ Accessibility Checklist (Frontend Changes Only)
- [ ] All interactive elements are fully keyboard navigable (Tab / Shift+Tab / Enter / Esc).
- [ ] Modals and drawers implement active focus traps and restoration.
- [ ] Color contrast meets or exceeds WCAG 2.1 AA standards (4.5:1 for normal text).
- [ ] Screen-reader labels (`aria-label`, `aria-expanded`, `aria-modal`) are present on all non-text controls.

---

## 📸 Screenshots or Evidence (if applicable)
<!-- Attach screenshots, terminal output, or recording if relevant -->
