import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getPlansRequest } from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";

export function usePlans(name = "") {
  return usePaginatedList({
    queryKey: [...queryKeys.plans.lists(), { name }],
    fetchPage: (page, pageSize) => getPlansRequest(page, pageSize, name),
  });
}
