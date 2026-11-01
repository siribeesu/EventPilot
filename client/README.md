# 🌟 EventPilot Client — Frontend Web Application

> **Production-grade React 19 + TypeScript frontend application for EventPilot**, the GenAI-powered event planning, deterministic budget optimization, and collaborative financial management platform.

[![React 19](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-purple?style=flat-square)](../docs/ACCESSIBILITY_AUDIT.md)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint_Clean_(0_warnings)-success?style=flat-square)](../.oxlintrc.json)

---

## 🏛️ System Architecture

The EventPilot client is engineered following strict domain-driven boundaries and component-driven architecture:

```
client/
├── public/                # Static assets, vector icons, branded favicon
│   └── favicon.svg        # Branded vector squircle & compass emblem
├── src/
│   ├── components/        # Reusable presentation & composite domain modals
│   │   ├── ui/            # Atomic primitives (ErrorBoundary, Buttons, Badges)
│   │   ├── AIAssistantDrawer.tsx   # Context-aware conversational AI copilot
│   │   ├── AuditTrailModal.tsx     # SOC2 & GDPR forensic ledger viewer
│   │   ├── BudgetRescueModal.tsx   # Autonomous financial deficit recovery engine
│   │   ├── CollaboratorsModal.tsx  # RBAC management (Owner/Editor/Viewer)
│   │   ├── ConsentBanner.tsx       # Cookie & privacy compliance manager
│   │   ├── Footer.tsx              # Application footer & system status telemetry
│   │   ├── Navbar.tsx              # WCAG 2.1 AA accessible navigation with ARIA
│   │   ├── OnboardingChecklist.tsx # Interactive planner onboarding tour
│   │   ├── PrivacyDataModal.tsx    # GDPR Article 15 export & Article 17 erasure
│   │   └── SystemHealthPill.tsx    # Real-time latency, uptime, and memory badge
│   ├── hooks/             # Custom React lifecycle hooks
│   │   ├── useDebounce.ts          # Input rate-limiting & auto-save hook
│   │   └── useFocusTrap.ts         # WCAG 2.1 AA keyboard focus trap & Escape handling
│   ├── pages/             # View controllers & route containers
│   │   ├── DashboardPage.tsx       # Multi-event aggregation & financial summary
│   │   ├── EventDetailPage.tsx     # Master event control center (Budget, Tasks, Vendors)
│   │   ├── EventWizardPage.tsx     # Multi-step AI event generation wizard
│   │   └── LandingPage.tsx         # Product overview & feature showcase
│   ├── services/          # Data access layer & API integration
│   │   ├── api.ts                  # Typed REST client with Bearer auth & offline cache
│   │   └── pdfExport.ts            # Client-side executive PDF portfolio generator
│   ├── types/             # Domain TypeScript interfaces
│   │   └── index.ts                # Strict types for events, budgets, tasks, vendors
│   ├── utils/             # Pure utility helpers
│   │   ├── format.ts               # Currency, date, and math formatting helpers
│   │   └── logger.ts               # Production-safe logging (strips debug/info in prod)
│   ├── App.tsx            # Application root with client-side router & skip links
│   ├── index.css          # Tailwind CSS v4 design tokens & accessible focus rings
│   └── main.tsx           # Application DOM entry point
├── index.html             # HTML5 shell (lang="en", mobile viewport, SEO meta)
├── package.json           # Client workspace dependencies & npm scripts
├── tsconfig.json          # Solution root TypeScript configuration
├── tsconfig.app.json      # Strict compiler options (noImplicitAny, noUnusedLocals)
└── vite.config.ts         # Bundler configuration with chunk splitting
```

---

## ⚡ Core Capabilities & User Workflows

### 1. Deterministic Financial Engine
- Eliminates floating-point rounding errors by performing integer math calculations.
- Authoritatively computes:
  - Total Allocated vs. Total Budget
  - Category Breakdown Percentages (Venue, Catering, Decor, Entertainment, Photography)
  - Remaining Surplus or Deficit Balance
  - Actual Paid vs. Pending Invoices

### 2. Autonomous Budget Rescue Mode™
- Algorithmically detects when estimated or actual expenses exceed target budgets.
- Analyzes line items by priority and suggests surgical trade-offs with side-by-side savings calculations.
- Enforces strict human-in-the-loop consent: no items are modified without explicit user checkbox approval.

### 3. Contextual AI Assistant Drawer
- Slides in with keyboard-trapped navigation (`useFocusTrap`).
- Leverages full event context (guest count, budget, cultural preferences, milestone timeline) to answer queries.
- Proposes actionable plan changes that users can review, accept, or dismiss.

### 4. Client-Side Executive PDF Export
- Leverages `jspdf` and `jspdf-autotable` to generate multi-page financial portfolios directly in the browser.
- Generates clean executive tables, milestone timelines, vendor contact matrices, and compliance disclaimers without round-tripping to a backend server.

---

## ♿ Accessibility (WCAG 2.1 AA Compliance)

EventPilot is built from the ground up for full accessibility:

| Accessibility Feature | Implementation Detail | WCAG Guideline |
| :--- | :--- | :--- |
| **Skip Navigation** | Direct `#main-content` jump link on page load | WCAG 2.4.1 (Bypass Blocks) |
| **Keyboard Focus Trap** | Traps `Tab` and `Shift+Tab` cycles inside active dialogs | WCAG 2.1.2 (No Keyboard Trap) |
| **Escape Key Dismissal** | Universal dismissal on all drawers and modals | WCAG 2.1.1 (Keyboard Accessible) |
| **High Contrast Palette** | Slate/White on Dark (#0B0F19) exceeds 16:1 ratio | WCAG 1.4.3 (Contrast Minimum) |
| **Visible Focus Rings** | `focus-visible:ring-2 focus-visible:ring-indigo-500` | WCAG 2.4.7 (Focus Visible) |
| **Form Control Labels** | Explicit `htmlFor` / `id` associations on all inputs | WCAG 1.3.1 (Info and Relationships) |
| **ARIA Semantic Roles** | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` | WCAG 4.1.2 (Name, Role, Value) |

---

## ⌨️ Universal Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> | Global / Modal | Navigate through interactive elements in natural DOM order |
| <kbd>Esc</kbd> | Modals / Drawers | Close any active modal, dialog, or drawer |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Buttons / Checkboxes | Activate button or toggle selection state |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | Event Detail | Trigger executive PDF portfolio generation |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher

### Installation
From the repository root:
```bash
npm install
```

Or from within the `client/` workspace:
```bash
cd client
npm install
```

### Local Development Server
Start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`. API requests to `/api/*` are automatically proxied to the backend at `http://localhost:5000`.

---

## 🧪 Verification & Build Commands

```bash
# 1. Typecheck and strict linter check (Oxlint + TypeScript)
npm run lint

# 2. Production compilation & chunk-splitting verification
npm run build

# 3. Preview production build locally
npm run preview
```

### Optimized Production Chunks
Running `npm run build` generates split bundles in `client/dist/assets/`:
- `vendor-react`: Core React 19 runtime (~70 kB gzip)
- `vendor-charts`: Recharts data visualization engine (~104 kB gzip)
- `vendor-pdf`: jsPDF document generation engine (~139 kB gzip)
- `EventDetailPage`: Lazy-loaded master event workspace (~17 kB gzip)

---

## 🛡️ Code Quality Standards

- **Strict TypeScript**: `"strict": true`, `"noImplicitAny": true`, `"noImplicitReturns": true`, `"noUnusedLocals": true`.
- **Zero Raw Console Logs**: Non-error logs are automatically stripped in production via `client/src/utils/logger.ts`.
- **Zero `any` Types**: All API models, component props, and event handlers are strictly typed.
- **Zero Dependency Vulnerabilities**: Clean `npm audit` across the dependency tree.

---

## 📄 License

Proprietary — EventPilot Enterprise Platform. All rights reserved.
