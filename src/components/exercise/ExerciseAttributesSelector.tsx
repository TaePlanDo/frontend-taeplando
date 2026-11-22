import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { CustomizedTabs } from "@/components/shared/CustomizedTabs";
import { useExerciseCatalogs } from "@/hooks/exercises/useExerciseCatalogs";

import { CatalogMultiSelect } from "@/components/shared/CatalogMultiSelect";

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

const tabOrder: Tab[] = ["equipment", "type", "segment"];

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
  const tabs = {
    equipment: {
      label: "Sprzęt",
      selectedLabel: "Wybrany sprzęt",
      placeholder: "Dodaj kolejny sprzęt…",
      items: data?.equipment ?? [],
      ids: equipmentIds,
      setIds: onEquipmentIdsChange,
      error: undefined,
    },
    type: {
      label: "Typ",
      selectedLabel: "Wybrane typy",
      placeholder: "Dodaj kolejny typ…",
      items: data?.trainingTypes ?? [],
      ids: typeIds,
      setIds: onTypeIdsChange,
      error: errors.type,
    },
    segment: {
      label: "Segment",
      selectedLabel: "Wybrane segmenty",
      placeholder: "Dodaj kolejny segment…",
      items: data?.segments ?? [],
      ids: segmentIds.map(String),
      setIds: (ids: string[]) => onSegmentIdsChange(ids.map(Number)),
      error: errors.segment,
    },
  };
  const active = tabs[tab];

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
        tabs={tabOrder.map((id) => ({
          value: id,
          label: (
            <span className="inline-flex items-center gap-1 leading-none">
              <span>
                {tabs[id].label} ({tabs[id].ids.length})
              </span>
              {id !== "equipment" && tabs[id].ids.length === 0 ? (
                <TriangleAlert
                  className="size-3.5 shrink-0 self-center text-primary"
                  aria-label={`Brak wybranego: ${tabs[id].label}`}
                />
              ) : null}
            </span>
          ),
        }))}
      />
      {isError ? (
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
      ) : (
        <CatalogMultiSelect
          className="mt-3 mb-4"
          label={`Dodaj ${active.label.toLowerCase()}`}
          labelClassName="sr-only"
          placeholder={active.placeholder}
          selectedLabel={active.selectedLabel}
          selectionPosition="above"
          error={active.error}
          items={active.items}
          selectedIds={active.ids}
          onSelectedIdsChange={active.setIds}
          isLoading={isLoading}
        />
      )}
    </section>
  );
}
