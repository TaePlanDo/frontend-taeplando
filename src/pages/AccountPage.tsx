import { LogOut } from "lucide-react";

import { ChangeUsernameForm } from "@/components/account/ChangeUsernameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { PersonalDataItem } from "@/components/account/PersonalDataItem";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";

export function AccountPage() {
  const { user, logout, isLoggingOut } = useAuth();

  const isLocal = user?.auth_method === "LOCAL";

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-3 py-6 sm:px-6">
      <section
        aria-labelledby="account-title"
        className="w-full min-w-0 max-w-md rounded-lg border border-foreground/20 bg-card px-5 sm:px-6"
      >
        <header className="border-b border-foreground/20 py-5">
          <h1 id="account-title" className="text-xl font-semibold">
            Dane użytkownika
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zarządzaj swoim kontem
          </p>
        </header>
        <dl className="min-w-0">
          <PersonalDataItem
            title="Nazwa użytkownika"
            value={user?.full_name ?? ""}
            edit={
              isLocal
                ? {
                    buttonLabel: "Zmień nazwę",
                    title: "Zmień nazwę użytkownika",
                    description: "Podaj nową nazwę użytkownika.",
                    Form: ChangeUsernameForm,
                  }
                : undefined
            }
          />
          <PersonalDataItem title="Email" value={user?.email ?? ""} />
          {isLocal ? (
            <PersonalDataItem
              title="Hasło"
              value="••••••••"
              edit={{
                buttonLabel: "Zmień hasło",
                title: "Zmień hasło",
                description: "Podaj nowe hasło.",
                Form: ChangePasswordForm,
              }}
            />
          ) : null}
        </dl>
        <footer className="flex justify-center py-5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-primary bg-transparent px-4 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary dark:bg-transparent dark:hover:bg-primary/10"
            onClick={() => void logout()}
            disabled={isLoggingOut}
          >
            <LogOut aria-hidden />
            Wyloguj się
          </Button>
        </footer>
      </section>
    </div>
  );
}
