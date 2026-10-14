import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CustomizedInputProps = ComponentProps<typeof Input> & {
  label: string;
  showPasswordButton?: boolean;
};

export function CustomizedInput({
  label,
  id,
  className,
  type,
  showPasswordButton = false,
  disabled,
  ...props
}: CustomizedInputProps) {
  const inputId = id ?? props.name;
  const [isVisible, setIsVisible] = useState(false);

  const isPasswordField = showPasswordButton && type === "password";
  const resolvedType = isPasswordField && isVisible ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5 text-base">
      <label htmlFor={inputId}>{label}</label>
      <div className="relative">
        <Input
          id={inputId}
          type={resolvedType}
          className={cn(
            "h-11 rounded-xl border-0 bg-[#FFC7B3] px-4 text-base text-[#1a1a1a] shadow-none placeholder:text-[#1a1a1a]/55 focus-visible:outline-[#EC6212]",
            isPasswordField && "pr-11",
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
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#1a1a1a]/60 transition-colors hover:text-[#1a1a1a] focus-visible:outline-[#EC6212]"
          >
            {isVisible ? (
              <EyeOff className="size-5" aria-hidden />
            ) : (
              <Eye className="size-5" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
