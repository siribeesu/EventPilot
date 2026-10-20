# EventPilot — GenAI-Powered Event Planning Assistant

**EventPilot** is a complete, modern, production-grade web application designed to help users plan **weddings, birthdays, anniversaries, college fests, and community gatherings** using Generative AI.

---

## 🌟 Key Features

1. **AI Event Master Planner**:
   - Generates itemized budgets, milestones adapted to remaining countdown days, actionable task checklists, and vendor quotation baselines.
   - Tailors themes, gourmet banquet menus, decor styling, and entertainment concepts to cultural, dietary, and headcount requirements.

2. **Signature Feature: Budget Rescue Mode™**:
   - When budgets drop (e.g., from ₹50,000 to ₹35,000), EventPilot recalculates target ceilings without violating user priorities.
   - Side-by-side comparison displays original vs proposed costs, exact savings, and tradeoff rationales.
   - Individual checkboxes let the user accept or reject each proposed saving with live shortfall recalculation.
   - Explicit user approval required before plan overwrites.

3. **Interactive AI Copilot (Assistant)**:
   - Understands current event plan context (budget items, remaining tasks, guest count).
   - Responds to conversational adjustments (e.g. *"Reduce my budget to ₹35,000"*, *"Make it more traditional"*, *"Suggest a vegetarian banquet for 120 guests"*, *"7 days left, what should I prioritize?"*).
   - Generates structured diffs with an interactive "Approve & Apply" button.

4. **Multi-Currency & Regionalization**:
   - Default currency is **INR (₹)** with seamless switching between USD ($), EUR (€), GBP (£), and AED.

5. **Itemized Budget Manager**:
   - Category breakdowns: Venue, Catering, Decoration, Photography, Entertainment, Invitations, Transport, and Miscellaneous.
   - Interactive charts (Recharts) visualizing expenditure distribution.
   - Real-time overspending alerts.

6. **Preparation Timeline & Task Tracker**:
   - Adaptive milestone scheduling based on event date.
   - Priority badges (Urgent, High, Medium, Low), status tracking (Pending, In Progress, Completed), and overdue flags.

7. **Vendor Management & Quotation Compare**:
   - Compare manual contractor quotes vs AI estimates.
   - Track booking status and payment stages.

8. **Executive PDF Export**:
   - Download complete printable event portfolio with itemized budget breakdown, timeline checklist, and vendor sheets using `jspdf` and `jspdf-autotable`.

---

## 🏗️ Project Architecture & Structure

```
event-planner/
├── client/                     # Frontend: React 19, TypeScript, Vite, Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, BudgetRescueModal, AIAssistantDrawer
│   │   ├── pages/              # LandingPage, DashboardPage, EventWizardPage, EventDetailPage
│   │   ├── services/           # api.ts (REST client), pdfExport.ts (PDF generator)
│   │   ├── types/              # Domain TypeScript types & interfaces
│   │   ├── App.tsx             # Root application orchestrator
│   │   └── main.tsx            # Entry point
│   ├── vite.config.ts          # Proxy configuration to :5000
│   └── package.json
│
├── server/                     # Backend: Node.js, Express, TypeScript, Zod, pg
│   ├── src/
│   │   ├── ai/                 # planner.ts (AI engine, fallback generator, rescue engine)
│   │   ├── database/           # db.ts (PostgreSQL & persistent JSON store), schema.sql
│   │   ├── middleware/         # auth.ts (JWT & demo authentication)
│   │   ├── routes/             # auth.ts, events.ts, budget.ts, tasks.ts, vendors.ts
│   │   ├── schemas/            # Zod validation schemas for all requests/AI plans
│   │   ├── types/              # Backend TypeScript types
│   │   └── index.ts            # Server entry point
│   ├── vitest.config.ts        # Vitest configuration
│   └── package.json
│
├── package.json                # Root workspace scripts
├── .env.example                # Example environment variables
└── README.md                   # Documentation
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js >= 18 (Tested on Node.js v24)
- npm >= 9

### 1. Install Dependencies
Run in the root directory:
```bash
# Install root, client, and server dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

### 3. Database Setup
EventPilot is designed with dual-mode storage:
- **Zero-Config Persistent Mode**: If `DATABASE_URL` is omitted, data is persistently stored in `server/data/database.json`.
- **PostgreSQL / Supabase Mode**: Set `DATABASE_URL=postgresql://...`. EventPilot automatically applies `server/src/database/schema.sql` on startup with full indexes and tables.

### 4. Run the Application
In separate terminal sessions or concurrently:
```bash
# Terminal 1: Start backend server (Port 5000)
npm run dev:server

# Terminal 2: Start frontend client (Port 5173)
npm run dev:client
```
Visit: **http://localhost:5173**

---

## 🧪 Testing and Quality Assurance

Execute the unit and integration test suite:
```bash
npm run test
```

### Test Coverage Summary:
- `src/tests/budget_and_planner.test.ts`:
  - ✅ Generates valid, balanced deterministic event plan matching budget target
  - ✅ Runs Budget Rescue Mode reducing budget from ₹50,000 to ₹35,000 with prioritized preservation
  - ✅ Handles surplus detection in Budget Rescue
- `src/tests/api_integration.test.ts`:
  - ✅ Creates an event and persists it in storage
  - ✅ Retrieves full event with calculated financial metrics
  - ✅ Executes Budget Rescue Mode when reducing budget to ₹40,000 and applies accepted proposals
  - ✅ Processes AI Assistant conversational commands with human-in-the-loop approval workflow
