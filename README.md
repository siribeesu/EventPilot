# EventPilot — GenAI-Powered Event Planning & Financial Optimization Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%20%7C%20v24-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Tests Passing](https://img.shields.io/badge/Vitest-18%20Passed-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%20AA-purple?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **EventPilot** is an enterprise-grade, full-stack Generative AI application designed to eliminate planning chaos and budget overruns for **weddings, milestone birthdays, anniversaries, college festivals, and community galas**. Built with a deterministic financial engine, real-time AI assistant copilot, and autonomous **Budget Rescue Mode™**.

---

## 📑 Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. System Architecture](#2-system-architecture)
- [3. Core Features](#3-core-features)
  - [A. Autonomous Budget Rescue Mode™ (Signature Feature)](#a-autonomous-budget-rescue-mode-signature-feature)
  - [B. Interactive AI Copilot (Contextual Assistant)](#b-interactive-ai-copilot-contextual-assistant)
  - [C. AI Master Event Generation Engine](#c-ai-master-event-generation-engine)
  - [D. Itemized Budget Manager & Financial Ledger](#d-itemized-budget-manager--financial-ledger)
  - [E. Adaptive Countdown Timeline & Task Engine](#e-adaptive-countdown-timeline--task-engine)
  - [F. Transparent Vendor Procurement Matrix](#f-transparent-vendor-procurement-matrix)
  - [G. Creative Themes & Gourmet Menu Generator](#g-creative-themes--gourmet-menu-generator)
  - [H. Executive PDF Portfolio Generator](#h-executive-pdf-portfolio-generator)
- [4. Software Engineering & Judging Parameters](#4-software-engineering--judging-parameters)
  - [I. Code Quality & Modularity](#i-code-quality--modularity)
  - [II. Enterprise Security Layer](#ii-enterprise-security-layer)
  - [III. Performance & Efficiency](#iii-performance--efficiency)
  - [IV. Automated Testing Suite](#iv-automated-testing-suite)
  - [V. Accessibility & WCAG AA Compliance](#v-accessibility--wcag-aa-compliance)
- [5. UI/UX Design System](#5-uiux-design-system)
- [6. Technology Stack](#6-technology-stack)
- [7. Dual-Storage Engine & Database Schema](#7-dual-storage-engine--database-schema)
- [8. REST API Reference](#8-rest-api-reference)
- [9. Environment Variables](#9-environment-variables)
- [10. Local Development Setup](#10-local-development-setup)
- [11. Vercel Deployment Guide](#11-vercel-deployment-guide)

---

## 1. Executive Summary

Traditional event planning is notoriously fragmented: coordinators juggle unformatted spreadsheets, disjointed chat threads, unpredictable vendor quotes, and sudden budget shortfalls.

**EventPilot** bridges the gap between creative celebration design and strict financial discipline:
1. **Never Overwrites Without Consent**: Every AI adjustment is presented as a side-by-side trade-off with individual approval checkboxes.
2. **Zero Hallucinated Contacts**: The platform provides realistic market estimates without ever fabricating live contractor contact numbers or false availability claims.
3. **Deterministic Financial Accuracy**: While LLMs generate creative ideas, all financial sums, category percentages, remaining surpluses, and deficit alerts are computed authoritatively in backend application logic.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend: React 19 + TypeScript + Vite"]
        UI[SaaS Interface / Plus Jakarta Sans]
        State[Client State & Custom Hooks]
        Charts[Recharts Data Visualization]
        PDF[jsPDF Client Portfolio Engine]
    end

    subgraph Gateway ["Vercel Edge & Serverless / Express REST API"]
        Sec[Helmet CSP & Security Headers]
        Rate[Tiered Rate Limiters: Auth / General / AI]
        CORS[Dynamic CORS: localhost + *.vercel.app]
        San[Recursive XSS Sanitizer]
        Auth[JWT Session & Ownership Guards]
        Comp[Gzip / Deflate Compression]
        Cache[In-Memory TTL Cache]
    end

    subgraph CoreEngine ["Domain Business Logic"]
        Router[REST Route Controllers]
        Rescue[Budget Rescue Mode Engine]
        Copilot[AI Assistant Context Synthesizer]
        ZodVal[Zod Strict Runtime Validators]
    end

    subgraph AIService ["Generative AI Layer"]
        Gemini[Google Gemini 2.0 / 1.5 Flash]
        OpenAI[OpenAI Fallback]
        Rules[Intelligent Deterministic Rules Engine]
    end

    subgraph DataLayer ["Dual Storage Engine"]
        PG[(PostgreSQL / Supabase + SSL Pooler)]
        JSONFile[(Persistent JSON Store /tmp Fail-Proof)]
    end

    Client -->|HTTPS / REST| Gateway
    Gateway --> CoreEngine
    CoreEngine -->|Prompt + Zod Schema| AIService
    CoreEngine -->|Queries & Transactions| DataLayer
```

---

## 3. Core Features

### A. Autonomous Budget Rescue Mode™ (Signature Feature)

Budget Rescue Mode™ is EventPilot's primary financial protection feature.

* **Scenario**: A user initially creates an event budgeted at ₹50,000. Mid-way through planning, financial limits contract to ₹35,000.
* **Autonomous Intelligence**:
  1. Recalculates the new available financial limit.
  2. Identifies non-essential line items that exceed the new ceiling.
  3. Consults the event's explicitly declared **Priority Areas** (e.g. Catering, Venue).
  4. Generates lower-cost alternative proposals (e.g. swapping imported stage flowers for local marigolds) while strictly shielding core priority dining and venue bookings.
  5. Renders a side-by-side comparison matrix showing:
     * Original Cost
     * Proposed Cost
     * Net Savings
     * Trade-Off Rationale
  6. **Human-in-the-Loop Consent**: Each proposal features an individual checkbox. The user can accept or reject each change independently, with live shortfall recalculation before applying.

---

### B. Interactive AI Copilot (Contextual Assistant)

A persistent slide-over drawer accessible directly from the event management studio:
* **Context Awareness**: Ingests current event title, guest headcount, total budget, category expenses, pending tasks, and booked vendors.
* **Conversational Modifications**: Responds to real natural-language instructions:
  * *"Reduce my overall budget to ₹35,000 without cutting food quality."*
  * *"Suggest a traditional South Indian vegetarian menu for 120 guests."*
  * *"The celebration is in 7 days. What urgent deadlines should I prioritize?"*
  * *"Replace expensive stage lighting with ambient floral candle arrangements."*
* **Structured Diffs & Approval**: The copilot responds with explanations and concrete action diffs. A single click on **"Approve & Apply Changes"** commits the revision to the database.

---

### C. AI Master Event Generation Engine

When creating a new event, EventPilot ingests comprehensive celebration parameters:
* Event Title, Event Type (Wedding, Birthday, Anniversary, College Fest, Community)
* Event Date, Start Time, and End Time
* Geographic Location & Setting (Indoor Hall, Outdoor Lawn, Hybrid Both)
* Target Budget & Preferred Currency (INR ₹, USD $, EUR €, GBP £, AED)
* Expected Guest Headcount
* Theme Preferences & Aesthetic Style
* Cultural / Regional Customs
* Dietary Requirements & Live Counter Preferences
* Selected Priority Safeguards (Venue, Catering, Decor, Photography, Entertainment)

**AI Prompt Engineering & Zod Validation**:
Every LLM response is requested under a strict JSON schema and validated at runtime with Zod. If the LLM produces missing fields or malformed calculations, EventPilot safely falls back to its deterministic domain rules engine.

---

### D. Itemized Budget Manager & Financial Ledger

* **Category Breakdown**: Venue & Ambiance, Food & Gourmet Catering, Bespoke Stage Decor, Photography & Video, DJ & Entertainment, Invitations & Stationery, Logistics & Transport, and Contingency.
* **Recharts Visualization**: Interactive bar charts and distribution graphs.
* **Deterministic Calculations**: Categorical totals, remaining buffer balances, and overspending deficits are computed in application code rather than estimated by the LLM.
* **Overspending Alerts**: Real-time warning banners appear when planned expenses exceed the allocated budget, offering a direct 1-click trigger to launch Budget Rescue Mode™.

---

### E. Adaptive Countdown Timeline & Task Engine

* **Dynamic Scheduling**: Automatically schedules tasks relative to the event date (`T-30 Days`, `T-14 Days`, `T-3 Days`, `T-Day`).
* **Priority Flags**: Urgent (Red), High (Amber), Medium (Blue), Low (Slate).
* **Interactive Completion**: Toggle tasks between Pending, In Progress, and Completed with strikethrough states and live progress tracking.

---

### F. Transparent Vendor Procurement Matrix

* **Contractor Directory**: Add vendor names, contractor contact persons, phone numbers, quotes, booking statuses, and payment milestones.
* **Benchmark vs Manual Quotes**: Clearly distinguishes between AI estimated market baselines and verified manual contractor quotes.
* **Ethical AI Policy**: Never invents false availability or fake contact numbers.

---

### G. Creative Themes & Gourmet Menu Generator

* **Curated Themes**: Generates custom aesthetic themes with color schemes, decor descriptions, and estimated costs.
* **Dietary-Compliant Menus**: Recommends multi-course appetizers, main courses, live counters, and desserts tailored to cultural customs and dietary restrictions (Pure Vegetarian, Jain, Halal, etc.).
* **Guest Activities**: Suggests interactive games, DJ playlists, and ceremonial timelines.

---

### H. Executive PDF Portfolio Generator

Built directly with `jspdf` and `jspdf-autotable` for instant client-side generation:
* **Header & Executive Summary**: Celebration details, guest count, and AI executive strategy.
* **Itemized Budget Breakdown Table**: Formatted financial ledger with category totals.
* **Timeline Milestone Checklist**: Chronologically ordered tasks with priority indicators and due dates.
* **Vendor Directory**: Complete quotation sheet with contractor contacts and booking statuses.
* **Print-Ready Layout**: Professional typography and margin styling optimized for standard A4 printing.

---

## 4. Software Engineering & Judging Parameters

### I. Code Quality & Modularity

* **Clean Architecture**: Strict separation of concerns between Controllers (`server/src/routes`), Services (`server/src/ai`, `server/src/utils`), Middleware (`server/src/middleware`), and Storage Models (`server/src/database`).
* **TypeScript Strict Mode**: Fully typed frontend and backend with zero unvalidated `any` usage in core domain logic.
* **Zod Runtime Validation**: All incoming requests (creation, updates, budget modifications) and outgoing AI outputs are validated against strict Zod schemas (`server/src/schemas/index.ts`).

---

### II. Enterprise Security Layer

EventPilot implements enterprise-grade defensive security:
1. **Helmet CSP**: Strict Content Security Policy allowing only verified scripts, styles, data URIs, and HTTPS endpoints.
2. **Dynamic CORS Security**: Restricts access to trusted origins. In production, automatically verifies and trusts all Vercel deployment URLs (`*.vercel.app`) and configured `CORS_ORIGIN` domains.
3. **Permissions-Policy**: Disables device-level camera, microphone, geolocation, and payment access headers.
4. **Recursive XSS Input Sanitization**: Sanitizes incoming string payloads by stripping executable tags, script injections, and dangerous control characters (`server/src/utils/sanitize.ts`).
5. **Tiered Rate Limiting**:
   * `standardLimiter`: 120 requests / 15 minutes for general endpoints.
   * `authLimiter`: 10 attempts / 15 minutes to prevent brute-force attacks on login/registration.
   * `aiRateLimiter`: 20 requests / 15 minutes to safeguard LLM tokens against abuse.
6. **Resource Ownership Guards**: Validates that users can only read, modify, or delete events belonging to their account (`server/src/middleware/auth.ts`).
7. **Cryptographic Password Hashing**: PBKDF2 hashing with random salt and 100,000 iterations (`server/src/utils/security.ts`).

---

### III. Performance & Efficiency

1. **Payload Compression**: High-efficiency Gzip and Deflate compression middleware (`compression`) with a 1 KB threshold.
2. **In-Memory TTL Caching**: High-speed memory cache (`server/src/utils/cache.ts`) with a 60-second TTL for frequent event queries, automatically invalidated on write/delete operations.
3. **Optimized Bundle Splitting**: Vite bundle configured with clean chunking for React, Recharts, and PDF generation libraries.
4. **Debounced Search Filtering**: Custom `useDebounce` hook prevents unnecessary re-renders while typing in the dashboard.
5. **Route-Level Code Splitting**: All major pages (`LandingPage`, `DashboardPage`, `EventWizardPage`, `EventDetailPage`) are lazy-loaded using React `Suspense`.

---

### IV. Automated Testing Suite

EventPilot includes a comprehensive Vitest test suite with **18 passing tests** across 4 test suites:

```bash
npm run test
```

| Test Suite | Tests | Scope |
| :--- | :---: | :--- |
| `src/tests/efficiency_and_validation.test.ts` | 5 | In-memory TTL caching, cache invalidation on mutations, Zod schema validation rejections, input sanitization |
| `src/tests/budget_and_planner.test.ts` | 3 | Deterministic budget allocation formulas, Budget Rescue Mode reductions, surplus detection |
| `src/tests/security_and_auth.test.ts` | 6 | PBKDF2 password hashing, salt uniqueness, JWT authentication, user registration/login, resource ownership isolation |
| `src/tests/api_integration.test.ts` | 4 | Event CRUD lifecycle, calculated metrics verification, Budget Rescue proposal application, AI Copilot approval workflow |

---

### V. Accessibility & WCAG AA Compliance

* **Skip Navigation**: Keyboard skip link (`#main-content`) allows screen reader and keyboard users to bypass navigation.
* **Modal Focus Trapping**: Custom `useFocusTrap` hook traps Tab focus inside active dialogs (`BudgetRescueModal`, `AIAssistantDrawer`) and restores focus upon closing.
* **Keyboard Navigation**: All dialogs close on the `Escape` key; custom controls activate with `Enter` and `Space`.
* **Semantic ARIA Landmarks**:
  * `role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`
  * `role="dialog"` with `aria-modal="true"` and `aria-labelledby`
  * `role="progressbar"` with live `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`
  * `role="tablist"`, `role="tab"`, and `role="tabpanel"` for all tabbed views
  * `role="status"` and `role="alert"` with `aria-live="polite"` for dynamic content updates
* **Color Contrast**: All typography adheres to WCAG AA contrast standards (> 4.5:1 ratio).

---

## 5. UI/UX Design System

* **Typography**: Geometric sans-serif **Plus Jakarta Sans** with refined tracking (`-0.011em`).
* **Color Palette**:
  * Neutral Base: Refined pearl/slate (`#fafbfd` to `#ffffff`)
  * Primary Accent: Royal Indigo (`#4338ca` to `#6366f1`)
  * Secondary Luminescence: Soft Violet (`#8b5cf6`)
  * Status Accents: Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`)
* **Layout Grid**: Consistent 1280px (`max-w-7xl`) container across all pages (Navbar, Dashboard, Wizard, Event Studio, and Footer).
* **Responsive Breakpoints**: Optimized for Mobile (360px+), Tablet (768px+), Laptop (1024px+), and Desktop (1440px+).

---

## 6. Technology Stack

### Frontend
* **Core Framework**: React 19, TypeScript
* **Build Tooling**: Vite 8 / Vite 6 (Cross-platform)
* **Styling**: Tailwind CSS v4
* **Icons**: Lucide React
* **Data Visualization**: Recharts
* **PDF Export Engine**: jsPDF, jsPDF-AutoTable
* **HTTP Client**: Native Fetch with typed REST service

### Backend
* **Runtime**: Node.js (v20+ / v24 LTS), Express 4
* **Language**: TypeScript (ES Modules, NodeNext)
* **Validation**: Zod
* **Security**: Helmet, CORS, Express-Rate-Limit, Crypto PBKDF2, JSONWebToken
* **Efficiency**: Compression (gzip/deflate), In-Memory TTL Cache

### Database & Storage
* **Production Database**: PostgreSQL (Supabase / Neon / Railway / AWS RDS) with automated schema migrations and SSL support
* **Local/Serverless Fallback**: High-performance persistent JSON storage (`server/data/database.json`) with safe `/tmp` fail-proof fallback

### Generative AI
* **Primary Provider**: Google Gemini 2.0 / 1.5 Flash (`@google/genai`)
* **Secondary Provider**: OpenAI GPT API fallback
* **Offline/Demo Provider**: Deterministic Rules Engine with zero external dependencies

---

## 7. Dual-Storage Engine & Database Schema

EventPilot operates with zero-configuration dual-mode storage:
1. **Zero-Config Mode**: If `DATABASE_URL` is omitted, data persists in `database.json`.
2. **PostgreSQL / Supabase Mode**: If `DATABASE_URL` is provided, EventPilot automatically initializes tables, constraints, and indexes using [`server/src/database/schema.sql`](file:///c:/Users/Hii/Documents/event-planner/server/src/database/schema.sql).

### Relational Entity-Relationship Overview

```
 ┌──────────────┐       1:N       ┌──────────────┐
 │    users     │────────────────<│    events    │
 └──────────────┘                 └──────┬───────┘
                                         │
        ┌──────────────────┬─────────────┼──────────────────┬──────────────────┐
        │ 1:N              │ 1:N         │ 1:N              │ 1:N              │ 1:N
        ▼                  ▼             ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ budget_items │   │    tasks     ││   vendors    │   │ event_ideas  │   │plan_revisions│
└──────────────┘   └──────────────┘└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 8. REST API Reference

| Method | Endpoint | Description | Auth Required? |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Health status, database type, AI engine status | No |
| `POST` | `/api/auth/register` | Register a new planner account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/events` | List all events owned by current user | Yes (or Demo) |
| `GET` | `/api/events/:id` | Get full event detail with calculated metrics | Yes (or Demo) |
| `POST` | `/api/events` | Create a new event plan | Yes (or Demo) |
| `PATCH` | `/api/events/:id` | Update event parameters | Yes (or Demo) |
| `DELETE` | `/api/events/:id` | Delete an event and related records | Yes (or Demo) |
| `POST` | `/api/events/:id/generate-plan` | Re-synthesize complete AI plan | Yes (or Demo) |
| `POST` | `/api/events/:id/budget-rescue/preview` | Generate Budget Rescue trade-off proposals | Yes (or Demo) |
| `POST` | `/api/events/:id/budget-rescue/apply` | Apply accepted trade-off proposals | Yes (or Demo) |
| `POST` | `/api/events/:id/assistant` | Conversational AI Copilot instruction | Yes (or Demo) |
| `POST` | `/api/events/:id/budget-items` | Add budget line item | Yes (or Demo) |
| `PATCH` | `/api/budget-items/:id` | Update budget line item | Yes (or Demo) |
| `DELETE` | `/api/budget-items/:id` | Delete budget line item | Yes (or Demo) |
| `POST` | `/api/events/:id/tasks` | Add timeline task | Yes (or Demo) |
| `PATCH` | `/api/tasks/:id` | Update task status or due date | Yes (or Demo) |
| `DELETE` | `/api/tasks/:id` | Delete task | Yes (or Demo) |
| `POST` | `/api/events/:id/vendors` | Add vendor quotation record | Yes (or Demo) |
| `PATCH` | `/api/vendors/:id` | Update vendor quote or booking status | Yes (or Demo) |
| `DELETE` | `/api/vendors/:id` | Delete vendor record | Yes (or Demo) |

---

## 9. Environment Variables

Configure these in `server/.env` (local) or in your **Vercel Project Settings**:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) | *Optional* (falls back to deterministic engine) |
| `OPENAI_API_KEY` | OpenAI API key fallback | *Optional* |
| `DATABASE_URL` | PostgreSQL / Supabase connection URI | *Optional* (e.g. `postgresql://postgres:...@...supabase.com:6543/postgres`) |
| `JWT_SECRET` | Secret key for JWT session tokens | `eventpilot_prod_secure_secret_jwt_key_2026` |
| `CORS_ORIGIN` | Allowed cross-origin domains | *Optional* (all `*.vercel.app` URLs trusted automatically) |
| `PORT` | Standalone server port | `5000` |

---

## 10. Local Development Setup

### Prerequisites
- Node.js >= 18 or v24 LTS
- npm >= 9

### 1. Clone & Install
```bash
git clone https://github.com/siribeesu/EventPilot.git
cd EventPilot

# Install root workspaces (client + server dependencies linked automatically)
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example server/.env
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend Express API Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Vite React Client (Port 5173)
npm run dev:client
```
Visit: **http://localhost:5173**

### 4. Build & Test
```bash
# Run 18 Vitest unit and integration tests
npm run test

# Compile client & server production bundles
npm run build
```

---

## 11. Vercel Deployment Guide

EventPilot is pre-configured for **single-project zero-config deployment** on Vercel:
* **Frontend**: Served from Vercel's global CDN via `client/dist`.
* **Backend API**: Executes as Vercel Serverless Functions via `/api/*`.

### Step-by-Step Deployment:

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository (branch `update` or `main`).

2. **Import into Vercel**:
   - Log into [vercel.com](https://vercel.com).
   - Click **Add New...** → **Project**.
   - Select your repository: **`siribeesu/EventPilot`**.

3. **Verify Settings (Auto-Detected)**:
   Vercel reads [`vercel.json`](file:///c:/Users/Hii/Documents/event-planner/vercel.json) automatically:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`

4. **Add Environment Variables (Optional)**:
   Under **Environment Variables**, you may optionally add `GEMINI_API_KEY` or `DATABASE_URL`.
   *(If left empty, EventPilot automatically runs with its built-in deterministic rules engine and pre-seeded database!)*

5. **Deploy**:
   Click **Deploy**. Your full-stack EventPilot application is live in ~60 seconds!

---

## 📄 License

This project is licensed under the MIT License. Built with ❤️ for seamless, stress-free celebration planning.
