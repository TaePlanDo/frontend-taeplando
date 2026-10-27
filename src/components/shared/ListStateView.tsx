import type { ReactNode } from "react";

import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

type ListStateViewProps = {
  isError: boolean;
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
  if (isError) {
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

  return children;
}
