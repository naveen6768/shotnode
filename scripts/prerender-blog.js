/** Build-time fallback for the launch editorial. The dynamic render service
 * remains the path for CMS posts and previews after deployment. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchPosts } from "../src/data/launchPosts.js";
import { createCache } from "../server/render/cache.js";
import { splitTemplate, stripStaticSeo } from "../server/render/html.js";
import { route } from "../server/render/server.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const shell = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const parts = { shell, parts: splitTemplate(shell), baseHead: stripStaticSeo(shell.slice(0, shell.indexOf("</head>"))) };
const siteOrigin = (process.env.SITE_ORIGIN ||
  (process.env.SITE_DOMAIN ? `https://${process.env.SITE_DOMAIN}` : null) ||
  (process.env.SHOTNODE_BUILD_MODE === "development" ? "https://staging.shotnode.pro" : "https://shotnode.pro"))
  .replace(/\/+$/, "");
const unavailableBackend = async () => ({ status: 503, json: async () => null, text: async () => "" });
const routes = [
  "/blog",
  ...launchPosts.map((post) => `/blog/${post.slug}`),
  ...new Set(launchPosts.map((post) => `/blog/category/${post.category.slug}`)),
  ...new Set(launchPosts.flatMap((post) => post.tags.map((tag) => `/blog/tag/${tag.slug}`))),
  ...new Set(launchPosts.map((post) => `/blog/author/${post.author.slug}`)),
  "/sitemap.xml", "/sitemap-pages.xml", "/sitemap-blog.xml", "/blog/rss.xml",
];

for (const urlPath of routes) {
  const result = await route({
    path: urlPath,
    parts,
    backendOrigin: "http://127.0.0.1:9",
    siteOrigin,
    fetchImpl: unavailableBackend,
    cache: createCache({ max: 1, ttlMs: 1 }),
  });
  if (result.status !== 200) throw new Error(`Could not prerender ${urlPath}: ${result.status}`);
  const target = urlPath.endsWith(".xml")
    ? path.join(dist, urlPath.slice(1))
    : path.join(dist, urlPath.slice(1), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, result.body);
}

console.log(`Prerendered ${routes.length} blog and feed routes.`);
