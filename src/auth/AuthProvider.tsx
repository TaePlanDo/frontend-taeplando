import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

import { fetchMe, loginRequest, refreshRequest } from "@/lib/api/auth";
import { setRefreshHandler } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type {
  AuthErrorCode,
  AuthStatus,
  LoginCredentials,
  User,
} from "@/types/auth";

import { AuthContext } from "./authContext";
import { getAccessToken, setAccessToken } from "./tokenRef";

const meKey = ["auth", "me"] as const;

function mapLoginError(error: unknown): AuthErrorCode {
  if (error instanceof ApiError && error.status === 401) {
    return "invalidCredentials";
  }
  return "unknown";
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
    setRefreshHandler(async () => {
      try {
        const tokens = await refreshRequest();
        setAccessToken(tokens.access_token);
        return tokens.access_token;
      } catch {
        setAccessToken(null);
        queryClient.setQueryData(meKey, null);
        return null;
      }
    });
    return () => setRefreshHandler(null);
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const status: AuthStatus = useMemo(() => {
    if (meQuery.isPending || loginMutation.isPending) {
      return "loading";
    }
    if (loginMutation.isError) {
      return "error";
    }
    if (meQuery.data) {
      return "authenticated";
    }
    return "unauthenticated";
  }, [
    meQuery.isPending,
    meQuery.data,
    loginMutation.isPending,
    loginMutation.isError,
  ]);

  const value = useMemo(
    () => ({
      user: meQuery.data ?? null,
      status,
      errorCode: loginMutation.isError
        ? mapLoginError(loginMutation.error)
        : null,
      isAuthenticated: status === "authenticated",
      login,
    }),
    [meQuery.data, status, loginMutation.isError, loginMutation.error, login],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
