import type { ReactNode } from "react";

import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

type CenteredStatusProps = {
  title?: string;
  message: string;
  actions?: ReactNode;
};

export function CenteredStatus({
  title,
  message,
  actions,
}: CenteredStatusProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      {title ? (
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      ) : null}
      <p className="max-w-md text-base text-muted-foreground">{message}</p>
      {actions}
    </div>
  );
}

type CenteredLoadingProps = {
  label: string;
};

export function CenteredLoading({ label }: CenteredLoadingProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <LoadingSpinner label={label} size="lg" />
    </div>
  );
}
