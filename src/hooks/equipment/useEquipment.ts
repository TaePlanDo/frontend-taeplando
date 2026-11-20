import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getEquipmentPageRequest } from "@/lib/api/equipment";
import { queryKeys } from "@/lib/queryKeys";

export function useEquipment() {
  return usePaginatedList({
    pageSize: 20,
    queryKey: queryKeys.equipment.lists(),
    fetchPage: getEquipmentPageRequest,
  });
}
