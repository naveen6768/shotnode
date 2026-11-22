/**
 * SEO render service: injects crawler-complete blog and public project listing
 * metadata/HTML into the built SPA shell.
 *
 * Routes: /blog, /blog/category/:slug, /blog/tag/:slug, /blog/author/:slug,
 *   /blog/:slug, /blog/preview/:token, /l/:publicId, /l/:publicId/poster,
 *   /blog/rss.xml, /sitemap.xml (+ index parts), /healthz.
 *
 * Project share links (/l/:publicId) never play media in the browser. Crawlers
 * get OG/Twitter metadata with an image-only poster; humans are sent to the
 * ShotNode app (Android intent) or Google Play with the listing id in the
 * install referrer. No video URL, <video>, or preview proxy is served.
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
  redirectScript,
} from "./inject.js";

function log(fields) {
  process.stdout.write(JSON.stringify({ service: "blog-render", ...fields }) + "\n");
}

function cspFor(scriptHashes) {
  return [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "connect-src 'self' https:",
    "frame-src https://www.youtube-nocookie.com",
    `script-src 'self' ${scriptHashes.map((hash) => `'sha256-${hash}'`).join(" ")}`,
    "style-src 'self' https://fonts.googleapis.com",
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
  ].join("; ");
}

/**
 * Assemble the SPA shell with per-route head/body. `extraScriptHashes` lists
 * the sha256 (base64) of any additional inline script placed in headExtra, so
 * the CSP allows exactly those bytes and nothing else.
 */
export function buildPage({ shell, parts, baseHead, title, headExtra, rootHtml, islandPath, islandKind, islandData, extraHeaders = {}, extraScriptHashes = [] }) {
  const headEnd = shell.indexOf("</head>");
  const head = baseHead.replace(TITLE_RE, `<title>${escapeHtml(title)}</title>`) + "\n" + headExtra;
  const { script, hash } = islandScript(islandPath, islandKind, islandData);
  const html =
    head +
    shell.slice(headEnd, parts.rootOpenEnd) +
    rootHtml +
    script +
    shell.slice(parts.rootCloseStart);
  return { html, hash, headers: { "content-security-policy": cspFor([hash, ...extraScriptHashes]), ...extraHeaders } };
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
        userAgent: req.headers["user-agent"] ?? "",
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

export async function route({ path, parts, backendOrigin, siteOrigin, fetchImpl, cache, userAgent = "" }) {
  if (path === "/healthz") {
    return { status: 200, headers: { "content-type": "text/plain" }, body: "ok", cacheHit: false };
  }
  const listingPosterMatch = path.match(/^\/l\/([^/]+)\/poster$/);
  if (listingPosterMatch) {
    const publicId = decode(listingPosterMatch[1]);
    if (!LISTING_ID_RE.test(publicId)) return plainShell(parts, 404, true);
    return routeListingPoster({ publicId, backendOrigin, siteOrigin, fetchImpl });
  }
  const listingMatch = path.match(/^\/l\/([^/]+)$/);
  if (listingMatch) {
    const publicId = decode(listingMatch[1]);
    if (!LISTING_ID_RE.test(publicId)) return plainShell(parts, 404, true);
    const t0 = Date.now();
    try {
      const out = await renderListingRoute({
        publicId,
        path,
        parts,
        backendOrigin,
        siteOrigin,
        fetchImpl,
        userAgent,
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

/**
 * Image-only poster for og:image. Signed poster URLs are resolved per request
 * and never written into HTML. This route never serves video.
 */
async function routeListingPoster({ publicId, backendOrigin, siteOrigin, fetchImpl }) {
  const response = await fetchPublicProjectListing(publicId, backendOrigin, fetchImpl);
  if (response.status !== 200 || !response.data) {
    const status = response.status === 404 ? 404 : 503;
    return {
      status,
      headers: { "cache-control": "no-store", ...(status === 503 ? { "retry-after": "30" } : {}) },
      body: "project poster unavailable",
    };
  }
  const posterUrl = resolveMediaUrl(response.data.posterUrl, siteOrigin);
  if (!posterUrl) {
    return { status: 404, headers: { "cache-control": "no-store" }, body: "project poster unavailable" };
  }
  return {
    status: 302,
    headers: { location: posterUrl, "cache-control": "no-store", "referrer-policy": "no-referrer" },
    body: "",
  };
}

/** Listing ids are the only path input that reaches the backend or the Play referrer. */
export const LISTING_ID_RE = /^[A-Za-z0-9_-]{4,64}$/;

const PLAY_PACKAGE = "com.shotnode.app";

/**
 * Link-preview crawlers that must read OG tags and must NOT be redirected
 * (a redirect would hand them the Play Store page instead of metadata).
 */
export const LINK_PREVIEW_BOT_RE =
  /facebookexternalhit|facebot|whatsapp|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|googlebot|bingbot|applebot|linkpresentation|imessage|pinterest|embedly|skypeuripreview|redditbot/i;

/** Play Store URL for a listing. The referrer carries the listing id for install attribution. */
export function playStoreUrl(publicId) {
  const referrer = `shotnode_listing=${publicId}&utm_source=share&utm_medium=listing_link&utm_campaign=project_link`;
  return `https://play.google.com/store/apps/details?id=${PLAY_PACKAGE}&referrer=${encodeURIComponent(referrer)}`;
}

/** Android browsers use an intent that opens the app, falling back to Play; others go straight to Play. */
export function listingRedirectTarget(publicId, userAgent = "") {
  const play = playStoreUrl(publicId);
  if (/Android/i.test(userAgent)) {
    return `intent://l/${encodeURIComponent(publicId)}#Intent;scheme=shotnode;package=${PLAY_PACKAGE};S.browser_fallback_url=${encodeURIComponent(play)};end`;
  }
  return play;
}

export function isLinkPreviewBot(userAgent = "") {
  return LINK_PREVIEW_BOT_RE.test(userAgent);
}

/**
 * Humans never see the project in the browser: they are sent to the app (Android intent) or the Play
 * listing right away, whether or not the listing exists, is private, or the backend is reachable.
 * Only link-preview crawlers continue to the metadata page below.
 */
function renderListingRedirect({ publicId, path, parts, userAgent }) {
  const target = listingRedirectTarget(publicId, userAgent);
  const playUrl = playStoreUrl(publicId);
  const redirect = redirectScript(target);
  const headExtra = `<meta http-equiv="refresh" content="0;url=${escapeHtml(target)}" />\n${redirect.script}\n` +
    '<meta name="robots" content="noindex,nofollow" />\n';
  const rootHtml = `<main class="listing-share-page"><section class="listing-share-card"><h1>Opening this project in ShotNode\u2026</h1><p class="listing-share-description">If nothing happens, use the button below.</p><div class="listing-share-actions"><a class="button button-orange" href="${escapeHtml(playUrl)}">Get ShotNode on Google Play</a></div></section></main>`;
  const { html, headers } = buildPage({
    ...parts,
    title: "Opening in ShotNode",
    headExtra,
    rootHtml,
    islandPath: path,
    islandKind: "project-listing",
    islandData: { publicId },
    extraHeaders: { "cache-control": "no-store" },
    extraScriptHashes: [redirect.hash],
  });
  return { status: 200, headers, body: html, cacheHit: false };
}

async function renderListingRoute({ publicId, path, parts, backendOrigin, siteOrigin, fetchImpl, userAgent = "" }) {
  if (!isLinkPreviewBot(userAgent)) return renderListingRedirect({ publicId, path, parts, userAgent });
  const response = await fetchPublicProjectListing(publicId, backendOrigin, fetchImpl);
  if (response.status !== 200 || !response.data) {
    if (response.status === 404) return plainShell(parts, 404, true);
    return { status: 503, headers: { "retry-after": "30", "cache-control": "no-store" }, body: "project listing temporarily unavailable" };
  }
  const listing = response.data;
  const title = `${listing.title || "Project preview"} · ShotNode`;
  const description = String(listing.shortDescription || listing.description ||
    "Open this editable ShotNode project in the ShotNode app to preview and remix it.").slice(0, 160);
  const canonical = `${siteOrigin}/l/${encodeURIComponent(publicId)}`;
  const posterProxy = listing.posterUrl ? `${canonical}/poster` : null;
  const duration = durationLabel(listing.artifactSummary?.durationMs);
  const creator = listing.creator?.displayName || "ShotNode creator";
  const ratio = String(listing.artifactSummary?.aspectRatio || "16:9");
  const safeRatio = /^(?:\d+(?:\.\d+)?\s*[:/x]\s*\d+(?:\.\d+)?|\d+(?:\.\d+)?)$/i.test(ratio) ? ratio : "16:9";
  const aspect = safeRatio.includes(":") || safeRatio.includes("/") || safeRatio.toLowerCase().includes("x")
    ? safeRatio.replace(/x/i, " / ").replace(/[:/]/g, " / ")
    : safeRatio;
  const media = posterProxy
    ? `<img class="listing-share-poster-image" src="${escapeHtml(posterProxy)}" alt="Poster for ${escapeHtml(listing.title)}" />`
    : `<div class="listing-share-poster-placeholder" role="img" aria-label="No preview image available">Project preview</div>`;
  const playUrl = playStoreUrl(publicId);
  const target = listingRedirectTarget(publicId, userAgent);
  const rootHtml = `<main class="listing-share-page"><section class="listing-share-card"><div class="listing-share-heading"><span class="eyebrow"><span></span> A PROJECT TO PREVIEW</span><h1>${escapeHtml(listing.title || "Project preview")}</h1><p class="listing-share-byline">Made by <strong>${escapeHtml(creator)}</strong>${duration ? ` · ${escapeHtml(duration)}` : ""}</p></div><div class="listing-share-player-wrap" style="aspect-ratio:${escapeHtml(aspect)}">${media}</div><p class="listing-share-description">${escapeHtml(description)}</p><div class="listing-share-actions"><a class="button button-orange" href="${escapeHtml(target)}">Open in ShotNode</a><a class="button button-outline" href="${escapeHtml(playUrl)}">Get ShotNode on Google Play</a></div><span class="listing-share-note">Open the project in the ShotNode app to preview and remix it.</span></section></main>`;

  // Crawlers only: metadata with no redirect (humans are handled by renderListingRedirect).
  const headExtra = headTags({
    title,
    description,
    canonical,
    robots: null,
    og: { type: "website", title, description, url: canonical, image: posterProxy || undefined },
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
