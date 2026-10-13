import { apiOrigin } from "../env";

export type LocalTrainer = {
  email: string;
  password: string;
  fullName: string;
};

/**
 * Create a LOCAL trainer through the real register API.
 * Credentials are owned by the test — not the backend seed script.
 */
export async function createLocalTrainer(
  overrides: Partial<LocalTrainer> = {},
): Promise<LocalTrainer> {
  const trainer: LocalTrainer = {
    email: overrides.email ?? `e2e.login.${Date.now()}@example.com`,
    password: overrides.password ?? "E2eLogin1!",
    fullName: overrides.fullName ?? "E2E Trainer",
  };

  const response = await fetch(`${apiOrigin}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: trainer.email,
      password: trainer.password,
      full_name: trainer.fullName,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create e2e trainer (${response.status}): ${await response.text()}`,
    );
  }

  return trainer;
}
