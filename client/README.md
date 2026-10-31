# EventPilot Client — Frontend Web Application

> **Production-grade React 19 + TypeScript frontend for EventPilot**, the GenAI-powered event planning, budget optimization, and collaborative financial management platform.

---

## 🏛️ Architecture Overview

The EventPilot client is engineered with React 19, TypeScript (strict mode), and Tailwind CSS v4. It features a component-driven architecture with domain-driven separation between presentation, state, and services.

```
client/
├── public/                # Static assets, SVG icons, and favicon
├── src/
│   ├── components/        # Reusable presentation & composite components
│   │   ├── ui/            # Atomic primitives (Button, Card, Badge, Modal, Input)
│   │   ├── AIAssistantDrawer.tsx   # Contextual conversational copilot
│   │   ├── AuditTrailModal.tsx     # SOC2 & GDPR forensic ledger viewer
│   │   ├── BudgetRescueModal.tsx   # Autonomous financial deficit recovery
│   │   ├── CollaboratorsModal.tsx  # RBAC management (Owner/Editor/Viewer)
│   │   ├── ConsentBanner.tsx       # Cookie & privacy consent manager
│   │   ├── Footer.tsx              # Application footer & system status
│   │   ├── Navbar.tsx              # Accessible navigation with ARIA attributes
│   │   ├── OnboardingChecklist.tsx # Interactive planner onboarding
│   │   ├── PrivacyDataModal.tsx    # GDPR Article 15 export & erasure
│   │   └── SystemHealthPill.tsx    # Real-time telemetry & latency badge
│   ├── hooks/             # Custom React hooks
│   │   └── useFocusTrap.ts         # WCAG 2.1 AA keyboard focus trap
│   ├── pages/             # Route-level view controllers
│   │   ├── DashboardPage.tsx       # Multi-event aggregation & financial summary
│   │   ├── EventDetailPage.tsx     # Full event control center (Budget, Timeline, Vendors, Ideas)
│   │   ├── EventWizardPage.tsx     # Multi-step AI event wizard
│   │   └── LandingPage.tsx         # Product overview & feature showcase
│   ├── services/          # Data access layer & API integration
│   │   └── api.ts                  # Typed REST API client with Bearer auth & offline cache
│   ├── types/             # Domain TypeScript interfaces
│   │   └── index.ts                # Strict types for events, budgets, tasks, vendors
│   ├── utils/             # Pure utility helpers
│   │   ├── format.ts               # Currency, date, and math formatting helpers
│   │   └── logger.ts               # Production-safe logging (strips debug/info in prod)
│   ├── App.tsx            # Application root with client-side router
│   ├── index.css          # Tailwind CSS v4 theme & accessible focus ring styles
│   └── main.tsx           # Application DOM entry point
├── index.html             # Responsive HTML5 shell (WCAG lang="en" & viewport meta)
├── package.json           # Client dependencies & build scripts
├── tsconfig.json          # Root TypeScript configuration
├── tsconfig.app.json      # Strict compiler options (noUnusedLocals, noUnusedParameters)
└── vite.config.ts         # Vite bundler configuration with chunk splitting
```

---

## ⚡ Core Capabilities

- **Deterministic Financial Engine**: Computes exact totals, remaining balances, and category allocations with zero rounding errors.
- **Budget Rescue Mode™**: Algorithmic deficit resolution that suggests line-item reductions with user-approved trade-offs.
- **Interactive AI Copilot**: Context-aware AI assistant drawer that can propose and apply plan modifications in real time.
- **Executive PDF Export**: Generates professional multi-page client-ready PDF portfolios with itemized tables and summary charts.
- **Enterprise Accessibility (WCAG 2.1 AA)**:
  - Skip to main content link for screen-reader users
  - Strict keyboard focus trap on all dialogs and drawers (`useFocusTrap`)
  - Universal `Escape` key dismissal
  - Visible focus indicators (`focus-visible:ring-2 focus-visible:ring-indigo-500`)
  - Semantic HTML landmarks (`main`, `nav`, `header`, `footer`, `role="dialog"`)
- **Offline & Low-Bandwidth Resilience**: In-memory local storage cache ensures event data remains accessible during transient network interruptions.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher

### Installation

From the project root:

```bash
npm install
```

Or within the client directory:

```bash
cd client
npm install
```

### Development Server

Run the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Typecheck and compile the production bundle:

```bash
npm run build
```

Production artifacts are written to `client/dist/` with optimized chunk splitting:
- `vendor-react`: React 19 core runtime
- `vendor-charts`: Recharts data visualization
- `vendor-pdf`: jsPDF document generation engine

### Preview Production Build

Preview the compiled production build locally:

```bash
npm run preview
```

---

## 🛡️ Code Quality & Standards

The client adheres to zero-defect engineering standards:
- **Strict TypeScript**: `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`
- **Zero Raw Console Logs**: Non-error logs are automatically suppressed in production via `client/src/utils/logger.ts`.
- **Zero `any` Types**: All API models and component props are strictly typed.
- **Zero Dependency Vulnerabilities**: Clean `npm audit` across the dependency tree.

---

## 📄 License

Proprietary — EventPilot Enterprise Platform. All rights reserved.
