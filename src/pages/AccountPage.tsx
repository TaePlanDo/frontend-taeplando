import { LogOut } from "lucide-react";
import { useState } from "react";

import { ChangeUsernameForm } from "@/components/account/ChangeUsernameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { PersonalDataItem } from "@/components/account/PersonalDataItem";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";

const changeButtonClass =
  "h-7 rounded-full border-primary bg-transparent px-4 text-xs hover:bg-primary/10 dark:border-primary dark:bg-transparent dark:hover:bg-primary/10";

export function AccountPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const [isChangeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

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
            action={
              isLocal ? (
                <CustomizedDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Zmień nazwę"
                      className={changeButtonClass}
                    >
                      Zmień
                    </Button>
                  }
                  title="Zmień nazwę użytkownika"
                  description="Podaj nową nazwę użytkownika."
                  open={isChangeUsernameOpen}
                  onOpenChange={setChangeUsernameOpen}
                >
                  <ChangeUsernameForm
                    onClose={() => setChangeUsernameOpen(false)}
                  />
                </CustomizedDialog>
              ) : null
            }
          />
          <PersonalDataItem title="Email" value={user?.email ?? ""} />
          {isLocal ? (
            <PersonalDataItem
              title="Hasło"
              value="••••••••"
              action={
                <CustomizedDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Zmień hasło"
                      className={changeButtonClass}
                    >
                      Zmień
                    </Button>
                  }
                  title="Zmień hasło"
                  description="Podaj nowe hasło."
                  open={isChangePasswordOpen}
                  onOpenChange={setChangePasswordOpen}
                >
                  <ChangePasswordForm
                    onClose={() => setChangePasswordOpen(false)}
                  />
                </CustomizedDialog>
              }
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
