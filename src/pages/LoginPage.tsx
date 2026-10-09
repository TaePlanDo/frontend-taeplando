import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AuthButton } from "@/components/auth/AuthButton";
import { AuthGoogleButton } from "@/components/auth/AuthGoogleButton";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthInput } from "@/components/auth/AuthInput";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoggingIn, loginError: authLoginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginError =
    authLoginError ??
    (searchParams.get("error") === "oauth"
      ? "Logowanie przez Google nie powiodło się"
      : null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch {
      // Polish message comes from useAuth().loginError
    }
  }

  return (
    <div className="flex min-h-dvh bg-[#181818] text-white">
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-88 flex-col">
          <Logo
            className="mx-auto mb-3 h-28 w-auto max-h-[24vh] lg:hidden"
            aria-hidden
          />
          <AuthHeader />

          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <AuthInput
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jan.kowalski@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <AuthInput
              label="Hasło"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />

            {loginError ? (
              <p role="alert" className="text-sm text-red-300">
                {loginError}
              </p>
            ) : null}

            <AuthButton type="submit" disabled={isLoggingIn} className="mt-2">
              Zaloguj się
            </AuthButton>
          </form>

          <AuthGoogleButton disabled={isLoggingIn} className="mt-3" />

          <p className="mt-4 w-full text-center text-base leading-snug">
            Nie posiadasz konta?{" "}
            <a href="/register" className="font-medium text-[#EC6212]">
              Zarejestruj się już teraz
            </a>
          </p>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Logo
          className="h-auto max-h-[min(420px,70vh)] w-[420px]"
          aria-hidden
        />
      </div>
    </div>
  );
}
