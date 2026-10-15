import { useState } from "react";

import { ButtonCustomized } from "@/components/shared/ButtonCustomized";
import { GroupCardItem } from "@/components/group/GroupCardItem";
import { GroupDetailsForm } from "@/components/group/GroupDetailsForm";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { DialogCustomized } from "@/components/shared/DialogCustomized";
import { EmptyListView } from "@/components/shared/EmptyListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGroups } from "@/hooks/groups/useGroups";
import { PlusIcon } from "lucide-react";
import type { Group } from "@/types/group";

export function GroupListPage() {
  const {
    items: groups,
    page,
    totalPages,
    total,
    isLoading,
    goToPage,
  } = useGroups();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  function openEdit(group: Group) {
    setEditingGroup(group);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-1 justify-center">
      <div className="flex flex-col gap-4 h-full lg:max-w-220 max-w-96">
        <div className="flex flex-row gap-4 h-full mt-12">
          <div className="flex flex-col gap-2 w-2/3">
            <h1 className="text-2xl text-[#F27229] font-bold">
              Wszystkie grupy treningowe
            </h1>
            <p className="text-lg text-white">
              Organizuj grupy w jednym miejscu. Dodawaj nowe, aktualizuj
              szczegóły i miej wszystko pod ręką.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-1/3 items-end justify-end">
            <DialogCustomized
              trigger={
                <ButtonCustomized
                  className="max-w-40 text-sm pt-2 pb-2.5"
                  onClick={() => setEditingGroup(null)}
                >
                  <PlusIcon className="w-5 h-5 mt-0.5" />
                  Dodaj grupę
                </ButtonCustomized>
              }
              title={
                editingGroup
                  ? "Edytuj Grupę treningową"
                  : "Stwórz Grupę treningową"
              }
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            >
              <GroupDetailsForm
                group={editingGroup}
                onClose={() => setDialogOpen(false)}
              />
            </DialogCustomized>
          </div>
        </div>
        <div className="flex flex-row justify-between items-end mt-4">
          <h2 className="text-xl text-white font-semibold">Lista grup</h2>
          <Badge
            variant="ghost"
            className="rounded-full border border-[#45355A] bg-transparent text-[#D8D3EA] px-6 py-2"
          >
            {total} grupy
          </Badge>
        </div>
        <Separator className="bg-[#2A2433] my-4" />
        {isLoading ? (
          <LoadingSpinner className="h-92" />
        ) : groups.length === 0 ? (
          <EmptyListView
            title="Jeszcze nie masz żadnych grup"
            message="Kliknij dodaj grupę, aby utworzyć swoją pierwszą grupę"
          />
        ) : (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {groups.map((group) => (
                <GroupCardItem
                  key={group.id}
                  group={group}
                  onEdit={() => openEdit(group)}
                />
              ))}
            </div>
            <CustomizedPagination
              pagesNumber={totalPages}
              currentPage={page}
              goToPage={goToPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
