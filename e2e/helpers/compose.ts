import { execFileSync } from "node:child_process";
import fs from "node:fs";

import {
  backendDir,
  composeFile,
  composeProcessEnv,
  composeProject,
  pgDatabase,
  pgPassword,
  pgUser,
} from "../env";

function assertBackendCheckout(): void {
  if (!fs.existsSync(composeFile)) {
    throw new Error(
      `Backend compose file not found at ${composeFile}. ` +
        `Clone backend-taeplando as a sibling or set BACKEND_DIR.`,
    );
  }
}

function dockerCompose(args: string[]): void {
  assertBackendCheckout();
  execFileSync(
    "docker",
    ["compose", "-p", composeProject, "-f", composeFile, ...args],
    {
      cwd: backendDir,
      env: composeProcessEnv(),
      stdio: "inherit",
    },
  );
}

export function startE2ePostgres(): void {
  dockerCompose(["up", "-d", "--wait"]);
}

export function stopE2ePostgres(removeVolumes: boolean): void {
  dockerCompose(["down", ...(removeVolumes ? ["-v"] : [])]);
}

/** Run SQL inside the e2e Postgres container. */
export function psql(sql: string): void {
  assertBackendCheckout();
  execFileSync(
    "docker",
    [
      "compose",
      "-p",
      composeProject,
      "-f",
      composeFile,
      "exec",
      "-T",
      "-e",
      `PGPASSWORD=${pgPassword}`,
      "postgres",
      "psql",
      "-U",
      pgUser,
      "-d",
      pgDatabase,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    {
      cwd: backendDir,
      env: composeProcessEnv(),
      stdio: "inherit",
    },
  );
}
