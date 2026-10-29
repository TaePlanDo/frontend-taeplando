import type { ReactNode } from "react";
import { WifiOff } from "lucide-react";

import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { PaginatedListState } from "@/hooks/pagination/listState";

type ListStateViewProps = {
  state: PaginatedListState;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
  isRetrying: boolean;
  emptyTitle: string;
  emptyMessage: string;
  children: ReactNode;
};

export function ListStateView({
  state,
  errorTitle,
  errorMessage,
  onRetry,
  isRetrying,
  emptyTitle,
  emptyMessage,
  children,
}: ListStateViewProps) {
  if (state.kind === "unavailable" && state.reason === "offline") {
    return (
      <ErrorListView
        title="Brak połączenia z internetem"
        message="Połącz się z internetem i spróbuj ponownie"
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (state.kind === "unavailable") {
    return (
      <ErrorListView
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (state.kind === "loading") {
    return <LoadingSpinner className="h-92" />;
  }

  if (state.kind === "empty") {
    return <EmptyListView title={emptyTitle} message={emptyMessage} />;
  }

  if (state.kind === "stale") {
    return (
      <>
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
        >
          <WifiOff className="size-4 shrink-0" />
          {state.reason === "offline"
            ? "Brak połączenia — wyświetlane są ostatnio pobrane dane."
            : "Nie udało się odświeżyć listy — wyświetlane są ostatnio pobrane dane."}
        </div>
        {state.isEmpty ? (
          <EmptyListView title={emptyTitle} message={emptyMessage} />
        ) : (
          children
        )}
      </>
    );
  }

  return children;
}
