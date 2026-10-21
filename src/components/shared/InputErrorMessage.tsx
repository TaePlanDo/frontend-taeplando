import { cn } from "cn";

type InputErrorMessageProps = {
  message: string;
  className?: string;
};

export function InputErrorMessage({
  message,
  className,
}: InputErrorMessageProps) {
  return (
    <p className={cn("text-sm text-destructive", className)} role="alert">
      {message}
    </p>
  );
}
