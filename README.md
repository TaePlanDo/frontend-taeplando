# TaePlanDo Frontend

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
2. Runs Alembic migrate + system seed against that DB
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

### DB reset from tests

Call `resetDb()` from `e2e/helpers/resetDb` when a test needs a clean seeded baseline
(truncate + re-seed). Also fine in `test.beforeEach` / `test.beforeAll` if a whole file needs it.
