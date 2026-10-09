export type AuthMethod = "LOCAL" | "GOOGLE";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  auth_method: AuthMethod;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
