import { describe, expect, it } from "vitest";

import { planFixture } from "@/test/planFixture";
import { mapPlanExerciseToSnapshot } from "./plan";

describe("mapPlanExerciseToSnapshot", () => {
  it("preserves all media URLs from the plan snapshot", () => {
    const snapshot = mapPlanExerciseToSnapshot({
      ...planFixture.exercises[0],
      image_url_snapshot: "https://example.com/thumb-dark.webp",
      animation_url_snapshot: "https://example.com/anim-dark.webp",
      image_url_light_snapshot: "https://example.com/thumb-light.webp",
      animation_url_light_snapshot: "https://example.com/anim-light.webp",
    });

    expect(snapshot).toMatchObject({
      image_url: "https://example.com/thumb-dark.webp",
      animation_url: "https://example.com/anim-dark.webp",
      image_url_light: "https://example.com/thumb-light.webp",
      animation_url_light: "https://example.com/anim-light.webp",
    });
  });

  it("preserves missing media in historical snapshots", () => {
    expect(mapPlanExerciseToSnapshot(planFixture.exercises[0])).toMatchObject({
      image_url: null,
      animation_url: null,
      image_url_light: null,
      animation_url_light: null,
    });
  });
});
