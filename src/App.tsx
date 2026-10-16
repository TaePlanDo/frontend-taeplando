import { Navigate, Route, Routes } from "react-router-dom";

import { AuthorizedLayout } from "@/components/layout/AuthorizedLayout";
import { Toaster } from "@/components/ui/sonner";
import { AccountPage } from "@/pages/AccountPage";
import { GroupListPage } from "@/pages/GroupListPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { RedirectIfAuth } from "@/routes/RedirectIfAuth";
import { RequireAuth } from "@/routes/RequireAuth";

export function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
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
          <Route path="/account" element={<AccountPage />} />
          <Route path="/groups" element={<GroupListPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster theme="dark" />
    </>
  );
}
