import path from "node:path";

/** Sibling backend checkout (override with BACKEND_DIR). */
export const backendDir = path.resolve(
  process.env.BACKEND_DIR ??
    path.join(process.cwd(), "..", "backend-taeplando"),
);

export const composeProject = "taeplando-e2e";
export const composeFile = path.join(backendDir, "docker-compose.yml");

/** Fixed e2e ports — keep clear of normal local dev (5433 / 8000 / 5173). */
export const pgPort = Number(process.env.E2E_PG_PORT ?? 5439);
export const apiPort = Number(process.env.E2E_API_PORT ?? 8001);
export const fePort = Number(process.env.E2E_FE_PORT ?? 5174);

/** Deterministic compose credentials (not the developer's .env). */
export const pgUser = "taeplando";
export const pgPassword = "taeplando";
export const pgDatabase = "taeplando";

export const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  `postgresql+asyncpg://${pgUser}:${pgPassword}@127.0.0.1:${pgPort}/${pgDatabase}`;

export const frontendOrigin = `http://127.0.0.1:${fePort}`;
export const apiOrigin = `http://127.0.0.1:${apiPort}`;

/** Env for backend migrate / seed / uvicorn (overrides .env file values). */
export function backendProcessEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DATABASE_URL: databaseUrl,
    CORS_ORIGINS: frontendOrigin,
    FRONTEND_URL: frontendOrigin,
    REFRESH_COOKIE_SECURE: "false",
    ENVIRONMENT: "development",
  };
}

/** Env for Vite so the /api proxy hits the e2e API. */
export function frontendProcessEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    VITE_DEV_API_PROXY_TARGET: apiOrigin,
    VITE_API_BASE_URL: "",
  };
}

/** Env for `docker compose` interpolation (beats backend `.env`). */
export function composeProcessEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    POSTGRES_DB: pgDatabase,
    POSTGRES_USER: pgUser,
    POSTGRES_PASSWORD: pgPassword,
    POSTGRES_PORT: String(pgPort),
  };
}
