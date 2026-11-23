import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { queryKeys } from "@/lib/queryKeys";
import { usePlanExerciseMutations } from "./usePlanExerciseMutations";

vi.mock("@/lib/api/plans", () => ({
  replacePlanExerciseRequest: vi.fn().mockResolvedValue({}),
  deletePlanExerciseRequest: vi.fn().mockResolvedValue(undefined),
}));

describe("usePlanExerciseMutations", () => {
  it.each(["replace", "remove"] as const)(
    "refreshes the affected plan and list after %s",
    async (operation) => {
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
      const fetchList = vi.fn().mockResolvedValue([]);
      const fetchOtherPlan = vi.fn().mockResolvedValue("other");
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(
        () => {
          const mutations = usePlanExerciseMutations();
          const plan = useQuery({
            queryKey: queryKeys.plans.detail("plan-1"),
            queryFn: fetchPlan,
          });
          useQuery({
            queryKey: queryKeys.plans.detail("plan-2"),
            queryFn: fetchOtherPlan,
          });
          useQuery({ queryKey: queryKeys.plans.lists(), queryFn: fetchList });
          return { mutations, plan };
        },
        { wrapper },
      );

      await waitFor(() => expect(result.current.plan.data).toBe("before"));
      await waitFor(() => expect(fetchList).toHaveBeenCalledTimes(1));
      await act(async () => {
        if (operation === "replace") {
          await result.current.mutations.replace.mutate({
            planId: "plan-1",
            planExerciseId: "slot-1",
            exerciseId: "exercise-1",
          });
        } else {
          await result.current.mutations.remove.mutate({
            planId: "plan-1",
            planExerciseId: "slot-1",
          });
        }
      });

      await waitFor(() => expect(result.current.plan.data).toBe("after"));
      expect(fetchPlan).toHaveBeenCalledTimes(2);
      expect(fetchList).toHaveBeenCalledTimes(2);
      expect(fetchOtherPlan).toHaveBeenCalledTimes(1);
    },
  );
});
