import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

/** Private routes — send guests to /login. */
export function RequireAuth({
  children,
  override = false,
}: {
  children: React.ReactNode;
  override?: boolean;
}) {
  const { isAuthenticated, status } = useAuth();

  if (override) {
    return children;
  }

  if (status === "loading") {
    return <p>Ładowanie…</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
