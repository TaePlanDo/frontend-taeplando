import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { useAuth } from "@/hooks/auth/useAuth";

type ChangeUsernameFormProps = {
  onClose: () => void;
};

export function ChangeUsernameForm({ onClose }: ChangeUsernameFormProps) {
  const { user, isUpdatingName, updateName, updateNameError } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.full_name ?? "");
    }
  }, [user]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateName(username);
      toast.success("Dane zostały zaktualizowane");
      onClose();
    } catch {
      // Error message comes from useAuth().updateNameError
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CustomizedInput
        label="Nazwa użytkownika"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        disabled={isUpdatingName}
      />
      {updateNameError ? (
        <InputErrorMessage message={updateNameError} className="mx-2" />
      ) : null}
      <CustomizedButton
        type="submit"
        variant="outline"
        className="w-2/3 mx-auto mt-8"
        disabled={isUpdatingName}
      >
        Zmień dane
      </CustomizedButton>
    </form>
  );
}
