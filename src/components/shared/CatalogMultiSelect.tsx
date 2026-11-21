import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

import { SelectedAttributeBadges } from "./SelectedAttributeBadges";
import { InputErrorMessage } from "./InputErrorMessage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type CatalogItem = {
  id: string | number;
  name: string;
};

type CatalogMultiSelectProps = {
  label: string;
  placeholder?: string;
  items: CatalogItem[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  disabled?: boolean;
  isLoading?: boolean;
  unavailableMessage?: string;
  className?: string;
  labelClassName?: string;
  error?: string;
};

export function CatalogMultiSelect({
  label,
  placeholder = "Wybierz z listy…",
  items,
  selectedIds,
  onSelectedIdsChange,
  disabled,
  isLoading,
  unavailableMessage,
  className,
  labelClassName,
  error,
}: CatalogMultiSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const unavailable = disabled || isLoading || Boolean(unavailableMessage);
  const canOpen = !unavailable && items.length > 0;
  const toggle = (id: string) =>
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  const selected = selectedIds.map(
    (id) =>
      items.find((item) => String(item.id) === id) ?? {
        id,
        name: `Niedostępny element (${id})`,
      },
  );
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next)
      setActiveIndex(
        Math.max(
          0,
          items.findIndex((item) => selectedIds.includes(String(item.id))),
        ),
      );
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className={cn("text-sm font-medium text-foreground", labelClassName)}
        >
          {label}
        </label>
        <Dialog open={open && canOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button
              id={id}
              type="button"
              role="combobox"
              aria-haspopup="dialog"
              aria-controls={`${id}-popup`}
              aria-expanded={open && canOpen}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
              disabled={!canOpen}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  handleOpenChange(true);
                }
              }}
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="min-w-0 truncate text-muted-foreground">
                {unavailableMessage
                  ? unavailableMessage
                  : isLoading
                    ? "Ładowanie…"
                    : items.length === 0
                      ? "Brak dostępnych elementów"
                      : selectedIds.length > 0
                        ? `Wybrano: ${selectedIds.length}`
                        : placeholder}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
            </button>
          </DialogTrigger>
          <DialogContent
            id={`${id}-popup`}
            aria-describedby={undefined}
            showCloseButton={false}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              list.current?.focus({ preventScroll: true });
              optionRefs.current[activeIndex]?.scrollIntoView({
                block: "nearest",
              });
            }}
            className="dropdown-panel-height !top-[max(5rem,12.5dvh)] !block !w-[calc(100vw-2rem)] !max-w-96 !translate-y-0 !p-1 rounded-lg border-border bg-popover text-popover-foreground shadow-xl sm:!top-[max(5rem,25dvh)] sm:!max-w-lg"
          >
            <DialogTitle className="sr-only">{label}</DialogTitle>
            <div
              ref={list}
              id={`${id}-options`}
              role="listbox"
              aria-label={label}
              aria-multiselectable="true"
              aria-activedescendant={
                items[activeIndex] ? `${id}-option-${activeIndex}` : undefined
              }
              tabIndex={0}
              className="group h-full overflow-y-auto overscroll-contain outline-none"
              onKeyDown={(event) => {
                let next = activeIndex;
                if (event.key === "ArrowDown")
                  next = (activeIndex + 1) % items.length;
                else if (event.key === "ArrowUp")
                  next = (activeIndex - 1 + items.length) % items.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = items.length - 1;
                else if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  const item = items[activeIndex];
                  if (item) toggle(String(item.id));
                  return;
                } else return;
                event.preventDefault();
                setActiveIndex(next);
                optionRefs.current[next]?.scrollIntoView({
                  block: "nearest",
                });
              }}
            >
              {items.map((item, index) => {
                const selected = selectedIds.includes(String(item.id));
                const previous = items[index - 1];
                const next = items[index + 1];
                const joinsPrevious =
                  previous && selectedIds.includes(String(previous.id));
                const joinsNext = next && selectedIds.includes(String(next.id));
                return (
                  <button
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    key={item.id}
                    id={`${id}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setActiveIndex(index);
                      toggle(String(item.id));
                      list.current?.focus({ preventScroll: true });
                    }}
                    className={cn(
                      "block min-h-8 w-full rounded-md border bg-linear-to-r from-transparent to-transparent px-2 py-1 text-left text-sm break-words transition-[border-color,--tw-gradient-from,--tw-gradient-to] duration-150 ease-out motion-reduce:transition-none",
                      selected
                        ? "rounded-none border-x-primary border-y-transparent from-primary/25 to-primary-foreground/20"
                        : "border-transparent",
                      selected &&
                        !joinsPrevious &&
                        "rounded-t-md border-t-primary",
                      selected && !joinsNext && "rounded-b-md border-b-primary",
                      selected && joinsPrevious && "border-t-primary/20",
                      index === activeIndex &&
                        "group-focus-visible:outline-1 group-focus-visible:-outline-offset-4 group-focus-visible:outline-primary",
                    )}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        {error ? (
          <InputErrorMessage id={`${id}-error`} message={error} />
        ) : null}
        <SelectedAttributeBadges
          items={selected}
          disabled={disabled || isLoading || Boolean(unavailableMessage)}
          onRemove={(id) =>
            onSelectedIdsChange(
              selectedIds.filter((selectedId) => selectedId !== String(id)),
            )
          }
        />
      </div>
    </div>
  );
}
