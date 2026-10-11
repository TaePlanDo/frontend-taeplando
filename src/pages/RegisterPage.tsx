import { AuthHeader } from "@/components/auth/AuthHeader";
import { Logo } from "@/components/ui/logo";
import { AuthInput } from "@/components/auth/AuthInput";
import { type SubmitEvent, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validatePassword() {
    if (password.length < 8) {
      setPasswordError("Hasło musi mieć co najmniej 8 znaków");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Hasła nie są zgodne");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Hasło musi zawierać co najmniej jedną cyfrę");
      return false;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setPasswordError("Hasło musi zawierać co najmniej jedną literę");
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setPasswordError("Hasło musi zawierać co najmniej jeden znak specjalny");
      return false;
    }
    setPasswordError("");
    return true;
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const isPasswordValid = validatePassword();
    if (isPasswordValid) {
      console.log("Formularz jest poprawny");
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
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                required
                minLength={8}
              />
              {passwordError && (
                <p role="alert" className="text-sm text-red-400">
                  {passwordError}
                </p>
              )}
            </div>
            <AuthInput
              label="Potwierdź hasło"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Potwierdź swoje hasło"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            <AuthButton type="submit">Zarejestruj się</AuthButton>
          </form>
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
