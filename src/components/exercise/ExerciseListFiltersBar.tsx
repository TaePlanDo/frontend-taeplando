import { useEffect, useRef, useState } from "react";
import { ListFilter } from "lucide-react";

import { ExerciseFiltersDialog } from "@/components/exercise/ExerciseFiltersDialog";
import { SelectedAttributeBadges } from "@/components/exercise/SelectedAttributeBadges";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import { buildActiveFilterChips } from "@/lib/exercises/exercise-list-filter-chips";
import { formatExerciseCount } from "@/lib/format/plural";
import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

const SEARCH_DEBOUNCE_MS = 300;

type ExerciseListFiltersBarProps = {
  filters: ExerciseListFilters;
  dialogFilterCount: number;
  total: number;
  onNameChange: (name: string) => void;
  onFiltersApply: (filters: ExerciseListFilters) => void;
  onClearDimension: (dimension: ActiveFilterDimension) => void;
};

export function ExerciseListFiltersBar({
  filters,
  dialogFilterCount,
  total,
  onNameChange,
  onFiltersApply,
  onClearDimension,
}: ExerciseListFiltersBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.name ?? "");
  const onNameChangeRef = useRef(onNameChange);
  onNameChangeRef.current = onNameChange;
  const { data } = useExerciseCatalogs();
  const chips = buildActiveFilterChips(filters, {
    equipment: data?.equipment ?? [],
    trainingTypes: data?.trainingTypes ?? [],
    segments: data?.segments ?? [],
  });

  useEffect(() => {
    setSearchValue(filters.name ?? "");
  }, [filters.name]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchValue.trim();
      const current = filters.name?.trim() ?? "";
      if (next !== current) onNameChangeRef.current(next);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchValue, filters.name]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Wyszukaj ćwiczenie"
          aria-label="Wyszukaj ćwiczenie"
          className="h-11 flex-1 rounded-xl"
        />
        <div className="flex shrink-0 items-center gap-2">
          <ExerciseFiltersDialog
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            filters={filters}
            onApply={onFiltersApply}
            trigger={
              <CustomizedButton
                type="button"
                variant="outline"
                className="relative w-full gap-2 sm:w-auto"
              >
                <ListFilter className="size-4" />
                Filtruj
                {dialogFilterCount > 0 ? (
                  <Badge
                    variant="default"
                    className="ml-1 min-w-5 justify-center rounded-full px-1.5 py-0 text-xs text-white"
                  >
                    {dialogFilterCount}
                  </Badge>
                ) : null}
              </CustomizedButton>
            }
          />
          <Badge
            variant="ghost"
            className="h-10 rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground"
          >
            {formatExerciseCount(total)}
          </Badge>
        </div>
      </div>
      <SelectedAttributeBadges
        items={chips.map((chip) => ({ id: chip.key, name: chip.label }))}
        onRemove={onClearDimension}
      />
    </div>
  );
}
