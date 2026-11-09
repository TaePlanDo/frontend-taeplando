import { useState, type Dispatch, type SetStateAction } from "react";
import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useGroupOptions } from "@/hooks/groups/useGroupOptions";
import type { PlanListFilters } from "@/types/plan-list-filters";
import { cn } from "cn";

type PlanGroupsFilterProps = {
  draft: PlanListFilters;
  setDraft: Dispatch<SetStateAction<PlanListFilters>>;
};

export function PlanGroupsFilter({ draft, setDraft }: PlanGroupsFilterProps) {
  const [query, setQuery] = useState("");
  const { data = [], isLoading } = useGroupOptions();
  const selected = draft.training_group_ids ?? [];
  const groups = data.filter((group) =>
    group.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggleGroup(id: string) {
    setDraft((current) => ({
      ...current,
      training_group_ids: selected.includes(id)
        ? selected.filter((groupId) => groupId !== id)
        : [...selected, id],
    }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-primary">2. Filtry grup</p>
        <p className="text-xs text-muted-foreground">
          Wybierz konkretne grupy treningowe
        </p>
      </div>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Szukaj grupy..."
        aria-label="Szukaj grupy"
        className="h-10 rounded-xl"
      />
      <div className="flex flex-col gap-2">
        {groups.map((group) => {
          const checked = selected.includes(group.id);
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
                <span className="block text-sm font-medium">{group.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {group.min_age}–{group.max_age} lat · {group.duration_minutes}{" "}
                  min
                </span>
              </span>
            </button>
          );
        })}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Ładowanie…</p>
        ) : null}
        {!isLoading && groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Brak grup do wyświetlenia
          </p>
        ) : null}
      </div>
    </div>
  );
}
