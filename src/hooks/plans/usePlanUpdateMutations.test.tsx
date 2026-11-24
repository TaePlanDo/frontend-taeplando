import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  updatePlanNameRequest,
  updatePlanStructureRequest,
} from "@/lib/api/plans";
import { queryKeys } from "@/lib/queryKeys";
import { usePlanUpdateMutations } from "./usePlanUpdateMutations";

vi.mock("@/lib/api/plans", () => ({
  updatePlanNameRequest: vi.fn(),
  updatePlanStructureRequest: vi.fn(),
}));

describe("usePlanUpdateMutations", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each(["rename", "reorder"] as const)(
    "refreshes only the affected plan and lists after %s",
    async (operation) => {
      vi.mocked(updatePlanNameRequest).mockResolvedValue({} as never);
      vi.mocked(updatePlanStructureRequest).mockResolvedValue({} as never);
      const client = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const fetchPlan = vi
        .fn()
        .mockResolvedValueOnce("before")
        .mockResolvedValue("after");
      const fetchOther = vi.fn().mockResolvedValue("other");
      const fetchList = vi.fn().mockResolvedValue([]);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(
        () => {
          const mutations = usePlanUpdateMutations();
          const plan = useQuery({
            queryKey: queryKeys.plans.detail("plan-1"),
            queryFn: fetchPlan,
          });
          useQuery({
            queryKey: queryKeys.plans.detail("plan-2"),
            queryFn: fetchOther,
          });
          useQuery({ queryKey: queryKeys.plans.lists(), queryFn: fetchList });
          return { mutations, plan };
        },
        { wrapper },
      );

      await waitFor(() => expect(result.current.plan.data).toBe("before"));
      await waitFor(() => expect(fetchList).toHaveBeenCalledTimes(1));
      await act(async () => {
        if (operation === "rename")
          await result.current.mutations.rename.mutate({
            planId: "plan-1",
            name: "Nowa",
          });
        else
          await result.current.mutations.reorder.mutate({
            planId: "plan-1",
            planExerciseIds: ["slot-2", "slot-1"],
          });
      });
      await waitFor(() => expect(result.current.plan.data).toBe("after"));
      expect(fetchPlan).toHaveBeenCalledTimes(2);
      expect(fetchList).toHaveBeenCalledTimes(2);
      expect(fetchOther).toHaveBeenCalledTimes(1);
    },
  );

  it.each(["rename", "reorder"] as const)(
    "reports an error without invalidating cached data after failed %s",
    async (operation) => {
      vi.mocked(updatePlanNameRequest).mockRejectedValue(new Error("network"));
      vi.mocked(updatePlanStructureRequest).mockRejectedValue(
        new Error("network"),
      );
      const client = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      const invalidate = vi.spyOn(client, "invalidateQueries");
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => usePlanUpdateMutations(), {
        wrapper,
      });
      await act(async () => {
        const request =
          operation === "rename"
            ? result.current.rename.mutate({ planId: "plan-1", name: "Nowa" })
            : result.current.reorder.mutate({
                planId: "plan-1",
                planExerciseIds: ["slot-1"],
              });
        await expect(request).rejects.toThrow(
          operation === "rename"
            ? "Nie udało się zmienić nazwy planu"
            : "Nie udało się zmienić kolejności ćwiczeń",
        );
      });
      expect(invalidate).not.toHaveBeenCalled();
    },
  );
});
