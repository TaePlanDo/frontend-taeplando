import { execFileSync } from "node:child_process";

import { backendDir, backendProcessEnv } from "../env";

function uv(args: string[]): void {
  execFileSync("uv", ["run", ...args], {
    cwd: backendDir,
    env: backendProcessEnv(),
    stdio: "inherit",
    shell: true,
  });
}

export function migrateDatabase(): void {
  uv(["alembic", "upgrade", "head"]);
}
