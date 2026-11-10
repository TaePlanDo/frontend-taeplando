import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { useGroupOptions } from "@/hooks/groups/useGroupOptions";
import { useOnlineState } from "@/hooks/useOnlineState";
import {
  getEquipmentRequest,
  getTrainingTypesRequest,
} from "@/lib/api/catalogs";
import { queryKeys } from "@/lib/queryKeys";

type OptionsStatus = "loading" | "offline" | "error" | "ready";

function catalogOptions<T>(query: UseQueryResult<T[]>, offline: boolean) {
  const status: OptionsStatus = query.isPending
    ? offline
      ? "offline"
      : "loading"
    : query.isError
      ? "error"
      : "ready";
  return { items: query.data ?? [], status };
}

export function usePlanGenerationOptions() {
  const isOnline = useOnlineState();
  const groups = useGroupOptions();
  const equipment = useQuery({
    queryKey: queryKeys.equipment.options(),
    queryFn: getEquipmentRequest,
  });
  const trainingTypes = useQuery({
    queryKey: queryKeys.trainingTypes.options(),
    queryFn: getTrainingTypesRequest,
  });

  const queries = [
    { query: groups, label: "grup treningowych" },
    { query: equipment, label: "sprzętu" },
    { query: trainingTypes, label: "typów treningu" },
  ];
  const failed = queries.filter(({ query }) => query.isError);
  const offline =
    !isOnline &&
    queries.some(
      ({ query }) => query.isPending || query.isError || query.isPaused,
    );
  const groupOptions = catalogOptions(groups, offline);
  const equipmentOptions = catalogOptions(equipment, offline);
  const typeOptions = catalogOptions(trainingTypes, offline);
  const noGroups =
    groupOptions.status === "ready" && groupOptions.items.length === 0;

  const state = offline
    ? {
        kind: "offline" as const,
        message:
          "Brak połączenia z internetem. Połącz się z internetem i spróbuj ponownie.",
      }
    : failed.length > 0
      ? {
          kind: "error" as const,
          message: `Nie udało się pobrać ${failed.map(({ label }) => label).join(", ")}.`,
          retrying: failed.some(({ query }) => query.isFetching),
        }
      : queries.some(({ query }) => query.isPending)
        ? { kind: "loading" as const }
        : noGroups
          ? { kind: "empty" as const }
          : { kind: "ready" as const };

  async function retry() {
    await Promise.all(failed.map(({ query }) => query.refetch()));
  }

  return {
    groups: groupOptions,
    equipment: equipmentOptions,
    trainingTypes: typeOptions,
    state,
    retry,
  };
}
