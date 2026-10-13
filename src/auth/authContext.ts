import { createContext } from "react";

import type {
  AuthStatus,
  LoginCredentials,
  User,
  PasswordChangeCredentials,
} from "@/types/auth";

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  registerError: string | null;
  isRegistering: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: LoginCredentials) => Promise<void>;
  updateName: (fullName: string) => Promise<void>;
  isUpdatingName: boolean;
  updateNameError: string | null;
  changePassword: (
    passwordChangeCredentials: PasswordChangeCredentials,
  ) => Promise<void>;
  isChangingPassword: boolean;
  changePasswordError: string | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
