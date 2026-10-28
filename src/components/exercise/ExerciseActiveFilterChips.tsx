import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import { buildActiveFilterChips } from "@/lib/exercises/filter-dimensions";
import type {
  ActiveFilterDimension,
  ExerciseListFilters,
} from "@/types/exercise-list-filters";

type ExerciseActiveFilterChipsProps = {
  filters: ExerciseListFilters;
  onClear: (dimension: ActiveFilterDimension) => void;
};

export function ExerciseActiveFilterChips({
  filters,
  onClear,
}: ExerciseActiveFilterChipsProps) {
  const { data } = useExerciseCatalogs();
  const chips = buildActiveFilterChips(filters, {
    equipment: data?.equipment ?? [],
    trainingTypes: data?.trainingTypes ?? [],
    segments: data?.segments ?? [],
  });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondaryOutline"
          className="gap-1.5 px-2.5 py-1"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onClear(chip.key)}
            aria-label={`Usuń filtr ${chip.label}`}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
