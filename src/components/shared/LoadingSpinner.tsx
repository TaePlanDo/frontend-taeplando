import { cn } from "cn";

type LoadingSpinnerProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const spinnerSizes = {
  sm: "size-6 border-2",
  md: "size-10 border-2",
  lg: "size-16 border-4",
} as const;

export function LoadingSpinner({
  label = "Ładowanie…",
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary/30 border-t-primary [animation-duration:0.5s]",
          spinnerSizes[size],
        )}
        aria-hidden
      />
      <p className="text-base">{label}</p>
    </div>
  );
}
