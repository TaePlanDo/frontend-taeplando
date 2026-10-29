import { apiOrigin } from "../env";

import type { LocalTrainer } from "./createLocalTrainer";

/**
 * Create trainer-owned equipment through the real API (Bearer from login).
 */
export async function createEquipment(
  trainer: LocalTrainer,
  name: string,
): Promise<{ id: string; name: string }> {
  const loginResponse = await fetch(`${apiOrigin}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: trainer.email,
      password: trainer.password,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(
      `Failed to login for equipment create (${loginResponse.status}): ${await loginResponse.text()}`,
    );
  }

  const { access_token } = (await loginResponse.json()) as {
    access_token: string;
  };

  const response = await fetch(`${apiOrigin}/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
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
