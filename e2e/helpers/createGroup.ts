import { apiOrigin } from "../env";

import type { LocalTrainer } from "./createLocalTrainer";
import { getAccessToken } from "./getAccessToken";

export type GroupValues = {
  name: string;
  minAge: number;
  maxAge: number;
  durationMinutes: number;
};

/**
 * Create a training group through the real API (Bearer from login).
 */
export async function createGroup(
  trainer: LocalTrainer,
  group: GroupValues,
): Promise<{ id: string; name: string }> {
  const accessToken = await getAccessToken(trainer);

  const response = await fetch(`${apiOrigin}/training-groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: group.name,
      min_age: group.minAge,
      max_age: group.maxAge,
      duration_minutes: group.durationMinutes,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to create group (${response.status}): ${await response.text()}`,
    );
  }

  return response.json() as Promise<{ id: string; name: string }>;
}
