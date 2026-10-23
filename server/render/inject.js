/**
 * Per-route data fetch + head/article/JSON-LD assembly for the render service.
 * Mirrors the Phase 7 page structure and `.blog-*` classes so CSS applies
 * before React boots. All interpolated text is escaped; `bodyHtml` comes
 * from the backend sanitizer and is embedded as-is (same trust as the SPA).
 */
import { createHash } from "node:crypto";
import { encodeIsland, escapeHtml } from "./html.js";

export const FETCH_TIMEOUT_MS = 3000;

export async function fetchJson(backendOrigin, path, { timeoutMs = FETCH_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error("backend timeout")), timeoutMs);
  try {
    const res = await fetchImpl(backendOrigin + path, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: null, error: err };
  } finally {
    clearTimeout(timer);
  }
}

function absUrl(siteOrigin, path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return siteOrigin + (path.startsWith("/") ? path : `/${path}`);
}

function metaName(name, content) {
  if (!content) return "";
  return `<meta name="${name}" content="${escapeHtml(content)}" />\n`;
}

function metaProp(prop, content) {
  if (!content) return "";
  return `<meta property="${prop}" content="${escapeHtml(content)}" />\n`;
}

export function headTags({ title, description, canonical, robots, og = {}, twitterCard = "summary_large_image", jsonLd = null }) {
  // NOTE: <title> is owned by buildPage; this only appends head extras.
  let out = metaName("description", (description ?? "").slice(0, 160));
  if (canonical) out += `<link rel="canonical" href="${escapeHtml(canonical)}" />\n`;
  if (robots) out += metaName("robots", robots);
  out += metaProp("og:type", og.type ?? "website");
  out += metaProp("og:title", og.title ?? title);
  out += metaProp("og:description", og.description ?? description);
  if (og.url) out += metaProp("og:url", og.url);
  if (og.image) out += metaProp("og:image", og.image);
  out += metaProp("og:site_name", "ShotNode");
  if (og.publishedTime) out += metaProp("article:published_time", og.publishedTime);
  if (og.modifiedTime) out += metaProp("article:modified_time", og.modifiedTime);
  if (og.section) out += metaProp("article:section", og.section);
  for (const tag of og.tags ?? []) out += metaProp("article:tag", tag);
  out += `<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />\n`;
  out += metaName("twitter:title", og.title ?? title);
  out += metaName("twitter:description", og.description ?? description);
  if (og.image) out += metaName("twitter:image", og.image);
  if (jsonLd) out += `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`;
  return out;
}

const PUBLISHER = {
  "@type": "Organization",
  name: "ShotNode",
  url: "https://shotnode.pro",
  logo: { "@type": "ImageObject", url: "https://shotnode.pro/logo.svg" },
};

export function jsonLdBlogPosting(post, url) {
  const author =
    post.author == null
      ? undefined
      : post.author.kind === "agent"
        ? { "@type": "Person", name: post.author.displayName }
        : { "@type": "Organization", name: post.author.displayName };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: (post.seoDescription ?? post.excerpt ?? "").slice(0, 300),
    image: post.ogImage ? [post.ogImage] : undefined,
    datePublished: post.firstPublishedAt ?? undefined,
    dateModified: post.updatedAt ?? undefined,
    author,
    publisher: PUBLISHER,
    mainEntityOfPage: url,
    isAccessibleForFree: true,
  };
}

export function jsonLdBreadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function jsonLdBlogIndex(posts, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    url,
    name: "ShotNode Blog",
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: p.url,
    })),
  };
}

function bylineHtml(post, siteOrigin) {
  const author = post.author
    ? `<a href="${escapeHtml(siteOrigin)}/blog/author/${escapeHtml(post.author.slug)}">${escapeHtml(post.author.displayName)}</a>`
    : "ShotNode";
  const date = post.firstPublishedAt ? new Date(post.firstPublishedAt).toISOString().slice(0, 10) : "";
  return `<div class="blog-byline"><div><p>${author}</p><p class="blog-byline-sub">${escapeHtml(date)}${post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min read` : ""}</p></div></div>`;
}

function coverHtml(post, siteOrigin) {
  const cover = post.coverImage;
  if (!cover?.src) return "";
  const src = absUrl(siteOrigin, cover.src) ?? cover.src;
  return `<figure class="blog-cover"><img src="${escapeHtml(src)}" alt="${escapeHtml(cover.alt ?? "")}" width="${cover.width || 1600}" height="${cover.height || 900}" />${cover.alt ? `<figcaption>${escapeHtml(cover.alt)}</figcaption>` : ""}</figure>`;
}

export function articleMarkup(post, siteOrigin) {
  const tags = (post.tags ?? []).map((t) => `<a href="${escapeHtml(siteOrigin)}/blog/tag/${escapeHtml(t.slug)}">#${escapeHtml(t.name)}</a>`).join("");
  return (
    `<article class="blog-post">` +
    (post.category ? `<span class="blog-eyebrow">${escapeHtml(post.category.name)}</span>` : "") +
    `<h1 class="blog-post-title">${escapeHtml(post.title || post.slug)}</h1>` +
    (post.dek ? `<p class="blog-dek">${escapeHtml(post.dek)}</p>` : "") +
    bylineHtml(post, siteOrigin) +
    (post.aiDisclosure ? `<p class="blog-ai-disclosure">${escapeHtml(post.aiDisclosure)}</p>` : "") +
    coverHtml(post, siteOrigin) +
    `<div class="blog-article">${post.bodyHtml ?? ""}</div>` +
    (tags ? `<p class="blog-tags">${tags}</p>` : "") +
    `</article>`
  );
}

export function cardMarkup(post, siteOrigin) {
  const url = `${siteOrigin}/blog/${post.slug}`;
  const cover = post.coverImage?.src
    ? `<a class="blog-card-cover" href="${escapeHtml(url)}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(absUrl(siteOrigin, post.coverImage.src) ?? "")}" alt="" loading="lazy" /></a>`
    : "";
  return (
    `<article class="blog-card">${cover}<div class="blog-card-body">` +
    (post.category ? `<span class="blog-eyebrow">${escapeHtml(post.category.name)}</span>` : "") +
    `<h3><a href="${escapeHtml(url)}">${escapeHtml(post.title || post.slug)}</a></h3>` +
    (post.excerpt ? `<p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>` : "") +
    `</div></article>`
  );
}

export function indexMarkup(items, siteOrigin) {
  const [hero, ...rest] = items;
  let out = `<span class="blog-eyebrow">The ShotNode blog</span><h1 class="blog-h1">Stories for the <em>creative part.</em></h1>`;
  if (hero) {
    out += `<article class="blog-hero"><div class="blog-hero-body">` +
      (hero.category ? `<span class="blog-eyebrow">${escapeHtml(hero.category.name)}</span>` : "") +
      `<h2><a href="${escapeHtml(siteOrigin)}/blog/${escapeHtml(hero.slug)}">${escapeHtml(hero.title || hero.slug)}</a></h2>` +
      (hero.excerpt ? `<p>${escapeHtml(hero.excerpt)}</p>` : "") +
      `</div></article>`;
  }
  out += `<div class="blog-grid">${rest.map((p) => cardMarkup(p, siteOrigin)).join("")}</div>`;
  return out;
}

/** Absolute OG image URL from the API's ogImage (ImageRef object or legacy string). */
export function ogUrl(post, siteOrigin) {
  const ref = typeof post.ogImage === "string" ? { src: post.ogImage } : post.ogImage;
  const path = ref ? (ref.ogSrc ?? ref.src) : null;
  if (!path) return null;
  return path.startsWith("http") ? path : siteOrigin + path;
}

/** Data island script + its CSP sha256 hash (base64 over the exact inner bytes). */
export function islandScript(path, kind, data) {
  const inner = `window.__SHOTNODE_BLOG__ = ${encodeIsland({ path, kind, data })};`;
  const hash = createHash("sha256").update(inner, "utf8").digest("base64");
  return { script: `<script>${inner}</script>`, hash };
}
