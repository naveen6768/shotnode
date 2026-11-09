/**
 * SEO render service: injects crawler-complete blog and public project listing
 * metadata/HTML into the built SPA shell.
 *
 * Routes: /blog, /blog/category/:slug, /blog/tag/:slug, /blog/author/:slug,
 *   /blog/:slug, /blog/preview/:token, /l/:publicId, /l/:publicId/{poster,preview},
 *   /blog/rss.xml, /sitemap.xml (+ index parts), /healthz.
 */
import http from "node:http";
import fs from "node:fs";
import { loadConfig } from "./config.js";
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
    "media-src 'self' https:",
    "connect-src 'self' https:",
    "frame-src https://www.youtube-nocookie.com",
    `script-src 'self' 'sha256-${islandHash}'`,
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
  ].join("; ");
}

export function buildPage({ shell, parts, baseHead, title, headExtra, rootHtml, islandPath, islandKind, islandData, extraHeaders = {} }) {
  const headEnd = shell.indexOf("</head>");
  const head = baseHead.replace(TITLE_RE, `<title>${escapeHtml(title)}</title>`) + "\n" + headExtra;
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
      const out = await route({
        path,
        parts: { shell, parts, baseHead },
        backendOrigin,
        siteOrigin,
        fetchImpl,
        cache,
        projectPreviewPlaybackEnabled: process.env.SHOTNODE_PROJECT_PREVIEW_PLAYBACK_ENABLED !== "false",
      });
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

export async function route({ path, parts, backendOrigin, siteOrigin, fetchImpl, cache, projectPreviewPlaybackEnabled = true }) {
  if (path === "/__project-preview-config") {
    return {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
      body: JSON.stringify({ enabled: Boolean(projectPreviewPlaybackEnabled) }),
      cacheHit: false,
    };
  }
  if (path === "/healthz") {
    return { status: 200, headers: { "content-type": "text/plain" }, body: "ok", cacheHit: false };
  }
  const listingMediaMatch = path.match(/^\/l\/([^/]+)\/(poster|preview)$/);
  if (listingMediaMatch) {
    return routeListingMedia({
      publicId: decode(listingMediaMatch[1]),
      mediaKind: listingMediaMatch[2],
      backendOrigin,
      siteOrigin,
      fetchImpl,
      projectPreviewPlaybackEnabled,
    });
  }
  const listingMatch = path.match(/^\/l\/([^/]+)$/);
  if (listingMatch) {
    const publicId = decode(listingMatch[1]);
    const t0 = Date.now();
    try {
      const out = await renderListingRoute({
        publicId,
        path,
        parts,
        backendOrigin,
        siteOrigin,
        fetchImpl,
        projectPreviewPlaybackEnabled,
      });
      out.backendMs = Date.now() - t0;
      return { ...out, cacheHit: false };
    } catch {
      return {
        status: 503,
        headers: { "retry-after": "30", "cache-control": "no-store" },
        body: "project listing temporarily unavailable",
        cacheHit: false,
        backendMs: Date.now() - t0,
      };
    }
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

async function fetchPublicProjectListing(publicId, backendOrigin, fetchImpl) {
  const response = await fetchJson(
    backendOrigin,
    `/api/v1/marketplace/listings/${encodeURIComponent(publicId)}`,
    { fetchImpl },
  );
  if (response.status !== 200 || !response.data) return response;
  const listing = response.data;
  if (
    listing.listingKind !== "PROJECT" ||
    !["PUBLIC", "UNLISTED"].includes(listing.visibility)
  ) {
    return { status: 404, data: null };
  }
  return { status: 200, data: listing };
}

function resolveMediaUrl(value, siteOrigin) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const resolved = new URL(value, siteOrigin);
    return ["https:", "http:"].includes(resolved.protocol) ? resolved.href : null;
  } catch {
    return null;
  }
}

function durationLabel(durationMs) {
  const ms = Number(durationMs);
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

async function routeListingMedia({ publicId, mediaKind, backendOrigin, siteOrigin, fetchImpl, projectPreviewPlaybackEnabled }) {
  if (mediaKind === "preview" && !projectPreviewPlaybackEnabled) {
    return { status: 404, headers: { "cache-control": "no-store" }, body: "project preview unavailable" };
  }
  const response = await fetchPublicProjectListing(publicId, backendOrigin, fetchImpl);
  if (response.status !== 200 || !response.data) {
    const status = response.status === 404 ? 404 : 503;
    return {
      status,
      headers: { "cache-control": "no-store", ...(status === 503 ? { "retry-after": "30" } : {}) },
      body: `project ${mediaKind} unavailable`,
    };
  }
  const mediaUrl = resolveMediaUrl(
    mediaKind === "poster" ? response.data.posterUrl : response.data.previewUrl,
    siteOrigin,
  );
  if (!mediaUrl) {
    return { status: 404, headers: { "cache-control": "no-store" }, body: `project ${mediaKind} unavailable` };
  }
  return {
    status: 302,
    headers: { location: mediaUrl, "cache-control": "no-store", "referrer-policy": "no-referrer" },
    body: "",
  };
}

async function renderListingRoute({ publicId, path, parts, backendOrigin, siteOrigin, fetchImpl, projectPreviewPlaybackEnabled }) {
  const response = await fetchPublicProjectListing(publicId, backendOrigin, fetchImpl);
  if (response.status !== 200 || !response.data) {
    if (response.status === 404) return plainShell(parts, 404, true);
    return { status: 503, headers: { "retry-after": "30", "cache-control": "no-store" }, body: "project listing temporarily unavailable" };
  }
  const listing = response.data;
  const title = `${listing.title || "Project preview"} · ShotNode`;
  const description = String(listing.shortDescription || listing.description ||
    "Watch this short project preview, then open the editable ShotNode project to make it your own.").slice(0, 160);
  const canonical = `${siteOrigin}/l/${encodeURIComponent(publicId)}`;
  const posterProxy = listing.posterUrl ? `${canonical}/poster` : null;
  const duration = durationLabel(listing.artifactSummary?.durationMs);
  const previewProxy = projectPreviewPlaybackEnabled && listing.previewUrl ? `${canonical}/preview` : null;
  const creator = listing.creator?.displayName || "ShotNode creator";
  const ratio = String(listing.artifactSummary?.aspectRatio || "16:9");
  const safeRatio = /^(?:\d+(?:\.\d+)?\s*[:/x]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/i.test(ratio) ? ratio : "16:9";
  const aspect = safeRatio.includes(":") || safeRatio.includes("/") || safeRatio.toLowerCase().includes("x")
    ? safeRatio.replace(/x/i, " / ").replace(/[:/]/g, " / ")
    : safeRatio;
  const media = previewProxy
    ? `<video class="listing-share-player" controls playsinline muted preload="none" poster="${escapeHtml(posterProxy || "")}" aria-label="Preview of ${escapeHtml(listing.title)}"><source src="${escapeHtml(previewProxy)}" type="video/mp4" />Your browser cannot play this project preview.</video>`
    : posterProxy
      ? `<img class="listing-share-poster-image" src="${escapeHtml(posterProxy)}" alt="Poster for ${escapeHtml(listing.title)}" />`
      : `<div class="listing-share-poster-placeholder" role="img" aria-label="No preview image available">Project preview</div>`;
  const previewMessage = previewProxy ? "" : `<p role="status">A video preview is not available for this project yet.</p>`;
  const playStore = "https://play.google.com/store/apps/details?id=com.shotnode.app";
  const intent = `intent://l/${encodeURIComponent(publicId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${encodeURIComponent(playStore)};end`;
  const rootHtml = `<main class="listing-share-page"><section class="listing-share-card"><div class="listing-share-heading"><span class="eyebrow"><span></span> A PROJECT TO PREVIEW</span><h1>${escapeHtml(listing.title || "Project preview")}</h1><p class="listing-share-byline">Made by <strong>${escapeHtml(creator)}</strong>${duration ? ` · ${escapeHtml(duration)}` : ""}</p></div><div class="listing-share-player-wrap" style="aspect-ratio:${escapeHtml(aspect)}">${media}${previewMessage}</div><p class="listing-share-description">Watch this short project preview, then open the editable ShotNode project to make it your own.</p><div class="listing-share-actions"><a class="button button-orange" href="${escapeHtml(intent)}">Open in ShotNode</a><a class="button button-outline" href="${playStore}">Get ShotNode</a></div><span class="listing-share-note">Preview the edit first. Remix it when you’re ready.</span></section></main>`;
  const headExtra = `<meta name="project-preview-playback" content="${projectPreviewPlaybackEnabled ? "true" : "false"}" />\n` + headTags({
    title,
    description,
    canonical,
    robots: null,
    og: { type: previewProxy ? "video.other" : "website", title, description, url: canonical, image: posterProxy || undefined },
  });
  const { html, headers } = buildPage({
    ...parts,
    title,
    headExtra,
    rootHtml,
    islandPath: path,
    islandKind: "project-listing",
    islandData: { publicId },
    extraHeaders: { "cache-control": "no-store" },
  });
  return { status: 200, headers, body: html };
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
    if (r.status !== 200 || !r.data) return plainShell(parts, 200, false);
    const items = r.data.items ?? [];
    const posts = items.map((p) => ({ title: p.title, url: `${siteOrigin}/blog/${p.slug}` }));
    const headExtra = headTags({
      title: "Blog — ShotNode",
      description: "Stories, guides, and news from the ShotNode team.",
      canonical: `${siteOrigin}/blog`,
      robots: null,
      og: { type: "website", url: `${siteOrigin}/blog` },
      jsonLd: [jsonLdBlogIndex(posts, `${siteOrigin}/blog`)],
    });
    const { html, headers } = buildPage({
      ...parts,
      title: "Blog — ShotNode",
      headExtra,
      rootHtml: `<div class="blog-page container">${indexMarkup(items, siteOrigin)}</div>`,
      islandPath: "/blog",
      islandKind: "index",
      islandData: r.data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  if (kind === "category" || kind === "tag") {
    const q = kind === "category" ? `category=${encodeURIComponent(slug)}` : `tag=${encodeURIComponent(slug)}`;
    const r = await fetchJson(backendOrigin, `/api/v1/blog/posts?limit=12&${q}`, { fetchImpl });
    if (r.status !== 200 || !r.data) return plainShell(parts, 200, false);
    const label = `${kind === "category" ? "Category" : "Tag"}: ${slug}`;
    const headExtra = headTags({
      title: `${label} — ShotNode Blog`,
      description: `Stories filed under ${slug} on the ShotNode blog.`,
      canonical: `${siteOrigin}${path}`,
      robots: null,
      og: { type: "website", url: `${siteOrigin}${path}` },
    });
    const cards = (r.data.items ?? []).map((p) => cardMarkup(p, siteOrigin)).join("");
    const { html, headers } = buildPage({
      ...parts,
      title: `${label} — ShotNode Blog`,
      headExtra,
      rootHtml: `<div class="blog-page container"><h1 class="blog-h1">${escapeHtml(slug)}</h1><div class="blog-grid">${cards}</div></div>`,
      islandPath: path,
      islandKind: kind,
      islandData: r.data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  if (kind === "author") {
    const r = await fetchJson(backendOrigin, `/api/v1/blog/authors/${encodeURIComponent(slug)}`, { fetchImpl });
    if (r.status === 404) return plainShell(parts, 404, true);
    if (r.status !== 200 || !r.data) return plainShell(parts, 200, false);
    const author = r.data.author;
    const cards = (r.data.posts ?? []).map((p) => cardMarkup(p, siteOrigin)).join("");
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
      islandData: r.data,
      extraHeaders: { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
    });
    return { status: 200, headers, body: html };
  }

  // post + preview share the detail renderer; preview never caches/counts.
  const isPreview = kind === "preview";
  const apiPath = isPreview ? `/api/v1/blog/preview/${encodeURIComponent(token)}` : `/api/v1/blog/posts/${encodeURIComponent(slug)}`;
  const r = await fetchJson(backendOrigin, apiPath, { fetchImpl });
  if (r.status === 404) return plainShell(parts, 404, true);
  if (r.status !== 200 || !r.data?.post) throw new Error(`blog backend status ${r.status}`);
  const post = r.data.post;
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
    islandData: r.data,
    extraHeaders: isPreview ? { "cache-control": "no-store", "x-robots-tag": "noindex" } : { "cache-control": "public, max-age=60, stale-while-revalidate=600" },
  });
  return { status: 200, headers, body: html };
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
  if (r.status !== 200) return { status: r.status === 404 ? 404 : 502, headers: {}, body: "upstream error", cacheHit: false };
  const rebased = rebaseXml(r.body, siteOrigin);
  const ctype = path.endsWith("rss.xml") ? "application/rss+xml" : "application/xml";
  return { status: 200, headers: { "content-type": ctype, "cache-control": "public, max-age=3600" }, body: rebased, cacheHit: false };
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

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].slice(process.argv[1].lastIndexOf("/")))) {
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
