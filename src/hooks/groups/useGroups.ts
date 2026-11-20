import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getGroupsRequest } from "@/lib/api/group";
import { queryKeys } from "@/lib/queryKeys";

export function useGroups() {
  return usePaginatedList({
    pageSize: 8,
    queryKey: queryKeys.groups.lists(),
    fetchPage: getGroupsRequest,
  });
}
