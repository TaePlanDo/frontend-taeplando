import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { ExerciseCardItem } from "@/components/exercise/ExerciseCardItem";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { formatExerciseCount } from "@/lib/format/plural";
import { CustomizedDialog } from "@/components/shared/CustomizedDialog";
import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useExercises } from "@/hooks/exercises/useExercises";
import { useDeleteExercise } from "@/hooks/exercises/useDeleteExercise";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
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

  function renderList() {
    if (isError) {
      return (
        <ErrorListView
          title="Nie udało się pobrać ćwiczeń"
          message="Sprawdź połączenie i spróbuj ponownie"
          onRetry={() => void refetch()}
          isRetrying={isFetching}
        />
      );
    }

    if (isLoading) {
      return <LoadingSpinner className="h-92" />;
    }

    if (total === 0) {
      return (
        <EmptyListView
          title="Jeszcze nie masz żadnych ćwiczeń"
          message="Kliknij dodaj ćwiczenie, aby utworzyć swoje pierwsze ćwiczenie"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {exercises.map((exercise) => (
          <ExerciseCardItem
            key={exercise.id}
            exercise={exercise}
            onEdit={() => {
              setEditingExercise(exercise);
              setDialogOpen(true);
            }}
            onDelete={() => handleDelete(exercise.id)}
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
              Wszystkie ćwiczenia
            </h1>
            <p className="hidden text-lg text-foreground lg:flex">
              Zarządzaj ćwiczeniami w jednym miejscu. Dodawaj nowe, aktualizuj
              szczegóły i miej całą bazę ćwiczeń zawsze pod ręką.
            </p>
          </div>
          <div className="flex w-1/3 flex-col items-end justify-end gap-2">
            <CustomizedDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              className="gap-5 p-6 sm:max-w-190"
              title={editingExercise ? "Edytuj ćwiczenie" : "Stwórz ćwiczenie"}
              trigger={
                <CustomizedButton
                  className="max-w-44 pt-2 pb-2.5 text-sm"
                  onClick={() => setEditingExercise(null)}
                >
                  <PlusIcon className="mt-0.5 size-5" />
                  Dodaj ćwiczenie
                </CustomizedButton>
              }
            >
              <ExerciseForm
                key={editingExercise?.id ?? "new"}
                exercise={editingExercise}
                onClose={() => setDialogOpen(false)}
              />
            </CustomizedDialog>
          </div>
        </div>
        <div className="mt-4 flex flex-row items-end justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Lista ćwiczeń
          </h2>
          <Badge
            variant="ghost"
            className="rounded-full bg-transparent px-6 py-2 text-secondary"
          >
            {formatExerciseCount(total)}
          </Badge>
        </div>
        <Separator className="my-4" />
        {renderList()}
        {!isError ? (
          <CustomizedPagination
            pagesNumber={totalPages}
            currentPage={page}
            goToPage={goToPage}
          />
        ) : null}
      </div>
    </div>
  );
}
