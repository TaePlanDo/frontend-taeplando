import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { GroupCardItem } from "@/components/group/GroupCardItem";
import { GroupDetailsForm } from "@/components/group/GroupDetailsForm";
import { GroupSchemaForm } from "@/components/group/GroupSchemaForm";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { ListStateView } from "@/components/shared/ListStateView";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { Badge } from "@/components/ui/badge";
import { useDeleteGroup } from "@/hooks/groups/useDeleteGroup";
import { useGroups } from "@/hooks/groups/useGroups";
import { hasDisplayableListData } from "@/hooks/pagination/listState";
import { formatGroupCount } from "@/lib/format/plural";
import type { Group } from "@/types/group";

export function GroupListPage() {
  const {
    items: groups,
    page,
    totalPages,
    total,
    isFetching,
    listState,
    refetch,
    goToPage,
  } = useGroups();
  const { deleteGroup } = useDeleteGroup();
  const showListMetadata = hasDisplayableListData(listState);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  const [schemaGroup, setSchemaGroup] = useState<Group | null>(null);

  function openEdit(group: Group) {
    setEditingGroup(group);
    setDialogOpen(true);
  }

  function openSchema(group: Group) {
    setSchemaGroup(group);
    setSchemaDialogOpen(true);
  }

  async function handleDelete(group: Group) {
    try {
      await deleteGroup(group.id);
      toast.success("Grupa została usunięta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ManagementPageLayout
      title="Wszystkie grupy treningowe"
      description="Organizuj grupy w jednym miejscu. Dodawaj nowe, aktualizuj szczegóły i miej wszystko pod ręką."
      sectionTitle="Lista grup"
      sectionAccessory={
        showListMetadata ? (
          <Badge
            variant="ghost"
            className="h-10 rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground"
          >
            {formatGroupCount(total)}
          </Badge>
        ) : null
      }
      action={
        <>
          <CustomizedDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title={
              editingGroup
                ? "Edytuj Grupę treningową"
                : "Stwórz Grupę treningową"
            }
            trigger={
              <CustomizedButton
                className="max-w-40 pt-2 pb-2.5 text-sm"
                onClick={() => setEditingGroup(null)}
              >
                <PlusIcon className="mt-0.5 size-5" />
                Dodaj grupę
              </CustomizedButton>
            }
          >
            <GroupDetailsForm
              group={editingGroup}
              onClose={() => setDialogOpen(false)}
            />
          </CustomizedDialog>
          <CustomizedDialog
            title={
              schemaGroup ? `Schemat: ${schemaGroup.name}` : "Schemat grupy"
            }
            open={schemaDialogOpen}
            onOpenChange={(open) => {
              setSchemaDialogOpen(open);
              if (!open) {
                setSchemaGroup(null);
              }
            }}
          >
            {schemaGroup ? (
              <GroupSchemaForm
                group={schemaGroup}
                onClose={() => {
                  setSchemaDialogOpen(false);
                  setSchemaGroup(null);
                }}
              />
            ) : null}
          </CustomizedDialog>
        </>
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
        errorTitle="Nie udało się pobrać grup"
        errorMessage="Sprawdź połączenie i spróbuj ponownie"
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyTitle="Jeszcze nie masz żadnych grup"
        emptyMessage="Kliknij dodaj grupę, aby utworzyć swoją pierwszą grupę"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <GroupCardItem
              key={group.id}
              group={group}
              onEdit={() => openEdit(group)}
              onEditSchema={() => openSchema(group)}
              onDelete={() => handleDelete(group)}
            />
          ))}
        </div>
      </ListStateView>
    </ManagementPageLayout>
  );
}
