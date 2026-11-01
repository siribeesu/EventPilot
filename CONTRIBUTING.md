# 🤝 Contributing to EventPilot

Thank you for your interest in contributing to **EventPilot**! We are committed to fostering an inclusive, welcoming, and high-rigor engineering environment.

This guide outlines our development workflow, coding standards, branch conventions, and quality gates to help you make meaningful contributions efficiently.

---

## 📋 Table of Contents
1. [Code of Conduct](#1-code-of-conduct)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Branching Strategy](#3-branching-strategy)
4. [Commit Message Standards](#4-commit-message-standards)
5. [Development Workflow & Scripts](#5-development-workflow--scripts)
6. [Strict Quality Gates](#6-strict-quality-gates)
7. [Submitting a Pull Request](#7-submitting-a-pull-request)
8. [Reporting Security Issues](#8-reporting-security-issues)

---

## 1. Code of Conduct

We are dedicated to providing a harassment-free experience for everyone. All contributors and participants are expected to maintain respect, empathy, and professional collaboration across all interactions.

---

## 2. Prerequisites & Environment Setup

### System Requirements
- **Node.js**: `v20.x` LTS, `v22.x`, or `v24.x` (check with `node -v`)
- **npm**: `v10.x` or higher
- **Git**: Modern Git version

### Local Setup
```bash
# 1. Clone the repository
git clone https://github.com/siribeesu/EventPilot.git
cd EventPilot

# 2. Install dependencies across all workspaces
npm install

# 3. Configure environment variables (optional for local testing; demo fallback built-in)
cp .env.example .env

# 4. Start concurrent development servers (client on :5173, server on :5000)
npm run dev
```

---

## 3. Branching Strategy

We follow a structured Git branching model:

| Branch | Purpose | Protection Rules |
| :--- | :--- | :--- |
| `main` | Production-ready stable release branch | Protected. Requires verified CI pass and code review. |
| `update` | Primary active staging and integration branch | Protected. Automated CI gates enforced. |
| `feat/*` | Feature development branches | Branch from `update`, open PR into `update`. |
| `fix/*` | Bug fixes and patches | Branch from `update`, open PR into `update`. |
| `sec/*` | Security hardening or vulnerability remediation | Private staging until advisory coordinate. |
| `docs/*` | Documentation improvements | Open PR into `update`. |

---

## 4. Commit Message Standards

EventPilot enforces the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <short description in imperative mood>

[optional body explaining motivation and architectural context]

[optional footer(s) like Fixes #123]
```

### Supported Types
- `feat`: A new feature or user-facing functionality.
- `fix`: A bug fix or patch.
- `sec`: Security hardening, cryptography update, or CVE remediation.
- `perf`: A code change that improves execution speed or memory efficiency.
- `refactor`: Code reorganization without fixing a bug or adding a feature.
- `docs`: Documentation updates only.
- `test`: Adding or correcting tests.
- `chore`: Build process, dependency updates, or tool configurations.

### Examples
- `feat(budget): add real-time category rebalance recommendations`
- `fix(auth): enforce strict HS256 algorithm pinning on token verification`
- `docs(api): document GDPR right-of-erasure endpoint specifications`

---

## 5. Development Workflow & Scripts

The root workspace provides unified scripts across the monorepo:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both client (`:5173`) and server (`:5000`) concurrently. |
| `npm run lint` | Runs ESLint (`--max-warnings=0`), Oxlint, and TypeScript compilation checks across workspaces. |
| `npm run build` | Compiles client Vite production assets and server TypeScript binaries. |
| `npm test` | Runs the full Vitest suite (107+ tests across 11 suites). |
| `npm run test:coverage` | Generates v8 code coverage report enforcing mandated coverage thresholds. |
| `npm run test:critical` | Executes edge-case and critical-path validation suites. |
| `npm run test:e2e` | Executes end-to-end user journey simulation tests. |
| `npm run verify` | Complete single-command pipeline: runs lint, build, test:critical, test, test:coverage, and test:e2e. |

---

## 6. Strict Quality Gates

Before any pull request can be merged into `main` or `update`, it must satisfy our **Four Pillar Quality Standards**:

1. **Zero Warnings Policy**:
   - `npm run lint` must pass with **0 errors and 0 warnings**.
   - No `@typescript-eslint/no-explicit-any` usage unless strictly justified and isolated.
   - No unused variables or dangling imports.
   - No `console.log` statements in production source files (use `logger`).
2. **Deterministic Financial Math**:
   - All monetary calculations must use exact integer arithmetic in base currency units (cents/paise) or bounded decimal math. Floating point drift is forbidden.
3. **Defense-in-Depth Security**:
   - All mutation endpoints must enforce user authentication and event role verification (`requireEventRole`).
   - All input bodies must be validated with Zod schemas and sanitized for XSS and Prototype Pollution.
4. **Comprehensive Test Proof**:
   - New functionality must include unit or integration test coverage.
   - Regression and edge cases (empty inputs, negative numbers, unauthorized actors) must be explicitly covered.

---

## 7. Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-enhancement`
2. Implement your changes following our coding conventions.
3. Run the full verification suite locally:
   ```bash
   npm run verify
   ```
4. Push your branch to GitHub and open a Pull Request using our [PR Template](.github/pull_request_template.md).
5. Ensure all automated GitHub Actions checks turn green.
6. A maintainer will review your code promptly.

---

## 8. Reporting Security Issues

Please **do not** report security vulnerabilities via public GitHub issues. Follow the instructions in our [SECURITY.md](SECURITY.md) to disclose vulnerabilities confidentially.
