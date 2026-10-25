import { useQuery } from "@tanstack/react-query";

import { getTrainingSegmentsRequest } from "@/lib/api/training-segments";
import { queryKeys } from "@/lib/queryKeys";

export function useTrainingSegments() {
  const query = useQuery({
    queryKey: queryKeys.trainingSegments.list(),
    queryFn: getTrainingSegmentsRequest,
  });

  return {
    segments: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
