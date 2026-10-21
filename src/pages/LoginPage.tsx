import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthGoogleButton } from "@/components/auth/AuthGoogleButton";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/hooks/auth/useAuth";

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
    <div className="flex min-h-dvh bg-background text-foreground">
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
            <CustomizedInput
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jan.kowalski@gmail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <CustomizedInput
              label="Hasło"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              showPasswordButton
            />

            {loginError ? <InputErrorMessage message={loginError} /> : null}

            <CustomizedButton
              type="submit"
              variant="primary"
              disabled={isLoggingIn}
              className="mt-2"
            >
              Zaloguj się
            </CustomizedButton>
          </form>

          <AuthGoogleButton disabled={isLoggingIn} className="mt-3" />

          <p className="mt-4 w-full text-center text-base leading-snug">
            Nie posiadasz konta?{" "}
            <Link to="/register" className="font-medium text-primary">
              Zarejestruj się już teraz
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Logo
          className="h-auto max-h-[min(420px,70vh)] w-[420px]"
          aria-hidden
          shadow
        />
      </div>
    </div>
  );
}
