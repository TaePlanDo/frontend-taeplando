import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { CustomizedInputArrow } from "@/components/shared/CustomizedInputArrow";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type CustomizedInputProps = ComponentProps<typeof Input> & {
  label: string;
  showPasswordButton?: boolean;
  classNameLabel?: string;
  onValueChange?: (value: string) => void;
};

export function CustomizedInput({
  label,
  classNameLabel,
  id,
  className,
  type,
  showPasswordButton = false,
  disabled,
  onValueChange,
  ...props
}: CustomizedInputProps) {
  const inputId = id ?? props.name;
  const [isVisible, setIsVisible] = useState(false);

  const isPasswordField = showPasswordButton && type === "password";
  const isNumberField = type === "number";
  const resolvedType = isPasswordField && isVisible ? "text" : type;

  function changeNumber(direction: "up" | "down") {
    if (!onValueChange) {
      return;
    }

    const step = props.step != null ? Number(props.step) : 1;
    const parsed = Number(props.value ?? 0);
    const current = Number.isNaN(parsed) ? 0 : parsed;

    const min = props.min != null ? Number(props.min) : -Infinity;
    const max = props.max != null ? Number(props.max) : Infinity;

    const next = direction === "up" ? current + step : current - step;
    onValueChange(String(Math.min(Math.max(next, min), max)));
  }

  return (
    <div className="flex flex-col gap-1.5 text-base">
      <label htmlFor={inputId} className={classNameLabel}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={inputId}
          type={resolvedType}
          className={cn(
            "h-11 rounded-xl px-4 text-base text-foreground shadow-none placeholder:text-muted-foreground focus-visible:outline-primary selection:text-background",
            isPasswordField && "pr-11",
            isNumberField &&
              "pr-11 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            className,
          )}
          disabled={disabled}
          {...props}
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            disabled={disabled}
            aria-label={isVisible ? "Ukryj hasło" : "Pokaż hasło"}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-primary"
          >
            {isVisible ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        ) : null}
        {isNumberField ? (
          <CustomizedInputArrow
            label={label}
            onStep={changeNumber}
            disabled={disabled}
          />
        ) : null}
      </div>
    </div>
  );
}
