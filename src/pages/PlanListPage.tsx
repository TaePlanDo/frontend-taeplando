import { Link, useNavigate } from "react-router-dom";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { PlanCardItem } from "@/components/plan/PlanCardItem";
import { PlanListFiltersBar } from "@/components/plan/PlanListFiltersBar";
import { CustomizedButton } from "@/components/shared/CustomizedButton";
import { CustomizedPagination } from "@/components/shared/CustomizedPagination";
import { ListStateView } from "@/components/shared/ListStateView";
import { ManagementPageLayout } from "@/components/shared/ManagementPageLayout";
import { Badge } from "@/components/ui/badge";
import { useDeletePlan } from "@/hooks/plans/useDeletePlan";
import { usePlanListSearchParams } from "@/hooks/plans/usePlanListSearchParams";
import { usePlans } from "@/hooks/plans/usePlans";
import { hasDisplayableListData } from "@/hooks/pagination/listState";
import { formatPlanCount } from "@/lib/format/plural";
import type { PlanListItem } from "@/types/plan";

export function PlanListPage() {
  const navigate = useNavigate();
  const {
    filters,
    page: pageFromUrl,
    dialogFilterCount,
    hasActiveFilters,
    setFilters,
    setPage,
    setName,
    clearDimension,
  } = usePlanListSearchParams();
  const {
    items: plans,
    page,
    totalPages,
    total,
    isFetching,
    listState,
    refetch,
    goToPage,
  } = usePlans({
    filters,
    page: pageFromUrl,
    onPageChange: setPage,
  });
  const { deletePlan } = useDeletePlan();
  const showListMetadata = hasDisplayableListData(listState);
  const isListUnavailable = listState.kind === "unavailable";

  async function handleDelete(plan: PlanListItem) {
    try {
      await deletePlan(plan.id);
      toast.success("Plan został usunięty");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <ManagementPageLayout
      title="Zapisane plany"
      description="Przeglądaj wygenerowane plany treningowe, filtruj je po parametrach lub grupach i usuwaj niepotrzebne."
      sectionTitle="Lista planów"
      sectionAccessory={
        showListMetadata ? (
          <Badge
            variant="ghost"
            className="h-10 shrink-0 rounded-full border border-border bg-transparent px-4 text-sm font-medium text-foreground lg:hidden"
          >
            {formatPlanCount(total)}
          </Badge>
        ) : null
      }
      toolbar={
        isListUnavailable ? null : (
          <PlanListFiltersBar
            filters={filters}
            dialogFilterCount={dialogFilterCount}
            total={total}
            onNameChange={setName}
            onFiltersApply={setFilters}
            onClearDimension={clearDimension}
          />
        )
      }
      action={
        <CustomizedButton
          className="w-auto max-w-52 px-4 pt-2 pb-2.5 text-sm"
          asChild
        >
          <Link to="/plans/new">
            <PlusIcon className="mt-0.5 size-5" />
            <span className="lg:hidden">Generuj</span>
            <span className="hidden lg:inline">Generuj nowy plan</span>
          </Link>
        </CustomizedButton>
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
        errorTitle="Nie udało się wczytać planów"
        errorMessage="Sprawdź połączenie i spróbuj ponownie"
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyTitle={
          hasActiveFilters
            ? "Brak planów spełniających kryteria"
            : "Brak planów"
        }
        emptyMessage={
          hasActiveFilters
            ? "Zmień filtry parametrów lub wybierz inne grupy"
            : "Kliknij generuj nowy plan, aby utworzyć swój pierwszy plan treningowy"
        }
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <PlanCardItem
              key={plan.id}
              plan={plan}
              onOpen={() => navigate(`/plans/${plan.id}`)}
              onDelete={() => handleDelete(plan)}
            />
          ))}
        </div>
      </ListStateView>
    </ManagementPageLayout>
  );
}
