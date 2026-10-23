/**
 * Typed client for the public blog API (`GET /api/v1/blog/*`, doc 46 S5).
 * No auth. All GETs honor `AbortSignal`; `sendView` uses `navigator.sendBeacon`
 * with a `fetch keepalive` fallback. The API contract lives in
 * `shotnode_backend/docs/backend/46_blog_cms_database_and_api_contracts.md`.
 */
import { absoluteUrl, apiUrl } from "./apiBase";

export { absoluteUrl };

export interface BlogImageRef {
  mediaId: string;
  alt: string;
  width: number;
  height: number;
  src: string;
  srcset: string;
  ogSrc: string;
}

export interface BlogCategoryRef {
  slug: string;
  name: string;
}

export interface BlogTagRef {
  slug: string;
  name: string;
}

export interface BlogAuthorRef {
  slug: string;
  displayName: string;
  kind: string;
  avatarUrl: string | null;
  bio?: string;
  links?: Record<string, string>;
}

export interface BlogAgentRef {
  id: string;
  name: string;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  status: string;
  origin: string;
  title: string;
  excerpt: string;
  category: BlogCategoryRef | null;
  tags: BlogTagRef[];
  author: BlogAuthorRef | null;
  agent: BlogAgentRef | null;
  coverImage: BlogImageRef | null;
  readingTimeMinutes: number;
  isFeatured: boolean;
  firstPublishedAt: string | null;
  updatedAt: string | null;
}

export interface BlogTocEntry {
  level: number;
  text: string;
  anchor: string;
}

export interface BlogPost extends BlogPostSummary {
  dek: string;
  bodyHtml: string;
  toc: BlogTocEntry[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  ogImage: BlogImageRef | null;
  aiDisclosure: string | null;
  reviewedAt: string | null;
}

export interface BlogCategory extends BlogCategoryRef {
  description: string;
  postCount: number;
}

export interface BlogTag extends BlogTagRef {
  postCount?: number;
}

export interface BlogAuthorProfile extends BlogAuthorRef {
  bio: string;
  links: Record<string, string>;
}

export class BlogApiError extends Error {
  code: string;
  status: number;
  retryable = false;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function getJson<T>(path: string, opts?: { signal?: AbortSignal }): Promise<T> {
  const res = await fetch(apiUrl(path), { signal: opts?.signal });
  if (res.status === 404) {
    let code = "BLOG_POST_NOT_FOUND";
    try {
      code = ((await res.json()) as { error?: { code?: string } }).error?.code ?? code;
    } catch {
      /* non-JSON 404 */
    }
    throw new BlogApiError(404, code, "Not found");
  }
  if (!res.ok) {
    let code = `HTTP_${res.status}`;
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      /* non-JSON error */
    }
    throw new BlogApiError(res.status, code, message);
  }
  return (await res.json()) as T;
}

export interface BlogListParams {
  cursor?: string;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  signal?: AbortSignal;
}

export interface BlogListResponse {
  items: BlogPostSummary[];
  nextCursor: string | null;
}

function listParams(p: BlogListParams): string {
  const q = new URLSearchParams();
  if (p.cursor) q.set("cursor", p.cursor);
  if (p.limit) q.set("limit", String(p.limit));
  if (p.category) q.set("category", p.category);
  if (p.tag) q.set("tag", p.tag);
  if (p.author) q.set("author", p.author);
  if (p.featured !== undefined) q.set("featured", p.featured ? "true" : "false");
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function listPosts(p: BlogListParams = {}): Promise<BlogListResponse> {
  const { signal, ...rest } = p;
  return getJson<BlogListResponse>(`/api/v1/blog/posts${listParams(rest)}`, { signal });
}

export function searchPosts(q: string, opts?: { cursor?: string; signal?: AbortSignal }): Promise<BlogListResponse> {
  const params = new URLSearchParams({ q });
  if (opts?.cursor) params.set("cursor", opts.cursor);
  return getJson<BlogListResponse>(`/api/v1/blog/search?${params.toString()}`, { signal: opts?.signal });
}

export interface BlogPostResponse {
  post: BlogPost;
  related: BlogPostSummary[];
}

export function getPost(slug: string, signal?: AbortSignal): Promise<BlogPostResponse> {
  return getJson<BlogPostResponse>(`/api/v1/blog/posts/${encodeURIComponent(slug)}`, { signal });
}

export function listCategories(signal?: AbortSignal): Promise<BlogCategory[]> {
  return getJson<BlogCategory[]>(`/api/v1/blog/categories`, { signal });
}

export function listTags(signal?: AbortSignal): Promise<BlogTag[]> {
  return getJson<BlogTag[]>(`/api/v1/blog/tags?limit=200`, { signal });
}

export interface BlogAuthorResponse {
  author: BlogAuthorProfile;
  posts: BlogPostSummary[];
}

export function getAuthor(slug: string, signal?: AbortSignal): Promise<BlogAuthorResponse> {
  return getJson<BlogAuthorResponse>(`/api/v1/blog/authors/${encodeURIComponent(slug)}`, { signal });
}

export function getPreview(token: string, signal?: AbortSignal): Promise<BlogPostResponse> {
  return getJson<BlogPostResponse>(`/api/v1/blog/preview/${encodeURIComponent(token)}`, { signal });
}

/** View beacon: sendBeacon first, fetch-keepalive fallback. Never throws. */
export function sendView(slug: string, referrer?: string): void {
  const url = apiUrl(`/api/v1/blog/posts/${encodeURIComponent(slug)}/view`);
  const body = JSON.stringify(referrer ? { referrer } : {});
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fall through to fetch */
  }
  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* view beacons must never break the page */
  }
}

/** Absolute cover URL for <img> (backend serves relative media paths). */
export function coverSrc(cover: BlogImageRef | null): string | null {
  return absoluteUrl(cover?.src ?? null);
}

export function coverSrcSet(cover: BlogImageRef | null): string | undefined {
  if (!cover?.srcset) return undefined;
  return cover.srcset
    .split(",")
    .map((part) => {
      const [url, width] = part.trim().split(/\s+/, 2);
      const abs = absoluteUrl(url);
      return width ? `${abs} ${width}` : (abs ?? url);
    })
    .join(", ");
}

// ---------------------------------------------------------------------------
// Server-injected first data (Phase 8 injects `window.__SHOTNODE_BLOG__`;
// the SPA works with and without it).
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __SHOTNODE_BLOG__?: { path: string; data: unknown } | null;
  }
}

/**
 * Consume one-time server-injected data when its path matches the current
 * location. Returns the data (or null) and always deletes the global so a
 * second mount cannot reuse stale payloads.
 */
export function getInitialBlogData<T>(path: string): T | null {
  try {
    const injected = window.__SHOTNODE_BLOG__;
    if (!injected || injected.path !== path) return null;
    return injected.data as T;
  } finally {
    try {
      delete (window as { __SHOTNODE_BLOG__?: unknown }).__SHOTNODE_BLOG__;
    } catch {
      window.__SHOTNODE_BLOG__ = null;
    }
  }
}
