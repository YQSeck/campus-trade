# AGENTS.md — CampusTrade

## Stack
- **Frontend**: Vue3 + Composition API (`<script setup>`), Element Plus, Pinia, ECharts, Axios, Vite
- **Backend**: Node.js + Express (RESTful API), CommonJS (`require`/`module.exports`)
- **DB**: In-memory object in `server/db.js` (no persistence; reset on restart)
- **Auth**: JWT (HS256, secret `campus-trade-secret-key`), frontend stores token in `localStorage.getItem/setItem('token')`
- **Testing**: Node built-in test runner (`node --test`)
- **JS only, no TypeScript**

## Commands

| Command | What it does |
|---------|-------------|
| `npm run server` | Start Express backend on port 3000 |
| `npm run dev` | Start Vite dev server (frontend, proxies `/api` → `localhost:3000`) |
| `npm run build` | Build frontend for production |
| `npm run cli <subcommand>` | Run CLI admin tool (requires backend) |
| `npm run test` | Run all tests |
| `npm run test:skill` | Run only skill pricing tests |
| `npm run test:cli` | Run only CLI tests |
| `npm run lint` | ESLint `.js,.vue` in `src/` |
| `npm run format` | Prettier `src/` |

**Command order**: start backend first (`npm run server`), then frontend (`npm run dev`).

## Architecture

### Frontend (`src/`)
- ES modules (`import`/`export`)
- `src/main.js` → register Pinia → Router → ElementPlus
- `src/router/index.js` — routes auto-loaded from `src/router/modules/*.js` via `import.meta.glob` (eager); **never edit the routes array directly**
- `src/store/userStore.js` — token persisted to localStorage, `userInfo` memory-only; `isAdmin` checks `role === 'admin'`
- `src/utils/request.js` — pre-configured Axios (`baseURL: '/api'`, auth interceptor); **always use this** for frontend API calls
- `src/utils/image.js` — client-side image compression (canvas → base64)
- `src/utils/account.js` — email/phone normalization and validation
- `src/constants/categories.js` — `PRODUCT_CATEGORIES` array (5 categories)

### Backend (`server/`)
- CommonJS (`require`/`module.exports`); `package.json` has `"type": "commonjs"`
- Entrypoint: `server/index.js` (redirected from root `server.js`)
- Routes are **not** single-file — they live in `server/routes/` split by domain
- `server/db.js` — in-memory DB object + `genId()` helper; **all data lost on restart**
- `server/data.js` — thin re-export shim of `db.js`
- `server/middleware.js` — `hashPassword` (SHA-256, no salt), `generateToken`, `authMiddleware`, `adminMiddleware`, `mockSendEmail`
- Test accounts: `admin@campus.edu`/`admin123`, `user@campus.edu`/`user123`

### Route mounting order (in `server/index.js`)
| Order | Mount path | Source | Purpose |
|-------|-----------|--------|---------|
| 1 | `/api/auth` | `routes/auth` (authRouter) | Register, login, forgot-password |
| 2 | `/api/user` | `routes/auth` (userRouter) | Profile, change password |
| 3 | `/api/upload` | `routes/auth` (uploadRouter) | Mock avatar upload |
| 4 | `/api/products` | `routes/comments` | Product comments — **must mount before products** |
| 5 | `/api/products` | `routes/products` | Product CRUD |
| 6 | `/api/orders` | `routes/orders` | Order lifecycle |
| 7 | `/api/orders` | `routes/reviews` | Order reviews |
| 8 | `/api/users` | `routes/users` | User reputation, ban, list |
| 9 | `/api/reports` | `routes/reports` | Submit reports |
| 10 | `/api/admin` | `routes/admin` | Admin stats, product/user/report/review management |
| 11 | `/api/skills` | `../src/skills/pricingRoutes` | Pricing recommendation skill |

### CLI (`cli/`)
- Entrypoint: `cli/tradeCli.js` using `commander` + `chalk`
- Uses own Axios client (`cli/apiClient.js`), **not** `src/utils/request.js`
- Token priority: `TRADE_TOKEN` env var → `~/.trade-cli/config.json` → `--token` flag
- Auth for CLI: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@campus.edu","password":"admin123"}'`

### Testing
- Node built-in test runner (`node --test`), **not** Jest/Vitest/Mocha
- Tests live in `tests/module7-cli/` and `tests/module8-skill/`
- CLI integration tests may require the backend running (check individual test files)

## Conventions

### Code style (enforced by ESLint + Prettier)
- Indent: 2 spaces, no tabs
- Quotes: single
- Semicolons: required
- Trailing commas: es5
- Print width: 100

### Files
- **Every new file** must start with: `// AI 生成：手动调整前请勿修改`
- Vue files: PascalCase (`LoginDialog.vue`)
- JS files: camelCase (`apiClient.js`)
- Fields: camelCase (`productId`, `createdAt`)
- Dates: ISO 8601 (`2026-06-25T10:30:00.000Z`)

### Vue components
- Strict order: `<template>` → `<script setup>` → `<style scoped>`
- Always use `<style scoped>`; global selectors only in `src/styles/global.css`

### Pagination
- Request: `{ page: 1, limit: 10 }` (page starts at 1)
- Response: `{ <plural>: [], total, page, limit }` — key is semantic: `products`, `orders`, `users`

### Skills (`src/skills/`)
- Each skill is an Express `Router` exported via `module.exports`
- Mounted at `/api/skills/` in `server/index.js`
- Convention: `pricingData.js` (constants) → `pricing.js` (engine) → `pricingRoutes.js` (router)

### Auth flow
- `authMiddleware` extracts `Authorization: Bearer <token>`, populates `req.user`
- `adminMiddleware` checks `req.user.role === 'admin'`
- Login lockout: 5 attempts → 15 min freeze (`lockedUntil`)
- Password: SHA-256 via `crypto.createHash` (no salt, not bcrypt)
