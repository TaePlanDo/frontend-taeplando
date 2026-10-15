import { ChevronDown, ChevronUp } from "lucide-react";

type CustomizedInputArrowProps = {
  label: string;
  onStep: (direction: "up" | "down") => void;
  disabled?: boolean;
};

const arrowButtonClassName =
  "flex h-4.5 w-6 cursor-pointer items-center justify-center rounded-md text-[#1a1a1a]/60 transition-colors hover:bg-[#EC6212]/15 hover:text-[#EC6212] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#1a1a1a]/60";

export function CustomizedInputArrow({
  label,
  onStep,
  disabled,
}: CustomizedInputArrowProps) {
  return (
    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col">
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onStep("up")}
        disabled={disabled}
        aria-label={`Zwiększ ${label}`}
        className={arrowButtonClassName}
      >
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onStep("down")}
        disabled={disabled}
        aria-label={`Zmniejsz ${label}`}
        className={arrowButtonClassName}
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </div>
  );
}
