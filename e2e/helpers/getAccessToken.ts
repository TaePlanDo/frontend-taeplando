import { apiOrigin } from "../env";

import type { LocalTrainer } from "./createLocalTrainer";

/**
 * Log in through the real API and return the Bearer token for API helpers.
 */
export async function getAccessToken(trainer: LocalTrainer): Promise<string> {
  const response = await fetch(`${apiOrigin}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: trainer.email,
      password: trainer.password,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to login (${response.status}): ${await response.text()}`,
    );
  }

  const { access_token } = (await response.json()) as {
    access_token: string;
  };
  return access_token;
}
