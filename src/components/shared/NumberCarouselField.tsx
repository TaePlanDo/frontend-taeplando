import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type Ref,
} from "react";

import { InputErrorMessage } from "./InputErrorMessage";

type Props = {
  label: string;
  min: number;
  max: number;
  step: number;
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
  step,
  value,
  onValueChange,
  onBlur,
  fieldRef,
  disabled,
  error,
}: Props) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const scrolledIndex = useRef<number | null>(null);
  const options = useMemo(() => {
    const values = Array.from(
      { length: Math.floor((max - min) / step) + 1 },
      (_, index) => min + index * step,
    );
    // Keep a previously saved, off-step value selectable without rounding it.
    if (
      Number.isInteger(value) &&
      value >= min &&
      value <= max &&
      !values.includes(value)
    ) {
      values.push(value);
      values.sort((a, b) => a - b);
    }
    return values;
  }, [min, max, step, value]);
  const selectedIndex = options.indexOf(value);
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
    if (scrolledIndex.current === selectedIndex) {
      scrolledIndex.current = null;
      return;
    }
    const container = viewport.current;
    const option = buttons.current[selectedIndex];
    if (container && option) {
      container.scrollLeft =
        option.offsetLeft - (container.clientWidth - option.clientWidth) / 2;
    }
  }, [selectedIndex, options]);

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
          aria-valuemin={options[0]}
          aria-valuemax={options[options.length - 1]}
          aria-valuenow={value}
          aria-disabled={Boolean(disabled)}
          aria-invalid={Boolean(error)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (disabled) return;
            const targets: Partial<Record<string, number>> = {
              ArrowRight: selectedIndex + 1,
              ArrowUp: selectedIndex + 1,
              ArrowLeft: selectedIndex - 1,
              ArrowDown: selectedIndex - 1,
              Home: 0,
              End: options.length - 1,
            };
            const index = targets[event.key];
            if (index == null) return;
            event.preventDefault();
            scrolledIndex.current = null;
            onValueChange(
              options[Math.min(options.length - 1, Math.max(0, index))],
            );
          }}
          className={`relative flex w-full min-w-0 snap-x snap-mandatory gap-1 rounded-lg border border-input bg-background/40 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${disabled ? "overflow-x-hidden opacity-50" : "overflow-x-auto"}`}
          style={{ paddingInline: "calc(50% - 1.5rem)" }}
          onScroll={() => {
            const container = viewport.current;
            if (!container || disabled) return;
            const [first, second] = buttons.current;
            if (!first || !second) return;
            const spacing = second.offsetLeft - first.offsetLeft;
            if (!spacing) return;
            const index = Math.round(
              (container.scrollLeft +
                container.clientWidth / 2 -
                first.offsetLeft -
                first.clientWidth / 2) /
                spacing,
            );
            const next =
              options[Math.min(options.length - 1, Math.max(0, index))];
            if (next !== value) {
              scrolledIndex.current = options.indexOf(next);
              onValueChange(next);
            }
          }}
        >
          {options.map((option, index) => (
            <button
              key={option}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                scrolledIndex.current = null;
                onValueChange(option);
                viewport.current?.focus({ preventScroll: true });
              }}
              className={`flex h-10 w-12 shrink-0 snap-center items-center justify-center rounded-md border text-lg ${value === option ? "border-primary bg-primary/20 font-semibold text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              {option}
            </button>
          ))}
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
