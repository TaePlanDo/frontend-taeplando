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
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col gap-4 p-6 border-2 rounded-lg lg:w-full w-92 max-w-2xl">
        <h1 className="text-2xl font-semibold">Dane użytkownika</h1>
        <Separator className="w-full" />
        <PersonalDataItem
          title="Nazwa użytkownika"
          value={user?.full_name ?? ""}
        />
        {isLocal ? (
          <div className="flex flex-row gap-4">
            <CustomizedDialog
              trigger={<CustomizedButton>Zmień nazwę</CustomizedButton>}
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
              trigger={<CustomizedButton>Zmień hasło</CustomizedButton>}
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
        <PersonalDataItem title="Email" value={user?.email ?? ""} />
        <CustomizedButton
          variant="danger"
          className="w-full max-w-64"
          onClick={() => void logout()}
          disabled={isLoggingOut}
        >
          Wyloguj się
        </CustomizedButton>
      </div>
    </div>
  );
}
