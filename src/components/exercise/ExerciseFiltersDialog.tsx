import { useEffect, useRef, useState, type ReactNode } from "react";

import { CatalogMultiSelect } from "@/components/exercise/CatalogMultiSelect";
import { DualRangeField } from "@/components/shared/DualRangeField";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
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
  const { data, isLoading } = useExerciseCatalogs();

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(filtersToDraft(filters));
    }
    wasOpenRef.current = open;
  }, [open, filters]);

  return (
    <CustomizedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Filtry ćwiczeń"
      trigger={trigger}
      className="grid-rows-[auto_minmax(0,1fr)] max-h-[calc(100dvh-2rem)] gap-5 overflow-hidden p-4 sm:!top-8 sm:!bottom-8 sm:!h-auto sm:!translate-y-0 sm:max-w-150 sm:p-6"
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
            <CatalogMultiSelect
              label="Sprzęt"
              items={data?.equipment ?? []}
              selectedIds={draft.equipment_ids}
              onSelectedIdsChange={(equipment_ids) =>
                setDraft((current) => ({ ...current, equipment_ids }))
              }
              isLoading={isLoading}
            />
            <CatalogMultiSelect
              label="Kategorie"
              items={data?.trainingTypes ?? []}
              selectedIds={draft.training_type_ids}
              onSelectedIdsChange={(training_type_ids) =>
                setDraft((current) => ({ ...current, training_type_ids }))
              }
              isLoading={isLoading}
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
            />
          </div>
        </ScrollArea>
        <div className="-mx-4 flex shrink-0 flex-col-reverse gap-3 border-t bg-background px-4 pt-4 pb-2 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
          <CustomizedButton
            type="button"
            variant="outline"
            className="w-full sm:w-32"
            onClick={() => setDraft(emptyFilterDraft())}
          >
            Wyczyść
          </CustomizedButton>
          <CustomizedButton
            type="button"
            variant="primary"
            className="w-full sm:w-54"
            onClick={() => {
              onApply(draftToFilters(draft, filters.name));
              onOpenChange(false);
            }}
          >
            Zastosuj filtry
          </CustomizedButton>
        </div>
      </div>
    </CustomizedDialog>
  );
}
