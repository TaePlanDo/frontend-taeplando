import { TriangleAlert } from "lucide-react";

import { ButtonCustomized } from "@/components/shared/ButtonCustomized";
import { EmptyListView } from "@/components/shared/EmptyListView";

type ErrorListViewProps = {
  title: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function ErrorListView({
  title,
  message,
  onRetry,
  isRetrying = false,
}: ErrorListViewProps) {
  return (
    <div role="alert">
      <EmptyListView
        title={title}
        message={message}
        icon={<TriangleAlert className="h-12 w-12 text-[#F27229]/80" />}
      >
        <ButtonCustomized
          type="button"
          className="mt-2 max-w-48 text-sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? "Ponawianie…" : "Spróbuj ponownie"}
        </ButtonCustomized>
      </EmptyListView>
    </div>
  );
}
