import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

import { backendDir, backendProcessEnv } from "../env";

export function migrateDatabase(): void {
  execFileSync("uv", ["run", "alembic", "upgrade", "head"], {
    cwd: backendDir,
    env: backendProcessEnv(),
    stdio: "inherit",
    shell: true,
  });
}

export async function seedSystemData(): Promise<void> {
  await promisify(execFile)("uv", ["run", "seed-system-data"], {
    cwd: backendDir,
    env: backendProcessEnv(),
    shell: true,
  });
}
