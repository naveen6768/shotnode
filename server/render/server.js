/**
 * Blog SEO render service: injects meta/canonical/OG/JSON-LD + article HTML
 * into the built SPA shell for crawler-complete blog pages.
 *
 * Routes: /blog, /blog/category/:slug, /blog/tag/:slug, /blog/author/:slug,
 *   /blog/:slug, /blog/preview/:token, /blog/rss.xml, /sitemap.xml (+ index
 *   parts), /healthz.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.js";
import { findLaunchPost, launchPosts, launchSummaries } from "../../src/data/launchPosts.js";
import { createCache } from "./cache.js";
import { escapeHtml, splitTemplate, stripStaticSeo, TITLE_RE } from "./html.js";
import {
  FETCH_TIMEOUT_MS,
  articleMarkup,
  cardMarkup,
  fetchJson,
  headTags,
  indexMarkup,
  islandScript,
  jsonLdBlogIndex,
  jsonLdBlogPosting,
  jsonLdBreadcrumb,
  ogUrl,
} from "./inject.js";

function log(fields) {
  process.stdout.write(JSON.stringify({ service: "blog-render", ...fields }) + "\n");
}

function cspFor(islandHash) {
  return [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "frame-src https://www.youtube-nocookie.com",
    `script-src 'self' 'sha256-${islandHash}'`,
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
  ].join("; ");
}

export function buildPage({ shell, parts, baseHead, title, headExtra, rootHtml, islandPath, islandKind, islandData, extraHeaders = {} }) {
  const headEnd = shell.indexOf("</head>");
  const head = baseHead.replace(TITLE_RE, `<title>${title}</title>`) + "\n" + headExtra;
  const { script, hash } = islandScript(islandPath, islandKind, islandData);
  const html =
    head +
    shell.slice(headEnd, parts.rootOpenEnd) +
    rootHtml +
    script +
    shell.slice(parts.rootCloseStart);
  return { html, hash, headers: { "content-security-policy": cspFor(hash), ...extraHeaders } };
}

export function startServer({ port, backendOrigin, siteOrigin, distDir, shellOverride = null, fetchImpl = fetch } = {}) {
  const shell = shellOverride ?? fs.readFileSync(`${distDir}/index.html`, "utf8");
  const parts = splitTemplate(shell);
  const baseHead = stripStaticSeo(shell.slice(0, shell.indexOf("</head>")));
  const cache = createCache({ max: 500, ttlMs: 60_000 });

  const server = http.createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname;
    let status = 200;
    let headers = {};
    let body = "";
    let cacheHit = false;
    let backendMs = null;

    try {
      const out = await route({ path, parts: { shell, parts, baseHead }, backendOrigin, siteOrigin, fetchImpl, cache });
      status = out.status;
      headers = out.headers;
      body = out.body;
      cacheHit = out.cacheHit ?? false;
      backendMs = out.backendMs ?? null;
    } catch (err) {
      status = 500;
      body = "render error";
      log({ path, status, error: String(err && err.message ? err.message : err) });
    }
    if (!res.headersSent) {
      res.writeHead(status, { "content-type": "text/html; charset=utf-8", ...headers });
      res.end(body);
    }
    log({ path, status, cacheHit, backendMs, ms: Date.now() - started });
  });

  server.listen(port, "127.0.0.1");
  return { server, cache };
}

export async function route({ path, parts, backendOrigin, siteOrigin, fetchImpl, cache }) {
  if (path === "/healthz") {
    return { status: 200, headers: { "content-type": "text/plain" }, body: "ok", cacheHit: false };
  }
  if (path === "/sitemap.xml" || path === "/sitemap-pages.xml" || path === "/sitemap-blog.xml" || path === "/blog/rss.xml") {
    return routeFeed({ path, backendOrigin, siteOrigin, fetchImpl });
  }

  const cached = cache.get(path);
  if (cached) return { ...cached, cacheHit: true };

  const m =
    path === "/blog" ? { kind: "index" }
    : path.startsWith("/blog/category/") ? { kind: "category", slug: decode(path.slice("/blog/category/".length)) }
    : path.startsWith("/blog/tag/") ? { kind: "tag", slug: decode(path.slice("/blog/tag/".length)) }
    : path.startsWith("/blog/author/") ? { kind: "author", slug: decode(path.slice("/blog/author/".length)) }
    : path.startsWith("/blog/preview/") ? { kind: "preview", token: decode(path.slice("/blog/preview/".length)) }
    : path.startsWith("/blog/") && !path.slice(6).includes("/") ? { kind: "post", slug: decode(path.slice(6)) }
    : null;
  if (!m) return plainShell(parts, 404, true);

  const t0 = Date.now();
  try {
    const out = await renderBlogRoute({ ...m, path, parts, backendOrigin, siteOrigin, fetchImpl });
    out.backendMs = Date.now() - t0;
    if (out.status === 200 && m.kind !== "preview") cache.set(path, { status: out.status, headers: out.headers, body: out.body });
    return { ...out, cacheHit: false };
  } catch (err) {
    const backendMs = Date.now() - t0;
    if (process.env.RENDER_DEBUG) console.error("ROUTE_ERROR", path, err && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : String(err));
    if (m.kind === "post" || m.kind === "preview") {
      return {
        status: 503,
        headers: { "retry-after": "30", "cache-control": "no-store" },
        body: "upstream unavailable",
        cacheHit: false,
        backendMs,
      };
    }
    return { ...plainShell(parts, 200, false).body ?? {}, status: 200, headers: {}, body: plainShell(parts, 200, false).body, cacheHit: false, backendMs };
  }

  function decode(s) {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }
}

function plainShell(parts, status, noindex) {
  const { html, headers } = buildPage({
    ...parts,
    title: "ShotNode Blog",
    headExtra: noindex ? '<meta name="robots" content="noindex,nofollow" />\n' : "",
    rootHtml: "",
    islandPath: "/blog",
    islandKind: "empty",
    islandData: null,
  });
  return { status, headers, body: html, cacheHit: false };
}

async function renderBlogRoute({ kind, slug, token, path, parts, backendOrigin, siteOrigin, fetchImpl }) {
  if (kind === "index") {
    const r = await fetchJson(backendOrigin, "/api/v1/blog/posts?limit=12", { fetchImpl });
    const data = mergeLaunchPosts(r.status === 200 ? r.data : null);
    const items = data.items;
    const posts = items.map((p) => ({ title: p.title, url: `${siteOrigin}/blog/${p.slug}` }));
    const headExtra = headTags({
      title: "ShotNode Blog",
      description: "Practical ideas for filming, editing, and sharing more memorable videos.",
      canonical: `${siteOrigin}/blog`,
      robots: null,
      og: { type: "website", url: `${siteOrigin}/blog` },
      jsonLd: [jsonLdBlogIndex(posts, `${siteOrigin}/blog`)],
    });
    const { html, headers } = buildPage({
      ...parts,
      title: "ShotNode Blog",
      headExtra,
      rootHtml: `<div class="blog-page container">${indexMarkup(items, siteOrigin)}</div>`,
      islandPath: "/blog",
      islandKind: "index",
      islandData: data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  if (kind === "category" || kind === "tag") {
    const q = kind === "category" ? `category=${encodeURIComponent(slug)}` : `tag=${encodeURIComponent(slug)}`;
    const r = await fetchJson(backendOrigin, `/api/v1/blog/posts?limit=12&${q}`, { fetchImpl });
    const data = mergeLaunchPosts(r.status === 200 ? r.data : null, kind === "category" ? { category: slug } : { tag: slug });
    const displayName = kind === "category"
      ? data.items[0]?.category?.name
      : data.items.flatMap((post) => post.tags ?? []).find((tag) => tag.slug === slug)?.name;
    const title = displayName ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    const label = `${kind === "category" ? "Category" : "Tag"}: ${title}`;
    const headExtra = headTags({
      title: `${label} — ShotNode Blog`,
      description: `Stories filed under ${title} on the ShotNode blog.`,
      canonical: `${siteOrigin}${path}`,
      robots: null,
      og: { type: "website", url: `${siteOrigin}${path}` },
    });
    const cards = data.items.map((p) => cardMarkup(p, siteOrigin)).join("");
    const { html, headers } = buildPage({
      ...parts,
      title: `${label} — ShotNode Blog`,
      headExtra,
      rootHtml: `<div class="blog-page container"><span class="blog-eyebrow">${kind === "category" ? "Category" : "Tag"}</span><h1 class="blog-h1">${escapeHtml(title)}</h1><div class="blog-grid">${cards}</div></div>`,
      islandPath: path,
      islandKind: kind,
      islandData: data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  if (kind === "author") {
    const r = await fetchJson(backendOrigin, `/api/v1/blog/authors/${encodeURIComponent(slug)}`, { fetchImpl });
    const localAuthor = slug === "shotnode-editorial" ? launchPosts[0].author : null;
    if (r.status === 404 && !localAuthor) return plainShell(parts, 404, true);
    if (r.status !== 200 && !localAuthor) return plainShell(parts, 200, false);
    const author = r.data?.author ?? localAuthor;
    const cmsPosts = r.data?.posts ?? [];
    const existing = new Set(cmsPosts.map((post) => post.slug));
    const data = { author, posts: [...cmsPosts, ...launchSummaries({ author: slug }).filter((post) => !existing.has(post.slug))] };
    const cards = data.posts.map((p) => cardMarkup(p, siteOrigin)).join("");
    const headExtra = headTags({
      title: `${author.displayName} — ShotNode Blog`,
      description: author.bio ?? `Stories by ${author.displayName}.`,
      canonical: `${siteOrigin}${path}`,
      robots: null,
      og: { type: "profile", url: `${siteOrigin}${path}` },
    });
    const { html, headers } = buildPage({
      ...parts,
      title: `${author.displayName} — ShotNode Blog`,
      headExtra,
      rootHtml: `<div class="blog-page container"><h1 class="blog-h1">${escapeHtml(author.displayName)}</h1><div class="blog-grid">${cards}</div></div>`,
      islandPath: path,
      islandKind: "author",
      islandData: data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  // post + preview share the detail renderer; preview never caches/counts.
  const isPreview = kind === "preview";
  const apiPath = isPreview ? `/api/v1/blog/preview/${encodeURIComponent(token)}` : `/api/v1/blog/posts/${encodeURIComponent(slug)}`;
  const r = await fetchJson(backendOrigin, apiPath, { fetchImpl });
  const localPost = isPreview ? null : findLaunchPost(slug);
  if (r.status === 404 && !localPost) return plainShell(parts, 404, true);
  if ((r.status !== 200 || !r.data?.post) && !localPost) throw new Error(`blog backend status ${r.status}`);
  const post = r.data?.post ?? localPost;
  const data = r.data?.post ? r.data : { post, related: launchPosts.filter((item) => item.slug !== slug) };
  // Canonical redirect: fetched slug differs (old slug 301s at the API).
  if (!isPreview && post.slug !== slug) {
    return {
      status: 301,
      headers: { location: `/blog/${post.slug}`, "cache-control": "public, max-age=60" },
      body: "",
      cacheHit: false,
    };
  }
  const url = isPreview ? `${siteOrigin}${path}` : `${siteOrigin}/blog/${post.slug}`;
  const canonical = post.canonicalUrl ?? url;
  const robots = isPreview ? "noindex,nofollow" : post.noindex ? "noindex" : null;
  const ogImage = ogUrl(post, siteOrigin);
  const headExtra = headTags({
    title: `${post.seoTitle ?? post.title} — ShotNode Blog`,
    description: post.seoDescription ?? post.excerpt,
    canonical,
    robots,
    og: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      url,
      image: ogImage,
      publishedTime: post.firstPublishedAt,
      modifiedTime: post.updatedAt,
      section: post.category?.name,
      tags: (post.tags ?? []).map((t) => t.name),
    },
    jsonLd: [jsonLdBlogPosting({ ...post, ogImage }, url), jsonLdBreadcrumb([{ name: "Blog", url: `${siteOrigin}/blog` }, { name: post.title, url }])],
  });
  const banner = isPreview ? `<p class="blog-preview-banner">Preview — not published. Views are not counted.</p>` : "";
  const { html, headers } = buildPage({
    ...parts,
    title: `${post.seoTitle ?? post.title} — ShotNode Blog`,
    headExtra,
    rootHtml: `<div class="blog-page container">${banner}${articleMarkup(post, siteOrigin)}</div>`,
    islandPath: path,
    islandKind: isPreview ? "preview" : "post",
    islandData: data,
    extraHeaders: isPreview ? { "cache-control": "no-store", "x-robots-tag": "noindex" } : { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
  });
  return { status: 200, headers, body: html };
}

function mergeLaunchPosts(cmsData, filter = {}) {
  const cmsItems = cmsData?.items ?? [];
  const existing = new Set(cmsItems.map((post) => post.slug));
  return {
    items: [...cmsItems, ...launchSummaries(filter).filter((post) => !existing.has(post.slug))],
    nextCursor: cmsData?.nextCursor ?? null,
  };
}

async function routeFeed({ path, backendOrigin, siteOrigin, fetchImpl }) {
  if (path === "/sitemap.xml") {
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `<sitemap><loc>${siteOrigin}/sitemap-pages.xml</loc></sitemap>\n` +
      `<sitemap><loc>${siteOrigin}/sitemap-blog.xml</loc></sitemap>\n</sitemapindex>\n`;
    return { status: 200, headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" }, body, cacheHit: false };
  }
  if (path === "/sitemap-pages.xml") {
    const urls = ["/", "/about", "/privacy", "/terms", "/blog"].map((p) => `  <url><loc>${siteOrigin}${p === "/" ? "" : p}</loc></url>`).join("\n");
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
    return { status: 200, headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" }, body, cacheHit: false };
  }
  const backendPath = path === "/sitemap-blog.xml" ? "/api/v1/blog/sitemap.xml" : path === "/blog/rss.xml" ? "/api/v1/blog/feed.xml" : null;
  if (!backendPath) return { status: 404, headers: {}, body: "not found", cacheHit: false };
  const r = await fetchRaw(backendOrigin, backendPath, fetchImpl);
  const rebased = r.status === 200 ? rebaseXml(r.body, siteOrigin) : "";
  const body = path === "/sitemap-blog.xml" ? sitemapWithLaunch(rebased, siteOrigin) : rssWithLaunch(rebased, siteOrigin);
  const ctype = path.endsWith("rss.xml") ? "application/rss+xml" : "application/xml";
  return { status: 200, headers: { "content-type": ctype, "cache-control": "public, max-age=3600" }, body, cacheHit: false };
}

function xmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function sitemapWithLaunch(xml, siteOrigin) {
  const entries = launchPosts.filter((post) => !xml.includes(`${siteOrigin}/blog/${post.slug}`)).map((post) =>
    `<url><loc>${xmlEscape(`${siteOrigin}/blog/${post.slug}`)}</loc><lastmod>${post.updatedAt.slice(0, 10)}</lastmod></url>`,
  ).join("\n");
  if (xml.includes("</urlset>")) return xml.replace("</urlset>", `${entries}\n</urlset>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function rssWithLaunch(xml, siteOrigin) {
  const entries = launchPosts.filter((post) => !xml.includes(`${siteOrigin}/blog/${post.slug}`)).map((post) =>
    `<item><title>${xmlEscape(post.title)}</title><link>${xmlEscape(`${siteOrigin}/blog/${post.slug}`)}</link><guid>${xmlEscape(`${siteOrigin}/blog/${post.slug}`)}</guid><description>${xmlEscape(post.excerpt)}</description><pubDate>${new Date(post.firstPublishedAt).toUTCString()}</pubDate></item>`,
  ).join("\n");
  if (xml.includes("</channel>")) return xml.replace("</channel>", `${entries}\n</channel>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>ShotNode Blog</title><link>${xmlEscape(`${siteOrigin}/blog`)}</link><description>Guides and stories from ShotNode.</description>${entries}</channel></rss>`;
}

async function fetchRaw(backendOrigin, path, fetchImpl = fetch) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error("backend timeout")), FETCH_TIMEOUT_MS);
  try {
    const res = await fetchImpl(backendOrigin + path, { signal: ctrl.signal });
    return { status: res.status, body: await res.text() };
  } catch {
    return { status: 0, body: "" };
  } finally {
    clearTimeout(timer);
  }
}

/** Rewrite production-absolute URLs to this site's origin (staging backend emits prod URLs). */
export function rebaseXml(xml, siteOrigin) {
  if (siteOrigin === "https://shotnode.pro") return xml;
  return xml.split("https://shotnode.pro").join(siteOrigin);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const config = loadConfig();
  const { server } = startServer(config);
  const reload = () => {
    try {
      splitTemplate(fs.readFileSync(`${config.distDir}/index.html`, "utf8"));
      log({ event: "template_reloaded" });
    } catch (err) {
      log({ event: "template_reload_failed", error: String(err?.message ?? err) });
    }
  };
  process.on("SIGHUP", reload);
  server.on("listening", () => log({ event: "listening", port: config.port }));
}
