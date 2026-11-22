import { usePaginatedList } from "@/hooks/pagination/usePaginatedList";
import { getEquipmentPageRequest } from "@/lib/api/equipment";
import { LIST_PAGE_SIZES } from "@/lib/constants/pagination";
import { queryKeys } from "@/lib/queryKeys";

export function useEquipment() {
  return usePaginatedList({
    pageSize: LIST_PAGE_SIZES.EQUIPMENT,
    queryKey: queryKeys.equipment.lists(),
    fetchPage: getEquipmentPageRequest,
  });
}
