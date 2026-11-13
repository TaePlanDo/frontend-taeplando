import { useId } from "react";
import { Switch } from "@/components/ui/switch";

type CustomizedSwitchProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function CustomizedSwitch({
  label,
  checked,
  onCheckedChange,
  disabled,
}: CustomizedSwitchProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="text-sm font-medium peer-disabled:opacity-50"
      >
        {label}
      </label>
    </div>
  );
}
