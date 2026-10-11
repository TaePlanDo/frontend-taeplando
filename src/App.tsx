import { Navigate, Route, Routes } from "react-router-dom";

import { AuthorizedLayout } from "@/components/layout/AuthorizedLayout";
import { HealthCheckPage } from "@/pages/HealthCheckPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RedirectIfAuth } from "@/routes/RedirectIfAuth";
import { RequireAuth } from "@/routes/RequireAuth";

export function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AuthorizedLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/healthcheck" element={<HealthCheckPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
