import { Navigate } from "react-router-dom";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/hooks/auth/useAuth";

/** /login — already signed in -> go to /. */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <LoadingSpinner className="min-h-dvh bg-background" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
