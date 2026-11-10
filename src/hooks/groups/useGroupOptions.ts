import { useQuery } from "@tanstack/react-query";

import { getAllGroupsRequest } from "@/lib/api/group";
import { queryKeys } from "@/lib/queryKeys";

export function useGroupOptions() {
  return useQuery({
    queryKey: queryKeys.groups.options(),
    queryFn: getAllGroupsRequest,
  });
}
