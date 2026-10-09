import { createContext } from "react";

import type { AuthStatus, LoginCredentials, User } from "@/types/auth";

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
