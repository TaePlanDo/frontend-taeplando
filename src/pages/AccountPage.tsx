import { useState } from "react";

import { ChangeUsernameForm } from "@/components/account/ChangeUsernameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { PersonalDataItem } from "@/components/account/PersonalDataItem";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/auth/useAuth";

export function AccountPage() {
  const { user, logout, isLoggingOut } = useAuth();
  const [isChangeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  const isLocal = user?.auth_method === "LOCAL";

  return (
    <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <section
        aria-labelledby="account-title"
        className="w-full min-w-0 max-w-2xl rounded-2xl border border-border bg-card p-4 text-center sm:p-8"
      >
        <div className="mx-auto flex w-full min-w-0 max-w-md flex-col gap-6">
          <h1 id="account-title" className="text-2xl font-semibold">
            Dane użytkownika
          </h1>
          <Separator className="w-full" />
          <dl className="flex min-w-0 flex-col gap-6">
            <PersonalDataItem
              title="Nazwa użytkownika"
              value={user?.full_name ?? ""}
            />
            <PersonalDataItem title="Email" value={user?.email ?? ""} />
          </dl>
          <Separator className="w-full" />
          {isLocal ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CustomizedDialog
                trigger={
                  <CustomizedButton className="w-full">
                    Zmień nazwę
                  </CustomizedButton>
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
              <CustomizedDialog
                trigger={
                  <CustomizedButton className="w-full">
                    Zmień hasło
                  </CustomizedButton>
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
            </div>
          ) : null}
          <CustomizedButton
            variant="danger"
            className="mx-auto w-full max-w-64"
            onClick={() => void logout()}
            disabled={isLoggingOut}
          >
            Wyloguj się
          </CustomizedButton>
        </div>
      </section>
    </div>
  );
}
