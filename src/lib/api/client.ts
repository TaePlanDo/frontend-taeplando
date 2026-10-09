import { getAccessToken, setAccessToken } from "@/auth/tokenRef";
import { apiUrl } from "@/config/env";

import { ApiError, readErrorMessage } from "./errors";

/** Called when a mid-session refresh fails so AuthProvider can clear `me`. */
let onAuthLost: (() => void) | null = null;

export function setOnAuthLost(handler: (() => void) | null): void {
  onAuthLost = handler;
}

const refreshUrl = apiUrl("/auth/refresh");
const loginUrl = apiUrl("/auth/login");

/** Refresh via cookie; does not go through apiFetch (avoids retry loops). */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(refreshUrl, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      setAccessToken(null);
      onAuthLost?.();
      return null;
    }
    const body = (await response.json()) as { access_token: string };
    setAccessToken(body.access_token);
    return body.access_token;
  } catch {
    setAccessToken(null);
    onAuthLost?.();
    return null;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  if (
    response.status === 401 &&
    token &&
    path !== refreshUrl &&
    path !== loginUrl
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      return fetch(path, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  return response;
}

export async function apiJson<T>(
  path: string,
  options: RequestInit = {},
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
