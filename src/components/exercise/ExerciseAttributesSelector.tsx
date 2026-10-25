import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { CustomizedTabs } from "@/components/shared/CustomizedTabs";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";

import { SelectedAttributeBadges } from "./SelectedAttributeBadges";

type Tab = "equipment" | "type" | "segment";
type Props = {
  equipmentIds: string[];
  typeIds: string[];
  segmentIds: number[];
  onEquipmentIdsChange: (ids: string[]) => void;
  onTypeIdsChange: (ids: string[]) => void;
  onSegmentIdsChange: (ids: number[]) => void;
  errors: Partial<Record<"type" | "segment", string>>;
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
  };

  return (
    <section className="border-t pt-4">
      <h3 className="font-semibold">Atrybuty dodatkowe</h3>
      <p className="mb-3 text-sm text-foreground/60">
        Dodaj sprzęt potrzebny do realizacji ćwiczenia i przypisz konkretny
        Segment i Typ.
      </p>
      <CustomizedTabs
        value={tab}
        onValueChange={setTab}
        className="grid h-auto grid-cols-3 border"
        tabs={tabs.map(({ id, label }) => ({
          value: id,
          label: (
            <span className="inline-flex items-center gap-1">
              {label} ({count(id)})
              {(id === "type" || id === "segment") && count(id) === 0 ? (
                <TriangleAlert
                  className="size-3.5 text-primary"
                  aria-label={`Brak wybranego: ${label}`}
                />
              ) : null}
            </span>
          ),
        }))}
      />
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
      <SelectedAttributeBadges
        items={selected}
        onRemove={(id) =>
          active.setIds(active.ids.filter((selectedId) => selectedId !== id))
        }
      />
      {tab === "type" && errors.type ? (
        <InputErrorMessage message={errors.type} className="mt-2" />
      ) : null}
      {tab === "segment" && errors.segment ? (
        <InputErrorMessage message={errors.segment} className="mt-2" />
      ) : null}
    </section>
  );
}
