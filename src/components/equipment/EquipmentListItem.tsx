import { Pencil, Trash2 } from "lucide-react";

import { CardItemActionButton } from "@/components/shared/CardItemActionButton";
import { CustomizedAlertDialog } from "@/components/shared/CustomizedAlertDialog";
import { Card } from "@/components/ui/card";
import type { Equipment } from "@/types/equipment";

type EquipmentListItemProps = {
  equipment: Equipment;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
};

export function EquipmentListItem({
  equipment,
  onEdit,
  onDelete,
}: EquipmentListItemProps) {
  return (
    <Card className="flex-row items-center justify-between gap-3 rounded-xl bg-transparent px-6 py-4 text-foreground shadow-none">
      <h3 className="min-w-0 truncate text-lg font-semibold">
        {equipment.name}
      </h3>
      <div className="flex shrink-0 items-center gap-1">
        <CardItemActionButton
          icon={<Pencil className="size-4" aria-hidden />}
          onClick={onEdit}
        >
          Edytuj
        </CardItemActionButton>
        <CustomizedAlertDialog
          trigger={
            <CardItemActionButton
              icon={<Trash2 className="size-4" aria-hidden />}
              className="text-primary hover:bg-primary/10"
            >
              Usuń
            </CardItemActionButton>
          }
          title="Usuwanie sprzętu"
          message={`Czy na pewno chcesz usunąć „${equipment.name}”? Tej operacji nie da się cofnąć.`}
          onSubmit={onDelete}
        />
      </div>
    </Card>
  );
}
