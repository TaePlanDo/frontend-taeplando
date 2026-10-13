import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CustomizedInputProps = ComponentProps<typeof Input> & {
  label: string;
};

export function CustomizedInput({
  label,
  id,
  className,
  ...props
}: CustomizedInputProps) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 text-base">
      {label}
      <Input
        id={inputId}
        className={cn(
          "h-11 rounded-xl border-0 bg-[#FFC7B3] px-4 text-base text-[#1a1a1a] shadow-none placeholder:text-[#1a1a1a] focus-visible:outline-[#EC6212]",
          className,
        )}
        {...props}
      />
    </label>
  );
}
