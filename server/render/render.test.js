/**
 * Render-service unit + route tests (node:test, no network — stub fetch).
 * Run: npm run render:test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";

import { loadConfig } from "./config.js";
import { createCache } from "./cache.js";
import { encodeIsland, escapeHtml, splitTemplate, stripStaticSeo } from "./html.js";
import {
  articleMarkup,
  cardMarkup,
  headTags,
  indexMarkup,
  islandScript,
  jsonLdBlogIndex,
  jsonLdBlogPosting,
  jsonLdBreadcrumb,
  ogUrl,
} from "./inject.js";
import { buildPage, rebaseXml, route } from "./server.js";

const SHELL = `<!doctype html><html><head>
<meta charset="UTF-8" />
<title>ShotNode — AI Video Editor for Android</title>
<meta
  name="description"
  content="The app."
/>
<meta property="og:type" content="website" />
<meta property="og:title" content="ShotNode" />
<meta property="og:description" content="Desc." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="ShotNode" />
<meta name="twitter:description" content="Desc." />
<meta property="og:site_name" content="ShotNode AI" />
</head><body><div id="root"></div><script src="/a.js"></script></body></html>`;

function parts() {
  const headEnd = SHELL.indexOf("</head>");
  const rootOpenEnd = SHELL.indexOf('<div id="root">') + '<div id="root">'.length;
  const rootCloseStart = SHELL.indexOf("</div>", rootOpenEnd);
  return { shell: SHELL, parts: { rootOpenEnd, rootCloseStart }, baseHead: stripStaticSeo(SHELL.slice(0, headEnd)) };
}

test("config rejects bad env", () => {
  assert.throws(() => loadConfig({ RENDER_PORT: "abc" }), /RENDER_PORT/);
  assert.throws(() => loadConfig({ BACKEND_ORIGIN: "ftp://x" }), /BACKEND_ORIGIN/);
  const c = loadConfig({});
  assert.equal(c.port, 3021);
  assert.equal(c.backendOrigin, "http://127.0.0.1:8091");
});

test("template markers fail fast", () => {
  assert.throws(() => splitTemplate("<html></html>"), /<\/head>/);
  assert.throws(() => splitTemplate("<head></head>"), /<title>/);
  assert.throws(() => splitTemplate("<head><title>t</title></head><body></body>"), /id="root"/);
  const p = splitTemplate(SHELL);
  assert.ok(p.rootOpenEnd > 0 && p.rootCloseStart >= p.rootOpenEnd);
});

test("escapeHtml + island encoding neutralize XSS", () => {
  assert.equal(escapeHtml('<script>"&'), "&lt;script&gt;&quot;&amp;");
  const evil = { title: '</script><script>alert(1)</script>', amp: "a&b", u2028: "\u2028" };
  const enc = encodeIsland(evil);
  assert.ok(!enc.includes("<") && !enc.includes(">") && !enc.includes("&"));
  assert.ok(enc.includes("\\u2028") || !enc.includes(" "));
  assert.deepEqual(JSON.parse(enc.replace(/\\u0026/g, "&").replace(/\\u003c/g, "<").replace(/\\u003e/g, ">")), {
    title: "</script><script>alert(1)</script>",
    amp: "a&b",
    u2028: " ",
  });
});

test("stripStaticSeo removes shell tags for replacement", () => {
  const head = stripStaticSeo(SHELL.slice(0, SHELL.indexOf("</head>")));
  assert.ok(!head.includes('name="description"'));
  assert.ok(!head.includes("og:title"));
  assert.ok(!head.includes("twitter:card"));
  assert.ok(!head.includes("og:site_name"));
});

test("cache honors TTL + LRU cap", () => {
  let now = 0;
  const c = createCache({ max: 2, ttlMs: 100, now: () => now });
  c.set("a", 1);
  c.set("b", 2);
  assert.equal(c.get("a"), 1);
  c.set("c", 3); // evicts b (a was refreshed)
  assert.equal(c.get("b"), null);
  assert.equal(c.get("c"), 3);
  now = 101;
  assert.equal(c.get("a"), null);
});

test("headTags escapes + embeds JSON-LD", () => {
  const out = headTags({
    title: 'A <b>title</b>',
    description: "d",
    canonical: "https://staging.shotnode.pro/blog/x",
    robots: "noindex,nofollow",
    og: { type: "article", tags: ["a"] },
    jsonLd: [{ "@type": "BlogPosting" }],
  });
  assert.ok(!out.includes("<title>")); // buildPage owns <title>
  assert.ok(out.includes('rel="canonical"'));
  assert.ok(out.includes('name="robots"'));
  assert.ok(out.includes("application/ld+json"));
  assert.ok(out.includes("article:tag"));
});

test("json-ld shapes carry required fields", () => {
  const post = {
    title: "T",
    seoDescription: null,
    excerpt: "E",
    ogImage: "https://staging.shotnode.pro/x.png",
    firstPublishedAt: "2026-10-22T00:00:00Z",
    updatedAt: null,
    author: { displayName: "Bot", kind: "agent" },
    category: { name: "Tutorials" },
    tags: [{ name: "ai" }],
  };
  const ld = jsonLdBlogPosting(post, "https://staging.shotnode.pro/blog/t");
  assert.equal(ld["@type"], "BlogPosting");
  assert.equal(ld.author["@type"], "Person");
  assert.equal(ld.publisher.name, "ShotNode");
  assert.equal(ld.mainEntityOfPage, "https://staging.shotnode.pro/blog/t");
  const bc = jsonLdBreadcrumb([{ name: "Blog", url: "https://staging.shotnode.pro/blog" }]);
  assert.equal(bc.itemListElement[0].position, 1);
  const idx = jsonLdBlogIndex([{ title: "T", url: "https://staging.shotnode.pro/blog/t" }], "https://staging.shotnode.pro/blog");
  assert.equal(idx["@type"], "Blog");
});

test("ogUrl handles ImageRef object, string, and missing", () => {
  const site = "https://staging.shotnode.pro";
  assert.equal(ogUrl({ ogImage: { ogSrc: "/api/v1/blog/media/m/og1200x630", src: "/x/w960" } }, site), `${site}/api/v1/blog/media/m/og1200x630`);
  assert.equal(ogUrl({ ogImage: { src: "/x/w960" } }, site), `${site}/x/w960`);
  assert.equal(ogUrl({ ogImage: "https://cdn.example.com/a.png" }, site), "https://cdn.example.com/a.png");
  assert.equal(ogUrl({ ogImage: null }, site), null);
  assert.equal(ogUrl({}, site), null);
});

test("island hash matches script bytes (CSP base64)", () => {
  const { script, hash } = islandScript("/blog/x", "post", { a: 1 });
  const inner = script.replace(/^<script>/, "").replace(/<\/script>$/, "");
  assert.equal(hash, createHash("sha256").update(inner, "utf8").digest("base64"));
  assert.ok(inner.includes("\\u003c") === false); // no raw < in this payload
  const { script: evil } = islandScript("/blog", "post", { t: "</script>" });
  assert.ok(!evil.slice(8, -9).includes("</script>"));
});

test("article/card markup escapes, embeds sanitized html once", () => {
  const post = {
    slug: "x",
    title: 'Hi <em>there</em>',
    dek: null,
    bodyHtml: "<h2>Real</h2><p>Body</p>",
    category: { slug: "tutorials", name: "Tutorials" },
    tags: [{ slug: "ai", name: "ai" }],
    author: { slug: "a", displayName: "Ann", kind: "organization" },
    coverImage: { src: "/api/v1/blog/media/m/w960", width: 1600, height: 900, alt: "Alt" },
    aiDisclosure: "AI-assisted",
    readingTimeMinutes: 3,
    firstPublishedAt: null,
    updatedAt: null,
  };
  const html = articleMarkup(post, "https://staging.shotnode.pro");
  assert.ok(html.includes("&lt;em&gt;")); // title escaped, no injected <em>
  assert.ok(html.includes("<h2>Real</h2>")); // backend html passes through once
  assert.ok(html.includes("AI-assisted"));
  const card = cardMarkup({ ...post, excerpt: "E <b>" }, "https://staging.shotnode.pro");
  assert.ok(card.includes("&lt;b&gt;"));
});

test("index markup renders hero + grid", () => {
  const items = [
    { id: "1", slug: "a", title: "A", excerpt: "EA", category: { slug: "t", name: "T" }, coverImage: null },
    { id: "2", slug: "b", title: "B", excerpt: "", category: null, coverImage: null },
  ];
  const html = indexMarkup(items, "https://staging.shotnode.pro");
  assert.ok(html.includes("/blog/a"));
  assert.ok(html.includes("blog-grid"));
});

test("route: index renders 200 with cache", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return { status: 200, json: async () => ({ items: [{ id: "1", slug: "a", title: "A", excerpt: "E", category: null, tags: [], author: null, agent: null, coverImage: null, readingTimeMinutes: 1, isFeatured: false, firstPublishedAt: null, updatedAt: null }], nextCursor: null }) };
  };
  const c = createCache();
  const p = parts();
  const r1 = await route({ path: "/blog", parts: p, backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: c });
  assert.equal(r1.status, 200);
  assert.ok(r1.body.includes("Stories for the"));
  assert.ok(r1.body.includes("__SHOTNODE_BLOG__"));
  assert.equal(calls.length, 1);
  const r2 = await route({ path: "/blog", parts: p, backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: c });
  assert.equal(r2.cacheHit, true);
  assert.equal(calls.length, 1);
});

test("route: unknown slug 404s with noindex shell", async () => {
  const fetchImpl = async () => ({ status: 404, json: async () => ({ error: { code: "BLOG_POST_NOT_FOUND" } }) });
  const cc = createCache;
  const rt = route;
  const r = await rt({ path: "/blog/nope", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: cc() });
  assert.equal(r.status, 404);
  assert.ok(r.body.includes("noindex"));
});

test("route: slug change 301s to canonical", async () => {
  const fetchImpl = async () => ({
    status: 200,
    json: async () => ({
      post: { id: "1", slug: "new-slug", title: "T", excerpt: "", dek: "", bodyHtml: "<p>x</p>", toc: [], category: null, tags: [], author: null, agent: null, coverImage: null, readingTimeMinutes: 1, isFeatured: false, firstPublishedAt: null, updatedAt: null, seoTitle: null, seoDescription: null, canonicalUrl: null, noindex: false, ogImage: null, aiDisclosure: null, reviewedAt: null },
      related: [],
    }),
  });
  const cc = createCache;
  const rt = route;
  const r = await rt({ path: "/blog/old-slug", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: cc() });
  assert.equal(r.status, 301);
  assert.equal(r.headers.location, "/blog/new-slug");
});

test("route: backend outage 503s posts, shells index", async () => {
  const fetchImpl = async () => {
    throw new Error("down");
  };
  const cc = createCache;
  const rt = route;
  const post = await rt({ path: "/blog/x", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: cc() });
  assert.equal(post.status, 503);
  assert.equal(post.headers["retry-after"], "30");
  const index = await rt({ path: "/blog", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: cc() });
  assert.equal(index.status, 200);
});

test("route: healthz + feeds rebase staging origin", async () => {
  const cc = createCache;
  const rt = route;
  const h = await rt({ path: "/healthz", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl: async () => { throw new Error("unused"); }, cache: cc() });
  assert.equal(h.status, 200);
  const fetchImpl = async () => ({ status: 200, text: async () => `<urlset><url><loc>https://shotnode.pro/blog/a</loc></url></urlset>` });
  const f = await rt({ path: "/sitemap-blog.xml", parts: parts(), backendOrigin: "http://b", siteOrigin: "https://staging.shotnode.pro", fetchImpl, cache: cc() });
  assert.equal(f.status, 200);
  assert.ok(f.body.includes("https://staging.shotnode.pro/blog/a"));
  assert.ok(!f.body.includes("https://shotnode.pro/blog/a"));
  assert.equal(rebaseXml("<x>https://shotnode.pro/y</x>", "https://shotnode.pro"), "<x>https://shotnode.pro/y</x>");
});

test("buildPage assembles shell + CSP", async () => {
  const bp = buildPage;
  const p = parts();
  const { html, hash, headers } = bp({ ...p, title: "T", headExtra: "<meta X />\n", rootHtml: "<p>hi</p>", islandPath: "/blog", islandKind: "index", islandData: { a: 1 } });
  assert.ok(html.includes("<title>T</title>"));
  assert.ok(html.includes("<p>hi</p>"));
  assert.ok(html.includes("__SHOTNODE_BLOG__"));
  assert.ok((headers["content-security-policy"] ?? "").includes(`'sha256-${hash}'`));
});
