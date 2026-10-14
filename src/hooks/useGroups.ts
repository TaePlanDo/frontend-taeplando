import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getGroupsRequest } from "@/lib/api/group";
import { queryKeys } from "@/lib/queryKeys";

export function useGroups() {
  return usePaginatedList({
    queryKey: queryKeys.groups.lists(),
    fetchPage: getGroupsRequest,
  });
}
