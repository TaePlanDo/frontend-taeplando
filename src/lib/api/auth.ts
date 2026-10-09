import { apiUrl } from "@/config/env";
import type { LoginCredentials, TokenResponse, User } from "@/types/auth";

import { apiJson } from "./client";

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  return apiJson<TokenResponse>(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export async function refreshRequest(): Promise<TokenResponse> {
  return apiJson<TokenResponse>(apiUrl("/auth/refresh"), {
    method: "POST",
  });
}

export async function fetchMe(): Promise<User> {
  return apiJson<User>(apiUrl("/auth/me"));
}

export function startGoogleLogin(): void {
  window.location.href = apiUrl("/auth/google");
}
