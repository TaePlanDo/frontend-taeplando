import { Navigate } from "react-router-dom";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/auth/useAuth";

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
    return <LoadingSpinner className="min-h-dvh bg-background" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
