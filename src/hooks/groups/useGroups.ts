import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getGroupsRequest } from "@/lib/api/group";
import { LIST_PAGE_SIZES } from "@/lib/constants/pagination";
import { queryKeys } from "@/lib/queryKeys";

export function useGroups() {
  return usePaginatedList({
    pageSize: LIST_PAGE_SIZES.GROUPS,
    queryKey: queryKeys.groups.lists(),
    fetchPage: getGroupsRequest,
  });
}
