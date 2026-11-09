import {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ListFilter } from "lucide-react";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { FilterCatalogs, FilterDimension } from "@/lib/filters/definition";

type ListFiltersSheetProps<F extends Record<string, unknown>> = {
  title: string;
  buttonLabel: string;
  filterCount: number;
  filters: F;
  onApply: (filters: F) => void;
  dimensions: FilterDimension<F>[];
  catalogs: FilterCatalogs;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  header?: ReactNode;
  children?: (draft: F, setDraft: Dispatch<SetStateAction<F>>) => ReactNode;
};

export function ListFiltersSheet<F extends Record<string, unknown>>({
  title,
  buttonLabel,
  filterCount,
  filters,
  onApply,
  dimensions,
  catalogs,
  isLoading,
  isError,
  onRetry,
  header,
  children,
}: ListFiltersSheetProps<F>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  return (
    <CustomizedSheet
      open={open}
      onOpenChange={setOpen}
      title={title}
      trigger={
        <CustomizedButton
          type="button"
          variant="outline"
          className="relative w-full gap-2 sm:w-auto"
        >
          <ListFilter className="size-4" />
          {buttonLabel}
          {filterCount > 0 ? (
            <Badge
              variant="default"
              className="ml-1 min-w-5 justify-center rounded-full px-1.5 py-0 text-xs text-white"
            >
              {filterCount}
            </Badge>
          ) : null}
        </CustomizedButton>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="flex flex-col gap-6 pb-2">
            {header}
            {dimensions.map(({ key, label, fields, range }) => {
              if (!label) return null;
              const [first, last] = fields;
              if (range) {
                return (
                  <DualRangeField
                    key={key}
                    label={label}
                    min={range.min}
                    max={range.max}
                    value={[
                      (draft[first.key] as number) ?? range.min,
                      (draft[last.key] as number) ?? range.max,
                    ]}
                    onValueChange={([min, max]) =>
                      setDraft((current) => ({
                        ...current,
                        [first.key]: min,
                        [last.key]: max,
                      }))
                    }
                  />
                );
              }
              return (
                <CatalogMultiSelect
                  key={key}
                  label={label}
                  items={catalogs[key] ?? []}
                  selectedIds={((draft[first.key] as unknown[]) ?? []).map(
                    String,
                  )}
                  onSelectedIdsChange={(ids) =>
                    setDraft((current) => ({
                      ...current,
                      [first.key]:
                        first.kind === "intCsv" ? ids.map(Number) : ids,
                    }))
                  }
                  isLoading={isLoading}
                  unavailableMessage={
                    isError ? "Katalog niedostępny" : undefined
                  }
                />
              );
            })}
            {isError ? (
              <div className="text-sm text-destructive" role="alert">
                Nie udało się pobrać dostępnych filtrów.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={onRetry}
                >
                  Spróbuj ponownie
                </button>
              </div>
            ) : null}
            {children?.(draft, setDraft)}
          </div>
        </ScrollArea>
        <div className="-mx-6 mt-auto flex shrink-0 flex-col gap-3 border-t bg-background px-6 pt-4">
          <CustomizedButton
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => {
              onApply(draft);
              if (!isDesktop) setOpen(false);
            }}
          >
            Zastosuj filtry
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              setDraft(
                Object.fromEntries(
                  Object.entries(filters).filter(([key]) => key === "name"),
                ) as F,
              )
            }
          >
            Wyczyść
          </CustomizedButton>
        </div>
      </div>
    </CustomizedSheet>
  );
}
