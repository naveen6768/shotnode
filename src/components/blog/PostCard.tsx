import { Link } from "react-router-dom";
import { absoluteUrl, coverSrc, coverSrcSet, type BlogPostSummary } from "../../lib/blogApi";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Grid card for the index / taxonomy / author lists. */
export function PostCard({ post }: { post: BlogPostSummary }) {
  const src = coverSrc(post.coverImage);
  return (
    <article className="blog-card">
      <Link to={`/blog/${post.slug}`} className="blog-card-cover" tabIndex={-1} aria-hidden="true">
        {src ? (
          <img
            src={src}
            srcSet={coverSrcSet(post.coverImage)}
            sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
            alt=""
            loading="lazy"
            width={post.coverImage?.width ?? 960}
            height={post.coverImage?.height ?? 540}
          />
        ) : (
          <span className="blog-card-cover-fallback" aria-hidden="true" />
        )}
      </Link>
      <div className="blog-card-body">
        {post.category && <span className="blog-eyebrow">{post.category.name}</span>}
        <h3>
          <Link to={`/blog/${post.slug}`}>{post.title || post.slug}</Link>
        </h3>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <p className="blog-byline-mini">
          {post.author && <span>{post.author.displayName}</span>}
          {post.author && post.firstPublishedAt && <span aria-hidden="true"> · </span>}
          {post.firstPublishedAt && <time dateTime={post.firstPublishedAt}>{formatDate(post.firstPublishedAt)}</time>}
          {post.readingTimeMinutes > 0 && <span> · {post.readingTimeMinutes} min read</span>}
        </p>
      </div>
    </article>
  );
}

/** Full byline for the post page: avatar, name (-> author page), dates, reading time. */
export function Byline({ post }: { post: BlogPostSummary }) {
  const avatar = absoluteUrl(post.author?.avatarUrl ?? null);
  return (
    <div className="blog-byline">
      {avatar && <img src={avatar} alt="" width={40} height={40} loading="lazy" />}
      <div>
        <p>
          {post.author ? (
            <Link to={`/blog/author/${post.author.slug}`}>{post.author.displayName}</Link>
          ) : (
            "ShotNode"
          )}
        </p>
        <p className="blog-byline-sub">
          {post.firstPublishedAt && (
            <time dateTime={post.firstPublishedAt}>{formatDate(post.firstPublishedAt)}</time>
          )}
          {post.updatedAt &&
            post.firstPublishedAt &&
            post.updatedAt.slice(0, 10) > post.firstPublishedAt.slice(0, 10) && (
              <span>
                {" "}· Updated <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
              </span>
            )}
          {post.readingTimeMinutes > 0 && <span> · {post.readingTimeMinutes} min read</span>}
        </p>
      </div>
    </div>
  );
}

/** Machine-authorship disclosure line (agent posts only). */
export function AiDisclosure({ text }: { text: string }) {
  return <p className="blog-ai-disclosure">{text}</p>;
}
