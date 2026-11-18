import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Workers Builds may have already run `npm run build` before the deploy command.
if (process.env.WORKERS_CI !== "1" || !existsSync("out/index.html")) {
  const next = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
  const { status, error } = spawnSync(process.execPath, [next, "build", "--webpack"], {
    env: { ...process.env, WORKERS_CI: "1" },
    stdio: "inherit",
  });
  if (error) throw error;
  if (status !== 0) process.exit(status ?? 1);
}
