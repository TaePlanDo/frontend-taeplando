import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { EquipmentListItem } from "@/components/equipment/EquipmentListItem";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import { useDeleteEquipment } from "@/hooks/equipment/useDeleteEquipment";
import { useEquipment } from "@/hooks/equipment/useEquipment";
import type { Equipment } from "@/types/equipment";

export function EquipmentListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const {
    items: equipment,
    page,
    totalPages,
    isLoading,
    isFetching,
    isError,
    refetch,
    goToPage,
  } = useEquipment();
  const { deleteEquipment } = useDeleteEquipment();

  function openEdit(item: Equipment) {
    setEditingEquipment(item);
    setDialogOpen(true);
  }

  async function handleDelete(item: Equipment) {
    try {
      await deleteEquipment(item.id);
      toast.success("Sprzęt został usunięty");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  function renderList() {
    if (isError) {
      return (
        <ErrorListView
          title="Nie udało się pobrać sprzętu"
          message="Sprawdź połączenie i spróbuj ponownie"
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      );
    }

    if (isLoading) {
      return <LoadingSpinner className="h-92" />;
    }

    if (equipment.length === 0) {
      return (
        <EmptyListView
          title="Jeszcze nie masz żadnego sprzętu"
          message="Kliknij dodaj sprzęt, aby dodać swój pierwszy sprzęt treningowy"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {equipment.map((item) => (
          <EquipmentListItem
            key={item.id}
            equipment={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center">
      <div className="mb-12 flex h-full max-w-96 flex-col gap-4 lg:max-w-220">
        <div className="mt-12 flex h-full flex-row gap-4">
          <div className="flex w-2/3 flex-col gap-2">
            <h1 className="text-2xl font-bold text-primary">
              Sprzęt treningowy
            </h1>
            <p className="hidden text-lg text-foreground lg:flex">
              Zarządzaj sprzętem w jednym miejscu. Dodawaj nowy, aktualizuj
              szczegóły i miej całą bazę sprzętu zawsze pod ręką.
            </p>
          </div>
          <div className="flex w-1/3 flex-col items-end justify-end gap-2">
            <CustomizedDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title={editingEquipment ? "Edytuj sprzęt" : "Dodaj sprzęt"}
              trigger={
                <CustomizedButton
                  className="max-w-44 pt-2 pb-2.5 text-sm"
                  onClick={() => setEditingEquipment(null)}
                >
                  <PlusIcon className="mt-0.5 size-5" />
                  Dodaj sprzęt
                </CustomizedButton>
              }
            >
              <EquipmentForm
                key={editingEquipment?.id ?? "new"}
                equipment={editingEquipment}
                onClose={() => setDialogOpen(false)}
              />
            </CustomizedDialog>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-foreground">
            Lista sprzętu
          </h2>
        </div>
        <Separator className="my-4" />
        {renderList()}
        {isError ? null : (
          <CustomizedPagination
            pagesNumber={totalPages}
            currentPage={page}
            goToPage={goToPage}
          />
        )}
      </div>
    </div>
  );
}
