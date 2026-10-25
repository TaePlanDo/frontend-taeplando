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
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

import { GroupSchemaOrderRow } from "@/components/group/GroupSchemaOrderRow";
import {
  RatioBalancer,
  type RatioSegment,
} from "@/components/ui/hairline/ratio-balancer/ratio-balancer";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedSelect } from "@/components/shared/CustomizedSelect";
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
  toSchemaWritePayload,
  type SchemaDraftItem,
} from "@/lib/groups/schema-draft";
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
    isFetching,
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
          disabled={isFetching}
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
      if (fromIndex < 0 || toIndex < 0) {
        return current;
      }
      return arrayMove(current, fromIndex, toIndex);
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
                      removeSegment(current, item.segmentId),
                    )
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      {unusedSegments.length > 0 ? (
        <CustomizedSelect
          key={items.map((item) => item.segmentId).join("-")}
          id="add-schema-segment"
          label="Dodaj segment"
          placeholder="Wybierz segment…"
          disabled={isUpdating}
          options={unusedSegments.map((segment) => ({
            value: String(segment.id),
            label: segment.name,
          }))}
          onValueChange={(value) => handleAdd(Number(value))}
        />
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
