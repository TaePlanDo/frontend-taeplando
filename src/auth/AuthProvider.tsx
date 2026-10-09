import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import { fetchMe, loginRequest, refreshRequest } from "@/lib/api/auth";
import { setOnAuthLost } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { AuthStatus, LoginCredentials, User } from "@/types/auth";

import { AuthContext } from "./authContext";
import { getAccessToken, setAccessToken } from "./tokenRef";

const meKey = ["auth", "me"] as const;

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return "Nieprawidłowy email lub hasło";
  }
  return "Nie udało się zalogować";
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
      loginError: loginMutation.isError
        ? loginErrorMessage(loginMutation.error)
        : null,
      login,
    }),
    [
      meQuery.data,
      status,
      loginMutation.isPending,
      loginMutation.isError,
      loginMutation.error,
      login,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
