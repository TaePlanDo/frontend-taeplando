import { useQuery } from "@tanstack/react-query";

import {
  getEquipmentRequest,
  getTrainingSegmentsRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";
import { queryKeys } from "@/lib/queryKeys";

export function useExerciseCatalogs() {
  return useQuery({
    queryKey: queryKeys.exercises.catalogs(),
    queryFn: async () => {
      const [equipment, trainingTypes, segments] = await Promise.all([
        getEquipmentRequest(),
        getTrainingTypesRequest(),
        getTrainingSegmentsRequest(),
      ]);
      return { equipment, trainingTypes, segments };
    },
  });
}
