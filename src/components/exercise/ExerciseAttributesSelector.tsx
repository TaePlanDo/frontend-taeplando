import { useMemo, useState } from "react";
import { TriangleAlert, X } from "lucide-react";

import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";
import type { ExerciseFieldErrors } from "@/lib/validation/exerciseSubmission";

type Tab = "equipment" | "type" | "segment";
type Props = {
  equipmentIds: string[];
  typeIds: string[];
  segmentIds: number[];
  onEquipmentIdsChange: (ids: string[]) => void;
  onTypeIdsChange: (ids: string[]) => void;
  onSegmentIdsChange: (ids: number[]) => void;
  errors: Pick<ExerciseFieldErrors, "type" | "segment">;
  onClearError: (field: "type" | "segment") => void;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "equipment", label: "Sprzęt" },
  { id: "type", label: "Typ" },
  { id: "segment", label: "Segment" },
];
const emptyCatalog = [] as const;

export function ExerciseAttributesSelector({
  equipmentIds,
  typeIds,
  segmentIds,
  onEquipmentIdsChange,
  onTypeIdsChange,
  onSegmentIdsChange,
  errors,
  onClearError,
}: Props) {
  const [tab, setTab] = useState<Tab>("equipment");
  const { data, isLoading, isError, refetch } = useExerciseCatalogs();
  const active = useMemo(() => {
    if (tab === "equipment")
      return {
        items: data?.equipment ?? emptyCatalog,
        ids: equipmentIds,
        setIds: onEquipmentIdsChange,
      };
    if (tab === "type")
      return {
        items: data?.trainingTypes ?? emptyCatalog,
        ids: typeIds,
        setIds: onTypeIdsChange,
      };
    return {
      items: data?.segments ?? emptyCatalog,
      ids: segmentIds.map(String),
      setIds: (ids: string[]) => onSegmentIdsChange(ids.map(Number)),
    };
  }, [
    data,
    equipmentIds,
    onEquipmentIdsChange,
    onSegmentIdsChange,
    onTypeIdsChange,
    segmentIds,
    tab,
    typeIds,
  ]);
  const selected = active.items.filter((item) =>
    active.ids.includes(String(item.id)),
  );
  const available = active.items.filter(
    (item) => !active.ids.includes(String(item.id)),
  );
  const count = (id: Tab) =>
    id === "equipment"
      ? equipmentIds.length
      : id === "type"
        ? typeIds.length
        : segmentIds.length;
  const add = (id: string) => {
    if (!active.ids.includes(id)) active.setIds([...active.ids, id]);
    if (tab === "type" || tab === "segment") onClearError(tab);
  };

  return (
    <section className="border-t pt-4">
      <h3 className="font-semibold">Atrybuty dodatkowe</h3>
      <p className="mb-3 text-sm text-foreground/60">
        Dodaj sprzęt potrzebny do realizacji ćwiczenia i przypisz konkretny
        Segment i Typ.
      </p>
      <div className="grid grid-cols-3 rounded-lg border bg-input/30 p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-md py-2 text-sm ${tab === id ? "border border-primary bg-primary/15 text-primary" : "text-foreground/60 hover:text-foreground"}`}
          >
            {label} ({count(id)})
            {(id === "type" || id === "segment") && count(id) === 0 ? (
              <TriangleAlert
                className="ml-1 inline size-3.5 text-primary"
                aria-label={`Brak wybranego: ${label}`}
              />
            ) : null}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="mt-3 text-sm text-foreground/60">
          Ładowanie elementów listy…
        </p>
      ) : isError ? (
        <div className="mt-3 text-sm text-destructive">
          Nie udało się pobrać elementów listy.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void refetch()}
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : available.length ? (
        <select
          value=""
          onChange={(event) => add(event.target.value)}
          className="mt-3 h-10 w-full rounded-md border bg-input/30 px-3 text-sm"
          aria-label={`Dodaj ${tabs.find(({ id }) => id === tab)?.label.toLowerCase()}`}
        >
          <option value="">Wybierz z listy…</option>
          {available.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-3 rounded-md border border-foreground/10 bg-input/30 px-3 py-2 text-sm text-foreground/60">
          Wszystkie elementy z listy są już dodane
        </p>
      )}
      <div className="mt-3 flex min-h-8 flex-wrap gap-2">
        {selected.map((item) => (
          <span
            key={item.id}
            className="inline-flex items-center gap-1 rounded-md border border-primary/60 bg-primary/15 px-2.5 py-1 text-sm"
          >
            {item.name}
            <button
              type="button"
              onClick={() =>
                active.setIds(active.ids.filter((id) => id !== String(item.id)))
              }
              aria-label={`Usuń ${item.name}`}
            >
              <X className="size-3 text-primary" />
            </button>
          </span>
        ))}
      </div>
      {tab === "type" && errors.type ? (
        <InputErrorMessage message={errors.type} className="mt-2" />
      ) : null}
      {tab === "segment" && errors.segment ? (
        <InputErrorMessage message={errors.segment} className="mt-2" />
      ) : null}
    </section>
  );
}
