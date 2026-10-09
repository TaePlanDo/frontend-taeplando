/**
 * Access JWT lives here so `apiFetch` can read it without React context.
 * AuthProvider updates this when the user logs in, refreshes, or logs out.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
