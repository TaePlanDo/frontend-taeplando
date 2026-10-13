import { cn } from "@/lib/utils";

type InputErrorMessageProps = {
  message: string;
  className?: string;
};

export function InputErrorMessage({
  message,
  className,
}: InputErrorMessageProps) {
  return (
    <p className={cn("text-sm text-red-500", className)} role="alert">
      {message}
    </p>
  );
}
