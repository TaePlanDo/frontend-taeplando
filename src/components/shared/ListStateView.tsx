import type { ReactNode } from "react";
import { WifiOff } from "lucide-react";

import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

type ListStateViewProps = {
  isError: boolean;
  isOffline: boolean;
  hasData: boolean;
  isLoading: boolean;
  isEmpty: boolean;
  errorTitle: string;
  errorMessage: string;
  onRetry: () => void;
  isRetrying: boolean;
  emptyTitle: string;
  emptyMessage: string;
  children: ReactNode;
};

export function ListStateView({
  isError,
  isOffline,
  hasData,
  isLoading,
  isEmpty,
  errorTitle,
  errorMessage,
  onRetry,
  isRetrying,
  emptyTitle,
  emptyMessage,
  children,
}: ListStateViewProps) {
  if (!hasData && isOffline) {
    return (
      <ErrorListView
        title="Brak połączenia z internetem"
        message="Połącz się z internetem i spróbuj ponownie"
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (!hasData && isError) {
    return (
      <ErrorListView
        title={errorTitle}
        message={errorMessage}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner className="h-92" />;
  }

  if (isEmpty) {
    return <EmptyListView title={emptyTitle} message={emptyMessage} />;
  }

  if (isOffline || isError) {
    return (
      <>
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary"
        >
          <WifiOff className="size-4 shrink-0" />
          {isOffline
            ? "Brak połączenia — wyświetlane są ostatnio pobrane dane."
            : "Nie udało się odświeżyć listy — wyświetlane są ostatnio pobrane dane."}
        </div>
        {children}
      </>
    );
  }

  return children;
}
