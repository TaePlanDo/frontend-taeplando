import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";
import { Popover, ToggleGroup } from "radix-ui";

import { DROPDOWN_SPACING } from "@/lib/constants/dropdown";
import { useDropdownCollisionPadding } from "@/hooks/useDropdownCollisionPadding";

import { SelectedAttributeBadges } from "./SelectedAttributeBadges";
import { InputErrorMessage } from "./InputErrorMessage";

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
  const collisionPadding = useDropdownCollisionPadding();
  const [open, setOpen] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const unavailable = Boolean(disabled || isLoading || unavailableMessage);
  const canOpen = !unavailable && items.length > 0;
  useEffect(() => {
    if (!canOpen) setOpen(false);
  }, [canOpen]);
  const selected = selectedIds.map(
    (id) =>
      items.find((item) => String(item.id) === id) ?? {
        id,
        name: `Niedostępny element (${id})`,
      },
  );

  return (
    <div
      className={className}
      onPointerDownCapture={() => setKeyboardNavigation(false)}
      onKeyDownCapture={() => setKeyboardNavigation(true)}
    >
      <div className="flex flex-col gap-1">
        <Popover.Root modal open={open && canOpen} onOpenChange={setOpen}>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={id}
              className={cn(
                "text-sm font-medium text-foreground",
                labelClassName,
              )}
            >
              {label}
            </label>
            <Popover.Trigger asChild>
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
                    setOpen(true);
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
                <ChevronDown
                  className="size-4 shrink-0 opacity-60"
                  aria-hidden
                />
              </button>
            </Popover.Trigger>
          </div>
          <Popover.Portal>
            <Popover.Content
              id={`${id}-popup`}
              aria-describedby={undefined}
              align="start"
              sideOffset={DROPDOWN_SPACING}
              collisionPadding={collisionPadding}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                const option =
                  list.current?.querySelector<HTMLButtonElement>(
                    '[aria-selected="true"]',
                  ) ??
                  list.current?.querySelector<HTMLButtonElement>(
                    '[role="option"]',
                  );
                option?.focus({ preventScroll: true });
                if (list.current && option)
                  list.current.scrollTop = option.offsetTop;
              }}
              className="dropdown-panel-height z-50 flex w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none [--dropdown-available-height:var(--radix-popover-content-available-height)]"
            >
              <Popover.Title className="sr-only">{label}</Popover.Title>
              <ToggleGroup.Root
                ref={list}
                type="multiple"
                value={selectedIds}
                onValueChange={onSelectedIdsChange}
                disabled={!canOpen}
                id={`${id}-options`}
                role="listbox"
                aria-label={label}
                aria-multiselectable="true"
                orientation="vertical"
                loop
                className="relative min-h-0 overflow-y-auto overscroll-contain outline-none"
              >
                {items.map((item, index) => {
                  const selected = selectedIds.includes(String(item.id));
                  const previous = items[index - 1];
                  const next = items[index + 1];
                  const joinsPrevious =
                    previous && selectedIds.includes(String(previous.id));
                  const joinsNext =
                    next && selectedIds.includes(String(next.id));
                  return (
                    <ToggleGroup.Item
                      key={item.id}
                      value={String(item.id)}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      aria-pressed={undefined}
                      className={cn(
                        "block min-h-8 w-full rounded-md border bg-linear-to-r from-transparent to-transparent px-2 py-1 text-left text-sm break-words outline-none transition-[border-color,--tw-gradient-from,--tw-gradient-to] duration-150 ease-out motion-reduce:transition-none",
                        selected
                          ? "rounded-none border-x-primary border-y-transparent from-primary/25 to-primary-foreground/20"
                          : "border-transparent",
                        selected &&
                          !joinsPrevious &&
                          "rounded-t-md border-t-primary",
                        selected &&
                          !joinsNext &&
                          "rounded-b-md border-b-primary",
                        selected && joinsPrevious && "border-t-primary/20",
                        keyboardNavigation &&
                          "focus:outline-solid focus:outline-1 focus:-outline-offset-4 focus:outline-primary",
                      )}
                    >
                      {item.name}
                    </ToggleGroup.Item>
                  );
                })}
              </ToggleGroup.Root>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {error ? (
          <InputErrorMessage id={`${id}-error`} message={error} />
        ) : null}
        <SelectedAttributeBadges
          items={selected}
          disabled={unavailable}
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
