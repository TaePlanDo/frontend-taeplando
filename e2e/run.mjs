import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "..");

const playwrightArgs = [];
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--backend-dir=")) {
    process.env.BACKEND_DIR = path.resolve(arg.slice("--backend-dir=".length));
    continue;
  }
  if (arg === "--backend-dir") {
    console.error("Use --backend-dir=<path>");
    process.exit(1);
  }
  playwrightArgs.push(arg);
}

const playwrightCli = path.join(
  frontendRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

const child = spawn(
  process.execPath,
  [playwrightCli, "test", ...playwrightArgs],
  {
    cwd: frontendRoot,
    env: process.env,
    stdio: "inherit",
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 1);
});
