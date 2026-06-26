# AGENTS.md - CampusTrade

## Stack (JS only, no TypeScript)
- Frontend: Vue3 + Composition API (`<script setup>`), Element Plus, Pinia, Axios, Vite
- Backend: Node.js + Express (RESTful API), CommonJS (`require`/`module.exports`)
- DB: in-memory object in `server.js` (no persistence; reset on restart)
- Auth: JWT (HS256, secret `campus-trade-secret-key`), frontend stores in `localStorage.getItem/setItem('token')`

## Commands

| Command | What it does |
|---------|-------------|
| `npm run server` | Start Express backend on port 3000 |
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run cli <subcommand>` | Run CLI admin tool (requires backend running) |

**Important**: Frontend deps (`vue`, `vite`, `pinia`, `element-plus`) are **not** in `package.json` yet. `npm run dev` and the frontend will fail until those are installed and a `vite.config.js` + `index.html` are added.

No `lint`/`test`/`format` scripts configured.

## Architecture

### Frontend (`src/`)
- Module system: ES modules (`import`/`export`)
- `src/main.js` 鈥?entrypoint; registers Pinia 鈫?Router 鈫?ElementPlus
- `src/router/index.js` 鈥?routes auto-loaded from `src/router/modules/*.js` via `import.meta.glob`; never edit the routes array directly
- `src/store/userStore.js` 鈥?token persisted to localStorage, `userInfo` is memory-only; `isAdmin` checks `userInfo.role === 'admin'`
- `src/utils/request.js` 鈥?pre-configured Axios instance (`baseURL: '/api'`, auth interceptor); **always use this** for frontend API calls

### Backend (`server.js` + `src/skills/`)
- Module system: CommonJS (`require`/`module.exports`) 鈥?`package.json` has `"type": "commonjs"`
- Single-file Express server at `server.js` 鈥?all routes, middleware, and in-memory DB in one file
- JWT middleware: `authMiddleware` 鈫?populates `req.user`; `adminMiddleware` 鈫?checks `req.user.role === 'admin'`
- Skill system: Express Routers under `src/skills/` mounted at `/api/skills/` on the server
- Test accounts: `admin@campus.edu`/`admin123`, `user@campus.edu`/`user123`

### CLI (`cli/`)
- Entrypoint: `cli/tradeCli.js` using `commander` + `chalk`
- Uses its own Axios client (`cli/apiClient.js`), **not** `src/utils/request.js`
- CLI auth: `TRADE_TOKEN` env var 鈫?`~/.trade-cli/config.json` 鈫?`--token` flag
- Requires backend running at `http://localhost:3000` (overridable via `TRADE_API_URL`)

## Dev workflow
1. Start backend first: `npm run server`
2. Start frontend (once deps exist): `npm run dev`
3. CLI commands: `node cli/tradeCli.js --token <jwt> <subcommand>`

To get a JWT for CLI use: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@campus.edu","password":"admin123"}'`

## Current state (what's missing)
- **`views/` and `components/` are empty** 鈥?no Vue pages or components exist yet
- **`router/modules/` directory does not exist** 鈥?no routes registered, frontend has nothing to render
- **No `index.html`** or **`vite.config.js`** 鈥?Vite can't start
- **Frontend deps missing** from `package.json`: `vue`, `vite`, `@vitejs/plugin-vue`, `pinia`, `element-plus`
- **Backend has limited endpoints**: login, profile, GET products (list only), GET orders (list only), ban/unban users, admin stats, + skill endpoints. No POST/PUT/DELETE for products, no registration, no order creation.

## Conventions

### Naming & formatting
- Vue files: PascalCase (`LoginPage.vue`)
- JS files: camelCase (`apiClient.js`)
- Indent: 2 spaces (no tabs)
- Quotes: single quotes
- Semicolons: required
- Fields: camelCase (`productId`, `createdAt`)
- Dates: ISO 8601 (`2026-06-25T10:30:00.000Z`)
- **Every new file** must start with: `// AI 鐢熸垚锛氭墜鍔ㄨ皟鏁村墠璇峰嬁淇敼`

### Component structure (strict order)
```
<template> 鈫?<script setup> 鈫?<style scoped>
```

### Styling
- Always use `<style scoped>` in components
- Global selectors only in `src/styles/global.css`

### Pagination
- Request: `{ page: 1, limit: 10 }` (page starts at 1)
- Response: `{ <plural>: [], total, page, limit }` 鈥?key is semantic: `products`, `orders`, `users`

### Skills (`src/skills/`)
- Each skill is an Express `Router` exported via `module.exports`
- Mount in `server.js` with `app.use('/api/skills', router)`
- Data/logic split: `pricingData.js` for constants, `pricing.js` for engine, `pricingRoutes.js` for router

## Directory
```
server.js               鈥?Express backend (single file with all routes + in-memory DB)
cli/                    鈥?Commander-based CLI admin tool
  tradeCli.js           鈥?Entrypoint
  apiClient.js          鈥?CLI HTTP client (separate from frontend request.js)
  commands/             鈥?Subcommands (products, orders, users)
src/
  api/                  鈥?Frontend API modules (auth.js, products.js)
  views/                鈥?Page-level Vue components (empty)
  components/           鈥?Reusable Vue components (empty)
  store/                鈥?Pinia stores (userStore.js)
  router/               鈥?router/index.js + modules/*.js (modules/ does not exist yet)
  utils/                鈥?Frontend Axios instance (request.js)
  styles/               鈥?Global CSS only (global.css)
  skills/               鈥?Server-side skill modules (CommonJS)
  App.vue, main.js      鈥?Vue entrypoints
docs/                   鈥?API docs (skillPricing.md)
```
