import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { ExerciseCardItem } from "@/components/exercise/ExerciseCardItem";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { ListStateView } from "@/components/shared/ListStateView";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { Badge } from "@/components/ui/badge";
import { useDeleteExercise } from "@/hooks/exercises/useDeleteExercise";
import { useExercises } from "@/hooks/exercises/useExercises";
import { formatExerciseCount } from "@/lib/format/plural";
import type { Exercise } from "@/types/exercise";

export function ExerciseListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const {
    items: exercises,
    page,
    totalPages,
    total,
    isLoading,
    isFetching,
    isError,
    isOffline,
    hasData,
    refetch,
    goToPage,
  } = useExercises();
  const { deleteExercise } = useDeleteExercise();

  async function handleDelete(id: string) {
    try {
      await deleteExercise(id);
      toast.success("Ćwiczenie zostało usunięte");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ManagementPageLayout
      title="Wszystkie ćwiczenia"
      description="Zarządzaj ćwiczeniami w jednym miejscu. Dodawaj nowe, aktualizuj szczegóły i miej całą bazę ćwiczeń zawsze pod ręką."
      sectionTitle="Lista ćwiczeń"
      sectionAccessory={
        isError || (isOffline && !hasData) ? null : (
          <Badge
            variant="ghost"
            className="rounded-full bg-transparent px-6 py-2 text-secondary"
          >
            {formatExerciseCount(total)}
          </Badge>
        )
      }
      action={
        <CustomizedDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          className="grid-rows-[auto_minmax(0,1fr)] max-h-[calc(100dvh-2rem)] gap-5 overflow-hidden p-4 sm:!top-8 sm:!bottom-8 sm:!h-auto sm:!translate-y-0 sm:max-w-190 sm:p-6"
          title={editingExercise ? "Edytuj ćwiczenie" : "Stwórz ćwiczenie"}
          trigger={
            <CustomizedButton
              className="w-auto max-w-44 px-4 pt-2 pb-2.5 text-sm lg:w-full"
              onClick={() => setEditingExercise(null)}
            >
              <PlusIcon className="mt-0.5 size-5" />
              <span className="lg:hidden">Dodaj</span>
              <span className="hidden lg:inline">Dodaj ćwiczenie</span>
            </CustomizedButton>
          }
        >
          <ExerciseForm
            key={editingExercise?.id ?? "new"}
            exercise={editingExercise}
            onClose={() => setDialogOpen(false)}
          />
        </CustomizedDialog>
      }
      pagination={
        isError || (isOffline && !hasData) ? null : (
          <CustomizedPagination
            pagesNumber={totalPages}
            currentPage={page}
            goToPage={goToPage}
          />
        )
      }
    >
      <ListStateView
        isError={isError}
        isOffline={isOffline}
        hasData={hasData}
        isLoading={isLoading}
        isEmpty={exercises.length === 0}
        errorTitle="Nie udało się pobrać ćwiczeń"
        errorMessage="Sprawdź połączenie i spróbuj ponownie"
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyTitle="Jeszcze nie masz żadnych ćwiczeń"
        emptyMessage="Kliknij dodaj ćwiczenie, aby utworzyć swoje pierwsze ćwiczenie"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {exercises.map((exercise) => (
            <ExerciseCardItem
              key={exercise.id}
              exercise={exercise}
              isOffline={isOffline}
              onEdit={() => {
                setEditingExercise(exercise);
                setDialogOpen(true);
              }}
              onDelete={() => handleDelete(exercise.id)}
            />
          ))}
        </div>
      </ListStateView>
    </ManagementPageLayout>
  );
}
