import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { GroupSchemaOrderRow } from "@/components/group/GroupSchemaOrderRow";
import {
  RatioBalancer,
  type RatioSegment,
} from "@/components/ratio-balancer/ratio-balancer";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { InputErrorMessage } from "@/components/shared/InputErrorMessage";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useTrainingSegments } from "@/hooks/groups/useTrainingSegments";
import { useUpdateGroupSchema } from "@/hooks/groups/useUpdateGroupSchema";
import {
  addSegment,
  applyRatios,
  canSaveSchema,
  initDraftFromSchema,
  removeSegment,
  reorderSegments,
  toSchemaWritePayload,
  type SchemaDraftItem,
} from "@/lib/schema/schema-draft";
import type { Group } from "@/types/group";
import type { TrainingSegment } from "@/types/training-segment";

type GroupSchemaFormProps = {
  group: Group;
  onClose: () => void;
};

export function GroupSchemaForm({ group, onClose }: GroupSchemaFormProps) {
  const {
    segments: catalog,
    isLoading,
    isError,
    refetch,
  } = useTrainingSegments();

  if (isLoading) {
    return <LoadingSpinner className="h-40" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3 py-4">
        <InputErrorMessage message="Nie udało się pobrać segmentów treningowych" />
        <CustomizedButton
          type="button"
          variant="primary"
          className="mx-auto w-2/3"
          onClick={() => void refetch()}
        >
          Spróbuj ponownie
        </CustomizedButton>
      </div>
    );
  }

  return (
    <GroupSchemaEditor
      key={group.id}
      group={group}
      catalog={catalog}
      onClose={onClose}
    />
  );
}

type GroupSchemaEditorProps = {
  group: Group;
  catalog: TrainingSegment[];
  onClose: () => void;
};

function GroupSchemaEditor({
  group,
  catalog,
  onClose,
}: GroupSchemaEditorProps) {
  const { updateGroupSchema, isUpdating, error } = useUpdateGroupSchema();
  const [items, setItems] = useState<SchemaDraftItem[]>(() =>
    initDraftFromSchema(group.schema, catalog),
  );

  const unusedSegments = useMemo(
    () =>
      catalog.filter(
        (segment) => !items.some((item) => item.segmentId === segment.id),
      ),
    [catalog, items],
  );

  const ratioSegments: RatioSegment[] = items.map((item) => ({
    id: item.segmentCode,
    label: item.segmentName,
    ratio: item.percentage,
  }));

  const saveAllowed = canSaveSchema(items);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleAdd(segmentId: number) {
    const segment = catalog.find((entry) => entry.id === segmentId);
    if (!segment) {
      return;
    }
    setItems((current) => addSegment(current, segment));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setItems((current) => {
      const fromIndex = current.findIndex(
        (item) => item.segmentCode === String(active.id),
      );
      const toIndex = current.findIndex(
        (item) => item.segmentCode === String(over.id),
      );
      return reorderSegments(current, fromIndex, toIndex);
    });
  }

  async function handleSave() {
    if (!saveAllowed) {
      return;
    }
    try {
      await updateGroupSchema(group.id, toSchemaWritePayload(items));
      toast.success("Schemat grupy został zapisany");
      onClose();
    } catch {
      // surfaced via error from the mutation hook
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/70">
        Ustaw udział części treningu. Suma zawsze wynosi 100%; każdy segment co
        najmniej 1%.
      </p>

      {items.length > 0 ? (
        <RatioBalancer
          className="max-w-none"
          label="Schemat treningu"
          segments={ratioSegments}
          minRatio={1}
          showLegend={false}
          disabled={isUpdating}
          onValueCommit={(ratios) =>
            setItems((current) => applyRatios(current, ratios))
          }
        />
      ) : null}

      {items.length > 1 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.segmentCode)}
            strategy={verticalListSortingStrategy}
          >
            <ul
              className="flex flex-col gap-1"
              aria-label="Kolejność segmentów"
            >
              {items.map((item) => (
                <GroupSchemaOrderRow
                  key={item.segmentCode}
                  item={item}
                  canRemove={items.length > 1}
                  disabled={isUpdating}
                  onRemove={() =>
                    setItems((current) =>
                      removeSegment(current, item.segmentCode),
                    )
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      {unusedSegments.length > 0 ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="add-schema-segment"
            className="text-sm font-medium text-foreground"
          >
            Dodaj segment
          </label>
          <div className="relative">
            <select
              id="add-schema-segment"
              className="w-full appearance-none rounded-md border border-foreground/15 bg-background py-2 pl-3 pr-10 text-sm"
              defaultValue=""
              disabled={isUpdating}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value) && value > 0) {
                  handleAdd(value);
                  event.target.value = "";
                }
              }}
            >
              <option value="" disabled>
                Wybierz segment…
              </option>
              {unusedSegments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
      ) : catalog.length > 0 ? (
        <p className="text-sm text-foreground/60">
          Wszystkie segmenty z katalogu są już w schemacie.
        </p>
      ) : null}

      {!saveAllowed ? (
        <InputErrorMessage
          message="Każdy segment musi mieć udział co najmniej 1%, a suma musi wynosić 100%."
          className="mx-2"
        />
      ) : null}

      {error ? <InputErrorMessage message={error} className="mx-2" /> : null}

      <CustomizedButton
        type="button"
        variant="primary"
        className="mx-auto mt-2 w-2/3"
        disabled={isUpdating || !saveAllowed}
        onClick={() => void handleSave()}
      >
        Zapisz schemat
      </CustomizedButton>
    </div>
  );
}
