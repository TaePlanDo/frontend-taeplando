import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { EquipmentListItem } from "@/components/equipment/EquipmentListItem";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { ListStateView } from "@/components/shared/ListStateView";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { useDeleteEquipment } from "@/hooks/equipment/useDeleteEquipment";
import { useEquipment } from "@/hooks/equipment/useEquipment";
import { hasDisplayableListData } from "@/hooks/pagination/listState";
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
    isFetching,
    listState,
    refetch,
    goToPage,
  } = useEquipment();
  const { deleteEquipment } = useDeleteEquipment();
  const showListMetadata = hasDisplayableListData(listState);

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

  return (
    <ManagementPageLayout
      title="Sprzęt treningowy"
      description="Zarządzaj sprzętem w jednym miejscu. Dodawaj nowy, aktualizuj szczegóły i miej całą bazę sprzętu zawsze pod ręką."
      sectionTitle="Lista sprzętu"
      action={
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
      }
      pagination={
        showListMetadata ? (
          <CustomizedPagination
            pagesNumber={totalPages}
            currentPage={page}
            goToPage={goToPage}
          />
        ) : null
      }
    >
      <ListStateView
        state={listState}
        errorTitle="Nie udało się pobrać sprzętu"
        errorMessage="Sprawdź połączenie i spróbuj ponownie"
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyTitle="Jeszcze nie masz żadnego sprzętu"
        emptyMessage="Kliknij dodaj sprzęt, aby dodać swój pierwszy sprzęt treningowy"
      >
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
      </ListStateView>
    </ManagementPageLayout>
  );
}
