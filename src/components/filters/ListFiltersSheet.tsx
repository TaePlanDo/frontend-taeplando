import { useState, type ReactNode } from "react";
import { ListFilter } from "lucide-react";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { CustomizedSwitch } from "@/components/shared/CustomizedSwitch";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FilterCatalogs, FilterDimension } from "@/lib/filters/definition";

type ListFiltersSheetProps<F extends Record<string, unknown>> = {
  title: string;
  buttonLabel: string;
  filterCount: number;
  filters: F;
  onChange: (filters: F) => void;
  dimensions: FilterDimension<F>[];
  catalogs: FilterCatalogs;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  header?: ReactNode;
  children?: ReactNode;
};

export function ListFiltersSheet<F extends Record<string, unknown>>({
  title,
  buttonLabel,
  filterCount,
  filters,
  onChange,
  dimensions,
  catalogs,
  isLoading,
  isError,
  onRetry,
  header,
  children,
}: ListFiltersSheetProps<F>) {
  const [open, setOpen] = useState(false);

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
            {dimensions.map((dimension) => {
              if (dimension.kind === "text" || !dimension.label) return null;
              const { key, fields } = dimension;
              const label = dimension.label;
              const [first] = fields;
              if (dimension.kind === "switch") {
                return (
                  <CustomizedSwitch
                    key={key}
                    label={label}
                    checked={filters[first.key] === dimension.value}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...filters,
                        [first.key]: checked ? dimension.value : undefined,
                      })
                    }
                  />
                );
              }
              if (dimension.kind === "range") {
                const { range } = dimension;
                const last = dimension.fields[1];
                return (
                  <DualRangeField
                    key={key}
                    label={label}
                    min={range.min}
                    max={range.max}
                    value={[
                      (filters[first.key] as number) ?? range.min,
                      (filters[last.key] as number) ?? range.max,
                    ]}
                    onValueCommit={([min, max]) =>
                      onChange({
                        ...filters,
                        [first.key]: min,
                        [last.key]: max,
                      })
                    }
                  />
                );
              }
              return (
                <CatalogMultiSelect
                  key={key}
                  label={label}
                  items={catalogs[key] ?? []}
                  selectedIds={((filters[first.key] as unknown[]) ?? []).map(
                    String,
                  )}
                  onSelectedIdsChange={(ids) =>
                    onChange({
                      ...filters,
                      [first.key]:
                        first.kind === "intCsv" ? ids.map(Number) : ids,
                    })
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
            {children}
          </div>
        </ScrollArea>
        <div className="-mx-6 mt-auto flex shrink-0 flex-col gap-3 border-t bg-background px-6 pt-4">
          <CustomizedButton
            type="button"
            variant="primary"
            className="w-full lg:hidden"
            onClick={() => setOpen(false)}
          >
            Pokaż wyniki
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              onChange(
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
