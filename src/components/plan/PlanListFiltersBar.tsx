import { useEffect, useRef, useState } from "react";
import { ListFilter } from "lucide-react";

import { PlanFiltersSheet } from "@/components/plan/PlanFiltersSheet";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { SelectedAttributeBadges } from "@/components/shared/SelectedAttributeBadges";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import { useGroupOptions } from "@/hooks/groups/useGroupOptions";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/search";
import { buildActiveFilterChips } from "@/lib/plans/plan-list-filter-chips";
import { formatPlanCount } from "@/lib/format/plural";
import type {
  PlanActiveFilterDimension,
  PlanListFilters,
} from "@/types/plan-list-filters";

type PlanListFiltersBarProps = {
  filters: PlanListFilters;
  dialogFilterCount: number;
  total: number;
  onNameChange: (name: string) => void;
  onFiltersApply: (filters: PlanListFilters) => void;
  onClearDimension: (dimension: PlanActiveFilterDimension) => void;
};

export function PlanListFiltersBar({
  filters,
  dialogFilterCount,
  total,
  onNameChange,
  onFiltersApply,
  onClearDimension,
}: PlanListFiltersBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.name ?? "");
  const onNameChangeRef = useRef(onNameChange);
  onNameChangeRef.current = onNameChange;
  const { data } = useExerciseCatalogs();
  const groupsQuery = useGroupOptions();
  const chips = buildActiveFilterChips(filters, {
    equipment: data?.equipment ?? [],
    trainingTypes: data?.trainingTypes ?? [],
    groups: groupsQuery.data ?? [],
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
          placeholder="Wyszukaj plan po nazwie..."
          aria-label="Wyszukaj plan po nazwie"
          className="h-11 flex-1 rounded-xl"
        />
        <div className="flex shrink-0 items-center gap-2">
          <PlanFiltersSheet
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
                Filtry
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
            className="hidden h-10 rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground lg:flex"
          >
            {formatPlanCount(total)}
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
