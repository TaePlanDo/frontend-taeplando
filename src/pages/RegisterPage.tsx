import { AuthHeader } from "@/components/auth/AuthHeader";
import { Logo } from "@/components/ui/logo";
import { AuthInput } from "@/components/auth/AuthInput";
import { type SubmitEvent, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthGoogleButton } from "@/components/auth/AuthGoogleButton";
import { validateRegistrationPassword } from "@/lib/validation/registration";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, registerError, isRegistering } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateRegistrationPassword(password, confirmPassword);

    setPasswordError(error ?? "");

    if (error !== null) {
      return;
    }

    try {
      await register({ email, password });
      navigate("/", { replace: true });
    } catch {
      // Polish message comes from useAuth().registerError
    }
  }

  return (
    <div className="flex min-h-dvh bg-[#181818] text-white">
      <div className="flex-1 flex items-center justify-center p-6">
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <AuthInput
                label="Hasło"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Podaj swoje hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(passwordError)}
                aria-describedby={
                  passwordError ? "registration-password-error" : undefined
                }
              />
              {passwordError && (
                <p
                  id="registration-password-error"
                  role="alert"
                  className="text-sm text-red-400"
                >
                  {passwordError}
                </p>
              )}
            </div>
            <AuthInput
              label="Powtórz hasło"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Powtórz swoje hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "registration-password-error" : undefined
              }
            />
            <AuthButton type="submit" disabled={isRegistering}>
              {isRegistering ? "Rejestrowanie..." : "Zarejestruj się"}
            </AuthButton>
            {registerError && (
              <p role="alert" className="text-sm text-red-400">
                {registerError}
              </p>
            )}
          </form>
          <AuthGoogleButton disabled={isRegistering} className="mt-3" />

          <p className="mt-4 w-full text-center text-base leading-snug">
            Masz już konto?{" "}
            <Link to="/login" className="font-medium text-[#EC6212]">
              Zaloguj się
            </Link>
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
