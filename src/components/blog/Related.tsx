import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import DownloadLink from "../DownloadLink";
import type { BlogPostSummary } from "../../lib/blogApi";
import { PostCard } from "./PostCard";

/** Related-posts rail at the bottom of a post. */
export function RelatedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="blog-related" aria-label="Related posts">
      <h2>Keep reading</h2>
      <div className="blog-grid">
        {posts.slice(0, 3).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}

/** Call to action pointing at the Play Store via the shared DownloadLink. */
export function BlogCta() {
  return (
    <section className="blog-cta">
      <div>
        <h2>
          Made something worth <em>sharing?</em>
        </h2>
        <p>Turn the clips on your phone into a story worth sharing with ShotNode.</p>
      </div>
      <DownloadLink className="button button-orange">Get the Android app</DownloadLink>
    </section>
  );
}

/** Keep crawler and share metadata in sync after client-side navigation. */
export function useBlogMeta(title: string, description?: string | null, options?: {
  canonicalUrl?: string | null;
  image?: string | null;
  type?: "article" | "website";
  noindex?: boolean;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = !title || title === "Blog" ? "ShotNode Blog" : `${title} — ShotNode Blog`;
    const desc = (description ?? "").slice(0, 160);
    const setMeta = (attribute: "name" | "property", key: string, value: string | null) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!value) { tag?.remove(); return; }
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };
    const currentCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const siteOrigin = currentCanonical?.href ? new URL(currentCanonical.href).origin : window.location.origin;
    const canonical = options?.canonicalUrl ?? `${siteOrigin}${pathname}`;
    let canonicalTag = currentCanonical;
    if (!canonicalTag && !options?.noindex) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    if (options?.noindex) canonicalTag?.remove();
    else if (canonicalTag) canonicalTag.href = canonical;
    const image = options?.image ? new URL(options.image, siteOrigin).href : null;
    setMeta("name", "description", desc);
    setMeta("name", "robots", options?.noindex ? "noindex,nofollow" : null);
    setMeta("property", "og:type", options?.type ?? "website");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", options?.noindex ? null : canonical);
    setMeta("property", "og:image", image);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  }, [title, description, pathname, options?.canonicalUrl, options?.image, options?.type, options?.noindex]);
}

/** Breadcrumb for post pages. */
export function BlogBreadcrumb({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav className="blog-breadcrumb" aria-label="Breadcrumb">
      <Link to="/blog">Blog</Link>
      {trail.map((t) => (
        <span key={t.label}>
          <span aria-hidden="true"> / </span>
          {t.to ? <Link to={t.to}>{t.label}</Link> : <span aria-current="page">{t.label}</span>}
        </span>
      ))}
    </nav>
  );
}
