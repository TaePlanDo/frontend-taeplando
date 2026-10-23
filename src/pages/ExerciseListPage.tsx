import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { ExerciseCardItem } from "@/components/exercise/ExerciseCardItem";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { EmptyListView } from "@/components/shared/EmptyListView";
import { ErrorListView } from "@/components/shared/ErrorListView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useExercises } from "@/hooks/exercises/useExercises";
import { useDeleteExercise } from "@/hooks/exercises/useDeleteExercise";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Exercise } from "@/types/exercise";
import { toast } from "sonner";

export function ExerciseListPage() {
  const [mockExercises, setMockExercises] = useState<Exercise[]>([]);
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

  const displayedExercises =
    page === 1 ? [...mockExercises, ...exercises].slice(0, 6) : exercises;
  const displayedTotal = total + mockExercises.length;

  function addMockExercise() {
    setMockExercises((currentExercises) => [
      {
        id: `mock-${crypto.randomUUID()}`,
        owner_user_id: "mock-owner",
        scope: "PRIVATE",
        image_url: "/exercise-icon.png",
        name: "Nowe przykładowe ćwiczenie",
        description: "Ćwiczenie dodane tymczasowo po stronie frontendu.",
        min_age: 7,
        max_age: 18,
        min_participants: 1,
        max_participants: 20,
        duration_minutes: 10,
        status: "ACTIVE",
      },
      ...currentExercises,
    ]);
  }

  async function handleDelete(exercise: Exercise) {
    if (mockExercises.some(({ id }) => id === exercise.id)) {
      setMockExercises((currentExercises) =>
        currentExercises.filter(({ id }) => id !== exercise.id),
      );
      toast.success("Ćwiczenie zostało usunięte");
      return;
    }

    try {
      await deleteExercise(exercise.id);
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

    if (displayedTotal === 0) {
      return (
        <EmptyListView
          title="Jeszcze nie masz żadnych ćwiczeń"
          message="Kliknij dodaj ćwiczenie, aby utworzyć swoje pierwsze ćwiczenie"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {displayedExercises.map((exercise) => (
          <ExerciseCardItem
            key={exercise.id}
            exercise={exercise}
            onDelete={() => handleDelete(exercise)}
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
            <CustomizedButton
              className="max-w-44 pt-2 pb-2.5 text-sm"
              onClick={addMockExercise}
            >
              <PlusIcon className="mt-0.5 size-5" />
              Dodaj ćwiczenie
            </CustomizedButton>
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
            {displayedTotal} ćwiczeń
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
