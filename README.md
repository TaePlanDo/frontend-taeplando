TaePlanDo Frontend

# Shadcn - Components

Please use components listed on https://ui.shadcn.com/docs/components
Install them with command:

```
npx shadcn@latest add <component>
```

example:

```
npx shadcn@latest add button
```

They will be installed in src/components/ui
Dont change their implementation

## Scripts

| Command               | Description                   |
| --------------------- | ----------------------------- |
| `npm run dev`         | Vite dev server               |
| `npm run test`        | Unit tests (Vitest)           |
| `npm run test:e2e`    | End-to-end tests (Playwright) |
| `npm run test:e2e:ui` | Playwright UI mode            |

## E2E tests

One command boots an isolated stack and runs the suite:

```powershell
npm run test:e2e
```

What it does:

1. Starts Postgres via the **backend** `docker-compose.yml` under project `taeplando-e2e` (port `5439`, separate volume)
2. Runs Alembic migrate (no `seed-system-data` — tests create data via API)
3. Starts the API on `8001` and Vite on `5174`
4. Runs Playwright (Chromium)
5. Tears down the e2e Postgres container and volume

### Prerequisites

- Docker Desktop running
- Backend checkout as a sibling directory: `../backend-taeplando`  
  Or pass a path: `npm run test:e2e -- --backend-dir=D:\path\to\backend-taeplando`
- `uv` on `PATH` (backend dependency manager)
- Browsers once: `npx playwright install chromium`

### Ports (fixed, avoid clashing with local dev)

| Service      | Port |
| ------------ | ---- |
| E2E Postgres | 5439 |
| E2E API      | 8001 |
| E2E frontend | 5174 |

### Test data (API only)

E2E does **not** call backend `seed-system-data`. Create what you need through public APIs
(e.g. `createLocalTrainer()` → `POST /auth/register`). Later features (groups/plans) will
need more helpers — and may still require system catalogs (`training_segments`) that today
only come from seed/migrations, until an API exists for them.

### DB reset from tests

Import from `./playwright` instead of `@playwright/test` (same API: `test`, `expect`, …).
An auto fixture clears the DB before every test; re-create data with API helpers in the test body.
