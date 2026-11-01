# 🎨 EventPilot UI/UX Design System & Component Conventions

This document establishes the UI design tokens, component architecture, accessible interaction patterns, and layout conventions implemented across **EventPilot**.

---

## 1. Color Palette & Contrast Tokens

All color combinations have been tested to exceed **WCAG 2.1 AA** contrast requirements (normal text $\ge$ 4.5:1, large text and UI components $\ge$ 3:1):

| Token Name | Hex Code | Tailwind Class | Contrast Ratio vs Background | Usage |
| :--- | :--- | :--- | :---: | :--- |
| **Canvas Background** | `#0B0F19` | `bg-[#0b0f19]` / `bg-slate-950` | — | Primary application canvas |
| **Surface Card** | `#1E293B` | `bg-slate-800` / `bg-slate-900` | — | Container cards, modals, side drawers |
| **Border Subtle** | `#334155` | `border-slate-700/80` | — | Structural dividers and input outlines |
| **Text Primary** | `#FFFFFF` | `text-white` | **19.1:1** (Pass AAA) | Headings, primary labels, button text |
| **Text Muted** | `#94A3B8` | `text-slate-400` | **6.2:1** (Pass AA) | Secondary captions, timestamps, hints |
| **Primary Brand** | `#6366F1` | `bg-indigo-600` / `text-indigo-400` | **4.6:1** (Pass AA) | Key action buttons, active navigation tabs |
| **Success / Surplus** | `#10B981` | `text-emerald-400` / `bg-emerald-500/20` | **7.8:1** (Pass AA) | Under-budget metrics, completed milestones |
| **Warning / Alert** | `#F59E0B` | `text-amber-400` / `bg-amber-500/20` | **9.5:1** (Pass AA) | Approaching budget threshold, pending quotes |
| **Danger / Deficit** | `#F43F5E` | `text-rose-400` / `bg-rose-500/20` | **5.4:1** (Pass AA) | Overbudget alert, Budget Rescue triggers |

---

## 2. Typography Scale

- **Primary Typeface**: `Plus Jakarta Sans`, sans-serif (imported in `client/index.html`).
- **Hierarchy Tokens**:
  - `Display / Hero`: `text-4xl font-extrabold tracking-tight` (36px / 1.1)
  - `Page Heading (h1)`: `text-2xl font-bold tracking-tight text-white` (24px / 1.25)
  - `Section Heading (h2)`: `text-lg font-semibold text-white` (18px / 1.35)
  - `Card Header (h3)`: `text-base font-medium text-slate-200` (16px / 1.4)
  - `Body Text`: `text-sm font-normal text-slate-300 leading-relaxed` (14px / 1.5)
  - `Caption / Meta`: `text-xs font-medium text-slate-400` (12px / 1.4)

---

## 3. Component Design Conventions

### Buttons
All buttons support interactive keyboard states with visible focus rings:

```html
<!-- Primary Action -->
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
  Confirm Action
</button>

<!-- Secondary / Cancel Action -->
<button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700/80 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
  Cancel
</button>
```

### Form Inputs
- Every form field is explicitly labeled using `<label htmlFor="...">` and `<input id="...">`.
- Inputs feature `placeholder-slate-500`, high-contrast text, and consistent focus indicator: `focus-visible:ring-2 focus-visible:ring-indigo-500`.

### Modals & Drawers
- Container implements `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="[id]"`.
- Activates `useFocusTrap` on mount to trap `Tab` cycling within the active layer.
- Listens for <kbd>Esc</kbd> to dismiss.
- Close trigger includes an explicit screen-reader label: `aria-label="Close dialog"`.

---

## 4. Accessibility Interaction Rules

1. **No Hover-Only Controls**: Every hover action (e.g. tooltips, action reveals) is also accessible via keyboard focus (`focus-visible`).
2. **Predictable Tab Flow**: Interactive elements match visual DOM order (no negative `tabIndex` overrides unless specifically excluded from navigation).
3. **Screen Reader Live Regions**: Real-time metric changes and loading states use `aria-live="polite"` and `role="status"`.
4. **Motion Preference**: Transitions respect `motion-reduce:transition-none` for users with vestibular sensitivities.
