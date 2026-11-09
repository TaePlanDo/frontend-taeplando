import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getPlansRequest } from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";
import type { PlanListFilters } from "@/types/plan-list-filters";

type UsePlansOptions = {
  filters?: PlanListFilters;
  page: number;
  onPageChange: (page: number) => void;
};

export function usePlans({
  filters = {},
  page,
  onPageChange,
}: UsePlansOptions) {
  return usePaginatedList({
    queryKey: [...queryKeys.plans.lists(), filters],
    fetchPage: (currentPage, pageSize) =>
      getPlansRequest(currentPage, pageSize, filters),
    page,
    onPageChange,
  });
}
