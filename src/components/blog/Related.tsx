import { Link } from "react-router-dom";
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
        <p>Shoot, edit, and publish your next story right from your phone with ShotNode.</p>
      </div>
      <DownloadLink className="button button-orange">Get the Android app</DownloadLink>
    </section>
  );
}

/** Small helper: keep <title> and meta description in sync on navigation. */
export function useBlogMeta(title: string, description?: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — ShotNode Blog` : "ShotNode Blog";
    const desc = (description ?? "").slice(0, 160);
    if (!desc) return;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", desc);
  }, [title, description]);
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
