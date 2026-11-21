import { useId, useLayoutEffect, useRef, type Ref } from "react";

import { InputErrorMessage } from "./InputErrorMessage";

type Props = {
  label: string;
  name: string;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  disabled?: boolean;
  error?: string;
};

export function NumberCarouselField({
  label,
  name,
  min,
  max,
  value,
  onValueChange,
  onBlur,
  inputRef,
  disabled,
  error,
}: Props) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const scrolledValue = useRef<number | null>(null);

  useLayoutEffect(() => {
    // Preserve touch scrolling: a value selected by scrolling is already in place.
    if (scrolledValue.current === value) {
      scrolledValue.current = null;
      return;
    }
    const container = viewport.current;
    const option = container?.children[value - min] as HTMLElement | undefined;
    if (container && option) {
      container.scrollLeft =
        option.offsetLeft - (container.clientWidth - option.clientWidth) / 2;
    }
  }, [value, min]);

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
      aria-invalid={Boolean(error)}
      disabled={disabled}
      className="min-w-0"
    >
      <legend id={`${id}-label`} className="mb-2 text-sm font-medium">
        {label}
      </legend>
      <div
        ref={viewport}
        className={`relative flex w-full min-w-0 snap-x snap-mandatory gap-1 rounded-lg border border-input bg-background/40 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${disabled ? "overflow-x-hidden opacity-50" : "overflow-x-auto"}`}
        style={{ paddingInline: "calc(50% - 1.5rem)" }}
        onScroll={() => {
          const container = viewport.current;
          if (!container || disabled) return;
          const center = container.scrollLeft + container.clientWidth / 2;
          const options = Array.from(container.children) as HTMLElement[];
          const nearest = options.reduce((best, option) =>
            Math.abs(option.offsetLeft + option.clientWidth / 2 - center) <
            Math.abs(best.offsetLeft + best.clientWidth / 2 - center)
              ? option
              : best,
          );
          const next = min + options.indexOf(nearest);
          if (next !== value) {
            scrolledValue.current = next;
            onValueChange(next);
          }
        }}
      >
        {Array.from({ length: max - min + 1 }, (_, index) => {
          const option = min + index;
          return (
            <label
              key={option}
              className="w-12 shrink-0 snap-center cursor-pointer"
            >
              <input
                ref={option === min ? inputRef : undefined}
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => {
                  scrolledValue.current = null;
                  onValueChange(option);
                }}
                onBlur={onBlur}
                className="peer sr-only"
              />
              <span className="flex h-10 items-center justify-center rounded-md border border-transparent text-lg text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:font-semibold peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                {option}
              </span>
            </label>
          );
        })}
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
        Przesuń, aby wybrać
      </p>
      {error ? <InputErrorMessage id={`${id}-error`} message={error} /> : null}
    </fieldset>
  );
}
