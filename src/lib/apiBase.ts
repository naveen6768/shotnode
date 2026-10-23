/**
 * Single API origin for the public site. `VITE_SHOTNODE_API_BASE` may be the
 * site origin (`https://shotnode.pro`) or already include `/api/v1`; both are
 * normalized here so page code never repeats the stripping.
 */
function readEnvBase(): string {
  const env = (import.meta as ImportMeta & { env?: { VITE_SHOTNODE_API_BASE?: string } })
    .env;
  return (env?.VITE_SHOTNODE_API_BASE ?? "https://shotnode.pro").trim();
}

export const API_BASE = readEnvBase()
  .replace(/\/+$/, "")
  .replace(/\/api\/v1$/, "");

/** Absolute URL for an API path such as `/api/v1/blog/posts`. */
export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

/** Absolute URL for a backend-served relative path (media `src`, og images). */
export function absoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return apiUrl(path);
}
