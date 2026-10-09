/**
 * Vite loads variables from `.env` into `import.meta.env` (only `VITE_*` reach the browser).
 * Defaults match the dev setup: SPA on :5173, API under `/api` via Vite proxy.
 */
const apiPrefix = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(
  /\/$/,
  "",
);
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${apiPrefix}${suffix}`;
}
