import { useId } from "react";
import { cn } from "cn";
import { InputErrorMessage } from "./InputErrorMessage";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CustomizedSelectOption = {
  value: string;
  label: string;
};

type CustomizedSelectProps = {
  id?: string;
  label: string;
  placeholder?: string;
  options: CustomizedSelectOption[];
  value?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  error?: string;
  onValueChange: (value: string) => void;
};

export function CustomizedSelect({
  id,
  label,
  placeholder,
  options,
  value,
  disabled,
  className,
  labelClassName,
  error,
  onValueChange,
}: CustomizedSelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={selectId}
        className={cn("text-sm font-medium text-foreground", labelClassName)}
      >
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={selectId}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <InputErrorMessage id={`${selectId}-error`} message={error} />
      ) : null}
    </div>
  );
}
