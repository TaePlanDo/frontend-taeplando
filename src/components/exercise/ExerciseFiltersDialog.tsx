import { useEffect, useRef, useState, type ReactNode } from "react";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSheet } from "@/components/shared/CustomizedSheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import {
  draftToFilters,
  emptyFilterDraft,
  filtersToDraft,
  type ExerciseFilterDraft,
} from "@/lib/exercises/exercise-filter-draft";
import type { ExerciseListFilters } from "@/types/exercise-list-filters";
import {
  AGE_FILTER_BOUNDS,
  PARTICIPANTS_FILTER_BOUNDS,
} from "@/types/exercise-list-filters";

type ExerciseFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExerciseListFilters;
  onApply: (filters: ExerciseListFilters) => void;
  trigger: ReactNode;
};

export function ExerciseFiltersDialog({
  open,
  onOpenChange,
  filters,
  onApply,
  trigger,
}: ExerciseFiltersDialogProps) {
  const [draft, setDraft] = useState<ExerciseFilterDraft>(() =>
    filtersToDraft(filters),
  );
  const wasOpenRef = useRef(open);
  const isDesktop = useIsDesktop();
  const { data, isLoading, isError, refetch } = useExerciseCatalogs();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(filtersToDraft(filters));
    }
    wasOpenRef.current = open;
  }, [open, filters]);

  return (
    <CustomizedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filtry ćwiczeń"
      trigger={trigger}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 pr-3">
          <div className="flex flex-col gap-6 pb-2">
            <DualRangeField
              label="Wiek"
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
            {isError ? (
              <div className="text-sm text-destructive" role="alert">
                Nie udało się pobrać dostępnych filtrów.{" "}
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => void refetch()}
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
            <CatalogMultiSelect
              label="Schematy"
              items={data?.segments ?? []}
              selectedIds={draft.segment_ids.map(String)}
              onSelectedIdsChange={(ids) =>
                setDraft((current) => ({
                  ...current,
                  segment_ids: ids.map(Number),
                }))
              }
              isLoading={isLoading}
              unavailableMessage={isError ? "Katalog niedostępny" : undefined}
            />
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
