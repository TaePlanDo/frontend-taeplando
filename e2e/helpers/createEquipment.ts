import { apiOrigin } from "../env";

import type { LocalTrainer } from "./createLocalTrainer";
import { getAccessToken } from "./getAccessToken";

/**
 * Create trainer-owned equipment through the real API (Bearer from login).
 */
export async function createEquipment(
  trainer: LocalTrainer,
  name: string,
): Promise<{ id: string; name: string }> {
  const accessToken = await getAccessToken(trainer);

  const response = await fetch(`${apiOrigin}/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create equipment (${response.status}): ${await response.text()}`,
    );
  }

  return response.json() as Promise<{ id: string; name: string }>;
}
