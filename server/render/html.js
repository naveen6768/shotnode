/**
 * HTML string operations: escaping, data-island encoding, template markers.
 * No DOM, no React — pure functions, fully unit-tested.
 */
import { createHash } from "node:crypto";

/** Escape text for interpolation into HTML content or double-quoted attrs. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Encode a JSON payload for `window.__SHOTNODE_BLOG__`. Escapes `<`, `>`,
 * `&` (XSS) plus U+2028/U+2029 (valid JSON, invalid JS string content).
 */
export function encodeIsland(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** sha256 hex of a string (CSP `script-src` hash for the data island). */
export function sha256Hex(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export const TITLE_RE = /<title>[\s\S]*?<\/title>/;
export const ROOT_OPEN = '<div id="root">';

/**
 * Split the built shell into head/tail at `</head>` and locate `#root`.
 * Throws when a marker is missing (fail fast at startup).
 */
export function splitTemplate(shell) {
  const headClose = shell.indexOf("</head>");
  if (headClose === -1) throw new Error("Template marker missing: </head>");
  if (!TITLE_RE.test(shell.slice(0, headClose))) throw new Error("Template marker missing: <title>");
  const rootOpen = shell.indexOf(ROOT_OPEN, headClose);
  if (rootOpen === -1) throw new Error('Template marker missing: <div id="root">');
  const rootClose = shell.indexOf("</div>", rootOpen);
  if (rootClose === -1) throw new Error("Template marker missing: closing #root div");
  return {
    head: shell.slice(0, headClose),
    afterHead: shell.slice(headClose),
    rootOpenEnd: rootOpen + ROOT_OPEN.length,
    rootCloseStart: rootClose,
  };
}

/** Remove the shell's static SEO tags (replaced per route). Missing tags are fine. */
export function stripStaticSeo(head) {
  return head
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/i, "")
    .replace(/<meta\s+property="og:(type|title|description|site_name)"[\s\S]*?\/>\s*/gi, "")
    .replace(/<meta\s+name="twitter:(title|description|card)"[\s\S]*?\/>\s*/gi, "");
}
