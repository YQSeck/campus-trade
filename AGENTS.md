# CampusTrade AGENTS.md

## Project Identity

校园二手交易平台 (Campus Second-Hand Trading Platform).
Frontend: Vue3 (Composition API + `<script setup>`) + Element Plus + Pinia + Axios + Vite.
Backend: Node.js + Express v5 + in-memory array storage.
**Pure JavaScript only — no TypeScript.**

## Source of Truth

- `CampusTrade_Requirements.md` — feature spec, data models, API endpoints, business rules
- `CampusTrade_Project_Guidelines.md` — coding conventions, directory structure, data format conventions

These two files take precedence over the codebase, which currently has deviations from them.

## Commands

| Command | What it does |
|---------|-------------|
| `npm run server` | Start Express backend on port 3000 |
| `npm run dev` | Start Vite dev server (frontend, proxies `/api` → `localhost:3000`) |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run cli` | CLI entry: `node cli/tradeCli.js` |
| `npm run lint` | ESLint `.js,.vue` in `src/` |
| `npm run format` | Prettier `src/` |
| `npm run test` | Core tests (pricing + CLI) |
| `npm run test:skill` | Module 8 pricing tests |
| `npm run test:cli` | Module 7 CLI tests |
| `npm run test:auth` | Module 1 auth tests |
| `npm run test:product` | Module 2 product tests |
| `npm run test:all` | All tests under `tests/` |

**Command order**: start backend first (`npm run server`), then frontend (`npm run dev`). Run in separate terminals.

## Conventions

- **Single quotes**, **semicolons**, **2-space indent** — enforced by `.prettierrc` + `.editorconfig`
- **`<style scoped>`** on every Vue component
- **camelCase** for JS files, variables, functions, JSON keys
- **PascalCase** for Vue component files only
- **Component order**: `<template>` → `<script setup>` → `<style scoped>`
- **AI comment header**: every file starts with `// AI 生成，手动调整：<what was modified>`
- **No `var`** — use `const`/`let`
- **Unified Axios**: always import `@/utils/request.js`; never create a new axios instance

## Architecture

### Frontend (`src/`)
- ES modules (`import`/`export`)
- `src/main.js` → register Pinia → Router → ElementPlus
- `@` alias resolves to `src/` (configured in `vite.config.js`)
- `src/router/index.js` — routes auto-loaded from `src/router/modules/*.js` via `import.meta.glob` (eager)
- Router `beforeEach` guard reads `localStorage.getItem('user')` directly for admin role check
- `src/store/userStore.js` — token + user info persisted to localStorage; `isAdmin` checks `role === 'admin'`
- `src/api/` — API call functions that all use `@/utils/request` (pre-configured Axios with auth interceptor)
- `src/utils/request.js` — pre-configured Axios (`baseURL: '/api'`, auth interceptor)
- `src/utils/image.js` — client-side image compression (canvas → base64)
- `src/utils/account.js` — email/phone normalization and validation
- `src/constants/categories.js` — `PRODUCT_CATEGORIES` array (5 categories)

### Backend (`server/`)
- CommonJS (`require`/`module.exports`); `package.json` has `"type": "commonjs"`
- Entrypoint: `server/index.js`
- Routes live in `server/routes/` split by domain
- `server/db.js` — in-memory DB object + `genId()` helper; **all data lost on restart**
- `server/data.js` — thin re-export shim of `db.js`
- `server/middleware.js` — `hashPassword` (bcrypt), `comparePassword`, `generateToken`, `authMiddleware`, `adminMiddleware`, `mockSendEmail`, `apiKeyMiddleware`
- Test accounts: `admin@campus.edu`/`admin123`, `user@campus.edu`/`user123`

### Route mounting order (in `server/index.js`)
| Order | Mount path | Source | Purpose |
|-------|-----------|--------|---------|
| 1 | `/api/auth` | `routes/auth` (authRouter) | Register, login, forgot-password, reset-password |
| 2 | `/api/user` | `routes/auth` (userRouter) | Profile, change password |
| 3 | `/api/upload` | `routes/auth` (uploadRouter) | Mock avatar upload |
| 4 | `/api/products` | `routes/comments` | Product comments — **must mount before products** |
| 5 | `/api/products` | `routes/products` | Product CRUD |
| 6 | `/api/orders` | `routes/orders` | Order lifecycle |
| 7 | `/api/orders` | `routes/reviews` | Order reviews |
| 8 | `/api/users` | `routes/users` | User reputation, ban, list |
| 9 | `/api/reports` | `routes/reports` | Submit reports |
| 10 | `/api/admin` | `routes/admin` | Admin stats, product/user/report/review management |
| 11 | `/api/skills` | `routes/pricingRoutes` (from `server/routes/`) | Pricing recommendation skill |

### Module 6 Open API
`GET /api/products` allows third-party calls with `x-api-key: campus-trade-2026-public` header. Browsers on localhost bypass this check via `origin` + `host` whitelist. See `demo-client.html` for an example.

### CLI (`cli/`)
- Entrypoint: `cli/tradeCli.js` using `commander` + `chalk`
- Uses own Axios client (`cli/apiClient.js`), **not** `src/utils/request.js`
- Token priority: `TRADE_TOKEN` env var → `~/.trade-cli/config.json` → `--token` flag

### Testing
- Node built-in test runner (`node --test`), **not** Jest/Vitest/Mocha
- Tests live in `tests/` directory

## Business Logic Quick Ref

### Order Flow
