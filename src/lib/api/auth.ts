import { apiUrl } from "@/config/env";
import type {
  LoginCredentials,
  TokenResponse,
  User,
  PasswordChangeCredentials,
} from "@/types/auth";

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

export async function registerRequest(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  return apiJson<TokenResponse>(apiUrl("/auth/register"), {
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

export async function updateMeRequest(fullName: string): Promise<User> {
  return apiJson<User>(apiUrl("/auth/me"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName }),
  });
}

export async function passwordChangeRequest(
  passwordChangeCredentials: PasswordChangeCredentials,
): Promise<void> {
  await apiJson<void>(apiUrl("/auth/me/password"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(passwordChangeCredentials),
  });
}

export function startGoogleLogin(): void {
  window.location.href = apiUrl("/auth/google");
}
