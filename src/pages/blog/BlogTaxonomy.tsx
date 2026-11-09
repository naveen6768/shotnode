import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getInitialBlogData, listPosts, type BlogPostSummary } from "../../lib/blogApi";
import { PostCard } from "../../components/blog/PostCard";
import { useBlogMeta } from "../../components/blog/Related";
import { launchPosts, launchSummaries } from "../../data/launchPosts.js";

/** Category and tag archives share the filtered grid. */
export default function BlogTaxonomy({ kind }: { kind: "category" | "tag" }) {
  const { slug = "" } = useParams();
  const path = kind === "category" ? `/blog/category/${slug}` : `/blog/tag/${slug}`;
  // Read the injected payload once: the helper deletes it on first read.
  const [initial] = useState(() =>
    getInitialBlogData<{ items: BlogPostSummary[]; nextCursor: string | null }>(path) ?? {
      items: launchSummaries(kind === "category" ? { category: slug } : { tag: slug }) as BlogPostSummary[],
      nextCursor: null,
    },
  );
  const [items, setItems] = useState<BlogPostSummary[]>(initial?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const seeded = (initial?.items ?? []).length > 0;
  const firstPath = useRef(path);
  const [loading, setLoading] = useState(!seeded);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = kind === "category" ? "Category" : "Tag";
  const displayName = kind === "category"
    ? launchPosts.find((post) => post.category.slug === slug)?.category.name
    : launchPosts.flatMap((post) => post.tags).find((tag) => tag.slug === slug)?.name;
  const title = displayName ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  useBlogMeta(`${label}: ${title}`, `Stories filed under ${title} on the ShotNode blog.`);

  const load = useCallback(
    async (nextCursor: string | null, append: boolean, preserve = false) => {
      if (append) setLoadingMore(true);
      else if (!preserve) setLoading(true);
      setError(null);
      try {
        const params = kind === "category" ? { category: slug } : { tag: slug };
        const res = await listPosts({ ...params, cursor: nextCursor ?? undefined, limit: 12 });
        setItems((cur) => (append ? [...cur, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load stories.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [kind, slug],
  );

  useEffect(() => {
    if (path === firstPath.current && seeded) {
      void load(null, false, true); // show prerendered content while refreshing CMS
      return;
    }
    firstPath.current = path;
    setItems([]);
    setCursor(null);
    void load(null, false);
  }, [path, load, seeded]);

  return (
    <div className="blog-page container">
      <span className="blog-eyebrow">{label}</span>
      <h1 className="blog-h1">{title}</h1>
      {loading ? (
        <p className="blog-status" role="status">
          Loading stories…
        </p>
      ) : error ? (
        <p className="blog-status blog-error" role="alert">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="blog-status">No stories here yet.</p>
      ) : (
        <>
          <div className="blog-grid">
            {items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {cursor && (
            <div className="blog-more">
              <button type="button" onClick={() => void load(cursor, true)} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
