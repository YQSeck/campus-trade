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

## Dev Commands

```
npm run dev          # Vite dev server (port 5173, proxies /api → :3000)
npm run server       # Express backend (port 3000)
npm run lint         # ESLint: src/*.js and src/*.vue
npm run format       # Prettier: src/
npm run test         # Core tests (pricing + CLI)
npm run test:skill   # Module 8 pricing tests
npm run test:cli     # Module 7 CLI tests
npm run test:auth    # Module 1 auth tests
npm run test:product # Module 2 product tests
npm run test:all     # All tests under tests/
npm run cli          # CLI entry: node cli/tradeCli.js
```

Run `npm run dev` and `npm run server` in **separate terminals**.

## Conventions (Differ from Defaults)

- **Single quotes**, **semicolons**, **2-space indent** — enforced by `.prettierrc` + `.editorconfig`
- **`<style scoped>`** on every Vue component
- **camelCase** for JS files, variables, functions, JSON keys
- **PascalCase** for Vue component files only
- **Component order**: `<template>` → `<script setup>` → `<style scoped>`
- **AI comment header**: every file starts with `// AI 生成，手动调整：<what was modified>`
- **No `var`** — use `const`/`let`
- **Unified Axios**: always import `@/utils/request.js`; never create a new axios instance

## Architecture Notes

- **`src/skills/pricingRoutes.js`** is server-side CJS code in the frontend directory. `server/index.js:5` requires it via `require('../src/skills/pricingRoutes')`.
- **Express v5** — async route handlers and `res.status().send()` chaining differ from v4.
- **Router auto-registration**: `src/router/index.js:3` globs `./modules/*.js` — any `.js` file in `src/router/modules/` is picked up automatically.
- **In-memory DB** (`server/db.js`). Data resets on restart. Seed accounts: `admin@campus.edu` / `admin123`, `user@campus.edu` / `user123`.
- **`server.js`** at root is just `module.exports = require('./server/index')` — redundant.
- **Module 6 Open API**: `GET /api/products` allows third-party calls with `x-api-key: campus-trade-2026-public` header. Browsers on localhost bypass this check. See `demo-client.html` for an example.

## Known Deviations from Spec

| Issue | Location | Detail |
|-------|----------|--------|
| `sessionStorage` vs `localStorage` | `src/store/userStore.js`, `src/utils/request.js` | Spec requires `localStorage` key `"token"`; code uses `sessionStorage` |

## Business Logic Quick Ref

### Order Flow
```
pending → paid → shipped → received → (review, 7-day window)
pending → cancelled (buyer/admin)
paid → cancelled (auto after 24h)
```
`enrichOrder` maps DB status `received` → `completed` in API responses. Clients see `completed`, not `received`.

### Products
`active` → `removed` → `deleted` (logical delete). Admin cannot publish products.

### Search
Weighted (`keyword` param): title weight 2, description weight 1.  
Sort values: `price_asc`, `price_desc`, `newest`, `popular`.

### Reviews
- Buyer→seller: rating (1-5) + text required
- Seller→buyer: rating only, optional
- 7-day window from order creation
- No edits allowed; one follow-up comment permitted
- Admin hide (not delete): hidden from regular users
- Admin delete: logical delete (mark `deleted` field)

### Auth
- JWT stored via `sessionStorage` key `"token"` (should be `localStorage` per spec)
- Two-tier lockout: 5 failures → 30 min, 10 failures → 24 hr (admin unlock)
- bcrypt, salt rounds = 10
- Successful login resets failure counter
