import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { absoluteUrl, getAuthor, getInitialBlogData, type BlogAuthorResponse } from "../../lib/blogApi";
import { PostCard } from "../../components/blog/PostCard";
import { useBlogMeta } from "../../components/blog/Related";
import NotFoundPage from "../NotFoundPage";

/** Public author profile: bio, links, recent posts. */
export default function BlogAuthor() {
  const { slug = "" } = useParams();
  const { pathname } = useLocation();
  const [data, setData] = useState<BlogAuthorResponse | null>(() => getInitialBlogData<BlogAuthorResponse>(pathname));
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useBlogMeta(data ? data.author.displayName : "Author", data?.author.bio);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    if (data) return;
    (async () => {
      setNotFound(false);
      setError(null);
      try {
        const res = await getAuthor(slug, ctrl.signal);
        if (!cancelled) setData(res);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        if (e && typeof e === "object" && (e as { code?: string }).code === "BLOG_POST_NOT_FOUND") setNotFound(true);
        else setError(e instanceof Error ? e.message : "Could not load the author.");
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFound) return <NotFoundPage />;
  if (error) {
    return (
      <div className="blog-page container">
        <p className="blog-status blog-error" role="alert">
          {error}
        </p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="blog-page container">
        <p className="blog-status" role="status">
          Loading author…
        </p>
      </div>
    );
  }
  const avatar = absoluteUrl(data.author.avatarUrl);
  return (
    <div className="blog-page container">
      <span className="blog-eyebrow">{data.author.kind === "agent" ? "AI author" : "Author"}</span>
      <div className="blog-author-head">
        {avatar && <img src={avatar} alt="" width={72} height={72} loading="lazy" />}
        <div>
          <h1 className="blog-h1">{data.author.displayName}</h1>
          {data.author.bio && <p className="blog-intro">{data.author.bio}</p>}
          {data.author.links && Object.keys(data.author.links).length > 0 && (
            <p className="blog-author-links">
              {Object.entries(data.author.links).map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
      {data.posts.length === 0 ? (
        <p className="blog-status">No stories yet.</p>
      ) : (
        <div className="blog-grid">
          {data.posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      <p className="blog-back">
        <Link to="/blog">← All stories</Link>
      </p>
    </div>
  );
}
