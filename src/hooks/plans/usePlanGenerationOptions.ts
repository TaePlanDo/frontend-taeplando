import { useQuery } from "@tanstack/react-query";

import {
  getEquipmentRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";
import { getAllGroupsRequest } from "@/lib/api/group";
import { queryKeys } from "@/lib/queryKeys";

export function usePlanGenerationOptions() {
  const groups = useQuery({
    queryKey: queryKeys.groups.options(),
    queryFn: getAllGroupsRequest,
  });
  const equipment = useQuery({
    queryKey: queryKeys.equipment.options(),
    queryFn: getEquipmentRequest,
  });
  const trainingTypes = useQuery({
    queryKey: queryKeys.trainingTypes.options(),
    queryFn: getTrainingTypesRequest,
  });

  return { groups, equipment, trainingTypes };
}
