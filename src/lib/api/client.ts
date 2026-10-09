import { getAccessToken } from "@/auth/tokenRef";
import { apiUrl } from "@/config/env";

import { ApiError, readErrorMessage } from "./errors";

type RefreshHandler = () => Promise<string | null>;

/** Set by AuthProvider so a 401 can trigger POST /auth/refresh without importing React here. */
let refreshHandler: RefreshHandler | null = null;

export function setRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

export type ApiFetchOptions = RequestInit & {
  skipAuthRetry?: boolean;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { skipAuthRetry = false, ...init } = options;
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (
    response.status === 401 &&
    !skipAuthRetry &&
    token &&
    refreshHandler &&
    path !== apiUrl("/auth/refresh")
  ) {
    const newToken = await refreshHandler();
    if (newToken) {
      return apiFetch(path, { ...options, skipAuthRetry: true });
    }
  }

  return response;
}

export async function apiJson<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
