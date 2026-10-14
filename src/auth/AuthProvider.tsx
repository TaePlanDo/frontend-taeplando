import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import {
  fetchMe,
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
  updateMeRequest,
  passwordChangeRequest,
} from "@/lib/api/auth";
import { setOnAuthLost } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type {
  AuthStatus,
  LoginCredentials,
  User,
  PasswordChangeCredentials,
} from "@/types/auth";

import { AuthContext } from "./authContext";
import { getAccessToken, setAccessToken } from "./tokenRef";

const meKey = ["auth", "me"] as const;

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return "Nieprawidłowy email lub hasło";
  }
  return "Nie udało się zalogować";
}

function registerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "Użytkownik o podanym emailu już istnieje";
    }

    if (error.status === 422) {
      return "Sprawdź adres email i wymagania hasła: minimum 8 znaków, litera, cyfra, znak specjalny i maksymalnie 72 bajty.";
    }
  }

  return "Nie udało się zarejestrować. Spróbuj ponownie.";
}

function changePasswordErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status < 500) {
    return "Niepoprawne hasło";
  }
  return "Spróbuj ponownie poźniej, wystąpił błąd.";
}

function updateNameErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status !== 401 && error.status < 500) {
    return "Niepoprawna nazwa użytkownika";
  }
  return "Spróbuj ponownie poźniej, wystąpił błąd.";
}

/** Restore access token from refresh cookie, then load the current user. */
async function loadSession(): Promise<User | null> {
  try {
    if (!getAccessToken()) {
      const tokens = await refreshRequest();
      setAccessToken(tokens.access_token);
    }
    return await fetchMe();
  } catch {
    setAccessToken(null);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: meKey,
    queryFn: loadSession,
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokens = await loginRequest(credentials);
      setAccessToken(tokens.access_token);
      return fetchMe();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(meKey, user);
    },
    onError: () => {
      setAccessToken(null);
      queryClient.setQueryData(meKey, null);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokens = await registerRequest(credentials);
      setAccessToken(tokens.access_token);
      return fetchMe();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(meKey, user);
    },
    onError: () => {
      setAccessToken(null);
      queryClient.setQueryData(meKey, null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordChangeCredentials: PasswordChangeCredentials) =>
      await passwordChangeRequest(passwordChangeCredentials),
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(meKey, null);
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (fullName: string) => updateMeRequest(fullName),
    onSuccess: (user) => {
      queryClient.setQueryData(meKey, user);
    },
  });

  useEffect(() => {
    setOnAuthLost(() => {
      queryClient.setQueryData(meKey, null);
    });
    return () => setOnAuthLost(null);
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const register = useCallback(
    async (credentials: LoginCredentials) => {
      await registerMutation.mutateAsync(credentials);
    },
    [registerMutation],
  );

  const changePassword = useCallback(
    async (passwordChangeCredentials: PasswordChangeCredentials) => {
      await changePasswordMutation.mutateAsync(passwordChangeCredentials);
    },
    [changePasswordMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Local logout must succeed even when the server cannot revoke the refresh session.
    }
  }, [logoutMutation]);

  const updateName = useCallback(
    async (fullName: string) => {
      await updateNameMutation.mutateAsync(fullName);
    },
    [updateNameMutation],
  );

  const status: AuthStatus = meQuery.isPending
    ? "loading"
    : meQuery.data
      ? "authenticated"
      : "unauthenticated";

  const value = useMemo(
    () => ({
      user: meQuery.data ?? null,
      status,
      isAuthenticated: status === "authenticated",
      isLoggingIn: loginMutation.isPending,
      isLoggingOut: logoutMutation.isPending,
      loginError: loginMutation.isError
        ? loginErrorMessage(loginMutation.error)
        : null,
      registerError: registerMutation.isError
        ? registerErrorMessage(registerMutation.error)
        : null,
      isRegistering: registerMutation.isPending,
      login,
      register,
      logout,
      updateName,
      isUpdatingName: updateNameMutation.isPending,
      updateNameError: updateNameMutation.isError
        ? updateNameErrorMessage(updateNameMutation.error)
        : null,
      changePassword,
      isChangingPassword: changePasswordMutation.isPending,
      changePasswordError: changePasswordMutation.isError
        ? changePasswordErrorMessage(changePasswordMutation.error)
        : null,
    }),
    [
      meQuery.data,
      status,
      loginMutation.isPending,
      loginMutation.isError,
      loginMutation.error,
      registerMutation.isError,
      registerMutation.error,
      registerMutation.isPending,
      logoutMutation.isPending,
      login,
      register,
      logout,
      updateName,
      updateNameMutation.isPending,
      updateNameMutation.isError,
      updateNameMutation.error,
      changePassword,
      changePasswordMutation.isPending,
      changePasswordMutation.isError,
      changePasswordMutation.error,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
