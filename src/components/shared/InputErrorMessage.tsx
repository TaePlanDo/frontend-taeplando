import { cn } from "cn";

type InputErrorMessageProps = {
  id?: string;
  message: string;
  className?: string;
};

export function InputErrorMessage({
  id,
  message,
  className,
}: InputErrorMessageProps) {
  return (
    <p
      id={id}
      className={cn("text-sm text-destructive", className)}
      role="alert"
    >
      {message}
    </p>
  );
}
