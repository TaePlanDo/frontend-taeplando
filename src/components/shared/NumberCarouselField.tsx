import { useCallback, useId, useLayoutEffect, useRef, type Ref } from "react";

import { InputErrorMessage } from "./InputErrorMessage";

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  onBlur?: () => void;
  fieldRef?: Ref<HTMLDivElement>;
  disabled?: boolean;
  error?: string;
};

export function NumberCarouselField({
  label,
  min,
  max,
  value,
  onValueChange,
  onBlur,
  fieldRef,
  disabled,
  error,
}: Props) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const scrolledValue = useRef<number | null>(null);
  const setViewport = useCallback(
    (element: HTMLDivElement | null) => {
      viewport.current = element;
      if (typeof fieldRef === "function") fieldRef(element);
      else if (fieldRef) fieldRef.current = element;
    },
    [fieldRef],
  );

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
    <div className="min-w-0">
      <span id={`${id}-label`} className="mb-2 block text-sm font-medium">
        {label}
      </span>
      <div className="relative">
        <div
          ref={setViewport}
          role="spinbutton"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-disabled={Boolean(disabled)}
          aria-invalid={Boolean(error)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (disabled) return;
            const next = (
              {
                ArrowRight: value + 1,
                ArrowUp: value + 1,
                ArrowLeft: value - 1,
                ArrowDown: value - 1,
                Home: min,
                End: max,
              } as Record<string, number>
            )[event.key];
            if (next == null) return;
            event.preventDefault();
            scrolledValue.current = null;
            onValueChange(Math.min(max, Math.max(min, next)));
          }}
          className={`relative flex w-full min-w-0 snap-x snap-mandatory gap-1 rounded-lg border border-input bg-background/40 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${disabled ? "overflow-x-hidden opacity-50" : "overflow-x-auto"}`}
          style={{ paddingInline: "calc(50% - 1.5rem)" }}
          onScroll={() => {
            const container = viewport.current;
            if (!container || disabled) return;
            const first = container.children[0] as HTMLElement;
            const second = container.children[1] as HTMLElement | undefined;
            if (!second) return;
            const spacing = second.offsetLeft - first.offsetLeft;
            if (!spacing) return;
            const index = Math.round(
              (container.scrollLeft +
                container.clientWidth / 2 -
                first.offsetLeft -
                first.clientWidth / 2) /
                spacing,
            );
            const next = Math.min(max, Math.max(min, min + index));
            if (next !== value) {
              scrolledValue.current = next;
              onValueChange(next);
            }
          }}
        >
          {Array.from({ length: max - min + 1 }, (_, index) => {
            const option = min + index;
            return (
              <button
                key={option}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  scrolledValue.current = null;
                  onValueChange(option);
                  viewport.current?.focus({ preventScroll: true });
                }}
                className={`flex h-10 w-12 shrink-0 snap-center items-center justify-center rounded-md border text-lg ${value === option ? "border-primary bg-primary/20 font-semibold text-foreground" : "border-transparent text-muted-foreground"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-px left-px w-1/4 rounded-l-lg bg-linear-to-r from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-px right-px w-1/4 rounded-r-lg bg-linear-to-l from-background to-transparent"
        />
      </div>
      <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">
        Przesuń, aby wybrać
      </p>
      {error ? <InputErrorMessage id={`${id}-error`} message={error} /> : null}
    </div>
  );
}
