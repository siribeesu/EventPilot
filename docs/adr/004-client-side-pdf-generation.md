# ADR 004: Client-Side PDF Generation vs Serverless Headless Browser

## Status
**Accepted** (2026-10-19)

## Context
Event organizers frequently require offline printable run-of-show itineraries and budget summaries for vendors. Traditional server-side PDF generation via Puppeteer / Playwright requires 150MB+ Chromium binaries, which frequently crash serverless functions on Vercel/AWS Lambda due to memory limits (512MB default) and cold-start timeouts.

## Decision
We implemented a pure client-side PDF export engine in `client/src/services/pdfExport.ts` using `jspdf` and `jspdf-autotable`:
- Generates pixel-perfect, multi-page vector PDF documents directly in the client browser.
- Encodes executive summaries, visual budget tables, timeline schedules, and vendor contacts.
- Includes automated page headers, footers, page numbering, and confidentiality notices.

## Consequences
### Positive
- Zero server compute overhead or headless browser licensing/memory costs.
- Instantaneous export download (<100ms) with zero latency.
- Operates reliably even in offline or slow-network environments.
