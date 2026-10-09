import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

/** /login — already signed in → go to /. */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <p>Ładowanie…</p>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
