import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import { useGroupOptions } from "@/hooks/groups/useGroupOptions";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import {
  draftToFilters,
  emptyFilterDraft,
  filtersToDraft,
  type PlanFilterDraft,
} from "@/lib/plans/plan-filter-draft";
import { cn } from "cn";
import {
  AGE_FILTER_BOUNDS,
  DURATION_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
  type PlanListFilters,
} from "@/types/plan-list-filters";

type PlanFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PlanListFilters;
  onApply: (filters: PlanListFilters) => void;
  trigger: ReactNode;
};

export function PlanFiltersSheet({
  open,
  onOpenChange,
  filters,
  onApply,
  trigger,
}: PlanFiltersSheetProps) {
  const [draft, setDraft] = useState<PlanFilterDraft>(() =>
    filtersToDraft(filters),
  );
  const [groupQuery, setGroupQuery] = useState("");
  const wasOpenRef = useRef(open);
  const isDesktop = useIsDesktop();
  const { data, isLoading, isError, refetch } = useExerciseCatalogs();
  const groupsQuery = useGroupOptions();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(filtersToDraft(filters));
      setGroupQuery("");
    }
    wasOpenRef.current = open;
  }, [open, filters]);

  const groups = useMemo(() => {
    const items = groupsQuery.data ?? [];
    const q = groupQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((group) => group.name.toLowerCase().includes(q));
  }, [groupsQuery.data, groupQuery]);

  function toggleGroup(id: string) {
    setDraft((current) => {
      const selected = new Set(current.training_group_ids);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { ...current, training_group_ids: [...selected] };
    });
  }

  return (
    <CustomizedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtry planów"
      trigger={trigger}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="flex flex-col gap-6 pb-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">
                1. Filtry parametrów
              </p>
              <p className="text-xs text-muted-foreground">
                Szukaj po cechach planu, niezależnie od grupy
              </p>
            </div>
            <DualRangeField
              label="Wiek uczestników"
              min={AGE_FILTER_BOUNDS.min}
              max={AGE_FILTER_BOUNDS.max}
              value={[draft.min_age, draft.max_age]}
              onValueChange={([min_age, max_age]) =>
                setDraft((current) => ({ ...current, min_age, max_age }))
              }
            />
            <DualRangeField
              label="Liczba uczestników"
              min={PARTICIPANTS_FILTER_BOUNDS.min}
              max={PARTICIPANTS_FILTER_BOUNDS.max}
              value={[draft.min_participants, draft.max_participants]}
              onValueChange={([min_participants, max_participants]) =>
                setDraft((current) => ({
                  ...current,
                  min_participants,
                  max_participants,
                }))
              }
            />
            <DualRangeField
              label="Czas trwania"
              min={DURATION_FILTER_BOUNDS.min}
              max={DURATION_FILTER_BOUNDS.max}
              value={[draft.min_duration, draft.max_duration]}
              onValueChange={([min_duration, max_duration]) =>
                setDraft((current) => ({
                  ...current,
                  min_duration,
                  max_duration,
                }))
              }
            />
            {isError || groupsQuery.isError ? (
              <div className="text-sm text-destructive" role="alert">
                Nie udało się pobrać dostępnych filtrów.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => {
                    void refetch();
                    void groupsQuery.refetch();
                  }}
                >
                  Spróbuj ponownie
                </button>
              </div>
            ) : null}
            <CatalogMultiSelect
              label="Sprzęt"
              items={data?.equipment ?? []}
              selectedIds={draft.equipment_ids}
              onSelectedIdsChange={(equipment_ids) =>
                setDraft((current) => ({ ...current, equipment_ids }))
              }
              isLoading={isLoading}
              unavailableMessage={isError ? "Katalog niedostępny" : undefined}
            />
            <CatalogMultiSelect
              label="Kategorie"
              items={data?.trainingTypes ?? []}
              selectedIds={draft.training_type_ids}
              onSelectedIdsChange={(training_type_ids) =>
                setDraft((current) => ({ ...current, training_type_ids }))
              }
              isLoading={isLoading}
              unavailableMessage={isError ? "Katalog niedostępny" : undefined}
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-primary">
                  2. Filtry grup
                </p>
                <p className="text-xs text-muted-foreground">
                  Wybierz konkretne grupy treningowe
                </p>
              </div>
              <Input
                value={groupQuery}
                onChange={(event) => setGroupQuery(event.target.value)}
                placeholder="Szukaj grupy..."
                aria-label="Szukaj grupy"
                className="h-10 rounded-xl"
              />
              <div className="flex flex-col gap-2">
                {groups.map((group) => {
                  const checked = draft.training_group_ids.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        checked
                          ? "border-primary/60 bg-primary/15"
                          : "border-border bg-transparent hover:bg-muted/40",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                          checked
                            ? "border-primary bg-primary text-white"
                            : "border-border",
                        )}
                      >
                        {checked ? <Check className="size-3" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {group.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {group.min_age}–{group.max_age} lat ·{" "}
                          {group.duration_minutes} min
                        </span>
                      </span>
                    </button>
                  );
                })}
                {groupsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Ładowanie…</p>
                ) : null}
                {!groupsQuery.isLoading && groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Brak grup do wyświetlenia
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="-mx-6 mt-auto flex shrink-0 flex-col gap-3 border-t bg-background px-6 pt-4">
          <CustomizedButton
            type="button"
            variant="primary"
            className="w-full"
            onClick={() => {
              onApply(draftToFilters(draft, filters.name));
              if (!isDesktop) onOpenChange(false);
            }}
          >
            Zastosuj filtry
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setDraft(emptyFilterDraft())}
          >
            Wyczyść
          </CustomizedButton>
        </div>
      </div>
    </CustomizedSheet>
  );
}
