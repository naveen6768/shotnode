import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  coverSrc,
  coverSrcSet,
  getInitialBlogData,
  listCategories,
  listPosts,
  type BlogCategory,
  type BlogListResponse,
  type BlogPostSummary,
} from "../../lib/blogApi";
import { PostCard } from "../../components/blog/PostCard";
import { useBlogMeta } from "../../components/blog/Related";
import { launchPosts } from "../../data/launchPosts.js";

/** Public blog index: hero, category chips, card grid, cursor pages. */
export default function BlogIndex() {
  const { pathname } = useLocation();
  const [initial] = useState<BlogListResponse>(() => getInitialBlogData<BlogListResponse>(pathname) ?? {
    items: launchPosts as BlogPostSummary[], nextCursor: null,
  });
  const [items, setItems] = useState<BlogPostSummary[]>(initial.items);
  const [cursor, setCursor] = useState<string | null>(initial.nextCursor);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(initial.items.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useBlogMeta("Blog", "Practical ideas for filming, editing, and sharing more memorable videos.");

  const load = useCallback(
    async (nextCursor: string | null, append: boolean, category: string | null) => {
      if (append) setLoadingMore(true);
      else setLoading((current) => current || items.length === 0);
      setError(null);
      try {
        const res = await listPosts({ cursor: nextCursor ?? undefined, limit: 12, category: category ?? undefined });
        setItems((cur) => (append ? [...cur, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load posts.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [items.length],
  );

  useEffect(() => {
    void load(null, false, null);
    listCategories().then(setCategories).catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hero = items.find((p) => p.isFeatured && p.coverImage) ?? items.find((p) => p.coverImage) ?? items[0] ?? null;
  const rest = hero ? items.filter((p) => p.id !== hero.id) : [];

  return (
    <div className="blog-page container">
      <span className="blog-eyebrow">The ShotNode blog</span>
      <h1 className="blog-h1">
        Stories for the <em>creative part.</em>
      </h1>
      <p className="blog-intro">Thoughtful, practical ideas for filming, editing, and sharing more memorable videos.</p>

      {categories.length > 0 && (
        <div className="blog-chips" role="navigation" aria-label="Categories">
          <button
            type="button"
            className={activeCategory === null ? "blog-chip-active" : ""}
            onClick={() => {
              setActiveCategory(null);
              setItems([]);
              setLoading(true);
              void load(null, false, null);
            }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.slug}
              className={activeCategory === c.slug ? "blog-chip-active" : ""}
              onClick={() => {
                setActiveCategory(c.slug);
                setItems([]);
                setLoading(true);
                void load(null, false, c.slug);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="blog-status" role="status">
          Loading stories…
        </p>
      ) : error ? (
        <p className="blog-status blog-error" role="alert">
          {error}{" "}
          <button type="button" onClick={() => void load(null, false, activeCategory)}>
            Retry
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="blog-status">No stories yet — check back soon.</p>
      ) : (
        <>
          {hero && (
            <article className="blog-hero">
              <Link to={`/blog/${hero.slug}`} className="blog-hero-cover" tabIndex={-1} aria-hidden="true">
                {hero.coverImage && coverSrc(hero.coverImage) ? (
                  <img
                    src={coverSrc(hero.coverImage)!}
                    srcSet={coverSrcSet(hero.coverImage)}
                    sizes="100vw"
                    alt=""
                    loading="eager"
                    width={hero.coverImage.width || 1600}
                    height={hero.coverImage.height || 900}
                  />
                ) : (
                  <span className="blog-card-cover-fallback" aria-hidden="true" />
                )}
              </Link>
              <div className="blog-hero-body">
                {hero.category && <span className="blog-eyebrow">{hero.category.name}</span>}
                <h2>
                  <Link to={`/blog/${hero.slug}`}>{hero.title || hero.slug}</Link>
                </h2>
                {hero.excerpt && <p>{hero.excerpt}</p>}
                <Link className="blog-read-link" to={`/blog/${hero.slug}`}>Read the story <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          )}
          <div className={`blog-grid${rest.length === 2 ? " blog-grid-two" : ""}`}>
            {rest.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          {cursor && (
            <div className="blog-more">
              <button type="button" onClick={() => void load(cursor, true, activeCategory)} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
