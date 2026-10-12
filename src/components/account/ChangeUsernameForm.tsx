import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";

import { ButtonOutlined } from "@/components/shared/ButtonOutlined";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "../shared/InputErrorMessage";

type ChangeUsernameFormProps = {
  currentUsername?: string;
  onClose?: () => void;
};

export function ChangeUsernameForm({
  currentUsername = "",
  onClose,
}: ChangeUsernameFormProps) {
  const [username, setUsername] = useState(currentUsername);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username !== currentUsername) {
      toast.success("Dane zostały zaktualizowane");
    }

    onClose?.();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CustomizedInput
        label="Nazwa użytkownika"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <InputErrorMessage
        message="Nazwa użytkownika nie może zawierać spacji."
        className="mx-2"
      />
      <ButtonOutlined
        type="submit"
        tone="default"
        size="lg"
        className="w-2/3 mx-auto mt-8"
      >
        Zmień dane
      </ButtonOutlined>
    </form>
  );
}
