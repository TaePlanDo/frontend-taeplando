import { type SubmitEvent, useState } from "react";
import { toast } from "sonner";

import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { useAuth } from "@/hooks/auth/useAuth";
import { validateChangePassword } from "@/lib/validation/changePassword";

type ChangePasswordFormProps = {
  onClose: () => void;
};

export function ChangePasswordForm({ onClose }: ChangePasswordFormProps) {
  const { isChangingPassword, changePassword, changePasswordError } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const passwordError = validationError || changePasswordError;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateChangePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );

    setValidationError(error ?? "");

    if (error !== null) {
      return;
    }

    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Hasło zostało zaktualizowane");
      onClose();
    } catch {
      // Error message comes from useAuth().changePasswordError
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CustomizedInput
        label="Stare Hasło"
        name="oldPassword"
        type="password"
        value={oldPassword}
        onChange={(event) => setOldPassword(event.target.value)}
        disabled={isChangingPassword}
        showPasswordButton
      />
      <CustomizedInput
        label="Nowe Hasło"
        name="newPassword"
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        disabled={isChangingPassword}
        showPasswordButton
      />
      <CustomizedInput
        label="Powtórz Hasło"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        disabled={isChangingPassword}
        showPasswordButton
      />
      {passwordError ? (
        <InputErrorMessage message={passwordError} className="mx-2" />
      ) : null}
      <CustomizedButton
        type="submit"
        variant="outline"
        className="w-2/3 mx-auto mt-8"
        disabled={isChangingPassword}
      >
        Zmień hasło
      </CustomizedButton>
    </form>
  );
}
