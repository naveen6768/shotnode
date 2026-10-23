/**
 * Render-service configuration. All via env so the same code runs locally,
 * on staging (3021) and in production (3020).
 *
 *   RENDER_PORT     loopback port to listen on (default 3021)
 *   BACKEND_ORIGIN  blog JSON API origin (default http://127.0.0.1:8091)
 *   SITE_ORIGIN     public site origin used for canonical/OG URLs
 *                   (default https://staging.shotnode.pro)
 *   DIST_DIR        built SPA directory containing index.html
 *                   (default <repo>/dist)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function required(name, fallback) {
  const value = (process.env[name] ?? "").trim();
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env ${name}`);
}

export function loadConfig(env = process.env) {
  const get = (name, fallback) => {
    const value = (env[name] ?? "").trim();
    return value || fallback;
  };
  const backendOrigin = get("BACKEND_ORIGIN", "http://127.0.0.1:8091").replace(/\/+$/, "");
  const siteOrigin = get("SITE_ORIGIN", "https://staging.shotnode.pro").replace(/\/+$/, "");
  const distDir = get("DIST_DIR", path.join(REPO_ROOT, "dist"));
  const port = Number(get("RENDER_PORT", "3021"));
  if (!Number.isInteger(port) || port <= 0) throw new Error(`Invalid RENDER_PORT: ${get("RENDER_PORT", "3021")}`);
  for (const [label, url] of [["BACKEND_ORIGIN", backendOrigin], ["SITE_ORIGIN", siteOrigin]]) {
    if (!/^https?:\/\//.test(url)) throw new Error(`Invalid ${label}: ${url}`);
  }
  return { port, backendOrigin, siteOrigin, distDir };
}

export { required };
