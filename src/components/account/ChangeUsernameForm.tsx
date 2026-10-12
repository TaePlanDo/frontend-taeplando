import { type SubmitEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ButtonOutlined } from "@/components/shared/ButtonOutlined";
import { CustomizedInput } from "@/components/shared/CustomizedInput";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { fetchMe, meKey, updateMeRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

type ChangeUsernameFormProps = {
  onClose: () => void;
};

const refreshMeKey = ["auth", "me", "change-username"] as const;

function updateNameErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status !== 401 && error.status < 500) {
    return "Niepoprawna nazwa użytkownika";
  }
  return "Spróbuj ponownie poźniej, wystąpił błąd.";
}

export function ChangeUsernameForm({ onClose }: ChangeUsernameFormProps) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");

  const meQuery = useQuery({
    queryKey: refreshMeKey,
    queryFn: fetchMe,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUsername(meQuery.data.full_name ?? "");
    }
  }, [meQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (fullName: string) => updateMeRequest(fullName),
    onSuccess: (user) => {
      queryClient.setQueryData(meKey, user);
      toast.success("Dane zostały zaktualizowane");
      onClose();
    },
  });

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    updateMutation.mutate(username);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <CustomizedInput
        label="Nazwa użytkownika"
        name="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        disabled={meQuery.isPending}
      />
      {updateMutation.isError ? (
        <InputErrorMessage
          message={updateNameErrorMessage(updateMutation.error)}
          className="mx-2"
        />
      ) : null}
      <ButtonOutlined
        type="submit"
        tone="default"
        size="lg"
        className="w-2/3 mx-auto mt-8"
        disabled={meQuery.isPending || updateMutation.isPending}
      >
        Zmień dane
      </ButtonOutlined>
    </form>
  );
}
