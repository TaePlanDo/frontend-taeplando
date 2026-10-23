import { useQuery } from "@tanstack/react-query";

import {
  getEquipmentRequest,
  getTrainingSegmentsRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";

export function useExerciseCatalogs() {
  return useQuery({
    queryKey: ["exercise-catalogs"],
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
