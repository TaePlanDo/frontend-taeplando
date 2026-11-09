import { describe, expect, it } from "vitest";

import {
  parsePlanListSearchParams,
  toPlanListSearchParams,
} from "./plan-list-search-params";

describe("plan-list-search-params", () => {
  it("round-trips filters and omits full ranges", () => {
    const state = {
      page: 2,
      filters: {
        name: "kata",
        min_age: 6,
        max_age: 16,
        min_duration: 45,
        max_duration: 90,
        training_group_ids: ["8f20d653-dc8b-4b76-bdb4-b225c7d420a6"],
      },
    };
    const params = toPlanListSearchParams(state);
    expect(parsePlanListSearchParams(params)).toEqual(state);
    expect([
      ...toPlanListSearchParams({
        page: 1,
        filters: {
          min_age: 0,
          max_age: 99,
          min_participants: 1,
          max_participants: 99,
          min_duration: 15,
          max_duration: 120,
        },
      }).keys(),
    ]).toEqual([]);
  });
});
