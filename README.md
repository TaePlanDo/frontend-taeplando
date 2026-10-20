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

## Imports (cn and Radix)

Two imports look a bit unusual, but this is how shadcn generates them now, so please keep it like
this.

### cn

```ts
import { cn } from "cn";
```

- shadcn moved the old `cn` helper (`twMerge(clsx(...))`) into its own package
  [cn](https://github.com/shadcn-ui/cn), see the
  [changelog](https://ui.shadcn.com/docs/changelog/2026-09-cn)
- because of that we don't have `src/lib/utils.ts` anymore and we don't use `clsx` or
  `tailwind-merge` directly
- don't import from `@/lib/utils`, it doesn't exist

### Radix

```ts
import { Dialog as DialogPrimitive } from "radix-ui";
```

- the `new-york` style uses one package `radix-ui` instead of many `@radix-ui/react-...` packages,
  see the [changelog](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui)
- so we use only `radix-ui` everywhere (in `src/components/ui` and in our own components) and don't
  mix it with the scoped packages like `@radix-ui/react-dialog`

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
2. Runs Alembic migrate and `seed-system-data` for required system catalogs; tests create their own users and feature data via API
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

E2E seeds only immutable system catalogs (such as `training_segments`). It creates
test-owned users and feature data through public APIs (for example,
`createLocalTrainer()` → `POST /auth/register`) and clears that test-owned data between
tests.

### DB reset from tests

Import from `./playwright` instead of `@playwright/test` (same API: `test`, `expect`, …).
An auto fixture clears the DB before every test; re-create data with API helpers in the test body.
