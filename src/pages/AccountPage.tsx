import { useState } from "react";

import { ChangeUsernameForm } from "@/components/account/ChangeUsernameForm";
import { PersonalDataItem } from "@/components/account/PersonalDataItem";
import { ButtonOutlined } from "@/components/shared/ButtonOutlined";
import { DialogCustomized } from "@/components/shared/DialogCustomized";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export function AccountPage() {
  const { user } = useAuth();
  const [isChangeUsernameOpen, setChangeUsernameOpen] = useState(false);

  const isLocal = user?.auth_method === "LOCAL";

  return (
    <div className="flex min-h-dvh bg-[#181818] text-white justify-center items-center">
      <div className="flex flex-col gap-4 p-6 border-2 border-[#E5E5E5] rounded-lg lg:w-full w-92 max-w-2xl">
        <h1 className="text-2xl font-semibold">Dane użytkownika</h1>
        <Separator className="w-full" />
        <PersonalDataItem
          title="Nazwa użytkownika"
          value={user?.full_name ?? ""}
        />
        {isLocal ? (
          <div className="flex flex-row gap-4">
            <DialogCustomized
              trigger={<ButtonOutlined>Zmień nazwę</ButtonOutlined>}
              title="Zmień nazwę użytkownika"
              description="Podaj nową nazwę użytkownika."
              open={isChangeUsernameOpen}
              onOpenChange={setChangeUsernameOpen}
            >
              <ChangeUsernameForm
                onClose={() => setChangeUsernameOpen(false)}
              />
            </DialogCustomized>
            <ButtonOutlined>Zmień hasło</ButtonOutlined>
          </div>
        ) : null}
        <PersonalDataItem title="Email" value={user?.email ?? ""} />
        <ButtonOutlined tone="danger" className="w-full max-w-64">
          Wyloguj się
        </ButtonOutlined>
      </div>
    </div>
  );
}
