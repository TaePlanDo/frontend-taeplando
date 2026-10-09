import { createContext } from "react";

import type {
  AuthErrorCode,
  AuthStatus,
  LoginCredentials,
  User,
} from "@/types/auth";

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  errorCode: AuthErrorCode | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
