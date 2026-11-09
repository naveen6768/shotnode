/** Preserve Vite CLI flags (notably --mode) before generating blog pages. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const modeFlag = args.findIndex((arg) => arg === "--mode");
const mode = modeFlag >= 0 ? args[modeFlag + 1] : (args.find((arg) => arg.startsWith("--mode="))?.slice(7) || "production");
const env = { ...process.env, SHOTNODE_BUILD_MODE: mode };

function run(script, scriptArgs = []) {
  const result = spawnSync(process.execPath, [path.join(root, script), ...scriptArgs], { cwd: root, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node_modules/vite/bin/vite.js", ["build", ...args]);
run("scripts/prerender-blog.js");
