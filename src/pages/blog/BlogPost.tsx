import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  coverSrc,
  coverSrcSet,
  getInitialBlogData,
  getPost,
  getPreview,
  sendView,
  type BlogPost,
  type BlogPostResponse,
  type BlogPostSummary,
} from "../../lib/blogApi";
import { AiDisclosure, Byline } from "../../components/blog/PostCard";
import { ArticleBody, ShareLinks, Toc } from "../../components/blog/Article";
import { BlogBreadcrumb, BlogCta, RelatedPosts, useBlogMeta } from "../../components/blog/Related";
import NotFoundPage from "../NotFoundPage";
import { findLaunchPost, launchPosts } from "../../data/launchPosts.js";

function PostView({ post, related, preview }: { post: BlogPost; related: BlogPostSummary[]; preview: boolean }) {
  const location = useLocation();
  const cover = coverSrc(post.coverImage);
  const sentRef = useRef(false);
  useBlogMeta(post.seoTitle || post.title, post.seoDescription || post.excerpt, {
    canonicalUrl: post.canonicalUrl,
    image: coverSrc(post.ogImage ?? post.coverImage),
    type: "article",
    noindex: preview || post.noindex,
  });
  useEffect(() => {
    if (preview || post.id.startsWith("launch-") || sentRef.current) return;
    sentRef.current = true;
    sendView(post.slug, document.referrer || undefined);
  }, [preview, post.slug]);
  return (
    <div className="blog-page container">
      {preview && <p className="blog-preview-banner">Preview — not published. Views are not counted.</p>}
      <BlogBreadcrumb
        trail={[
          ...(post.category ? [{ label: post.category.name, to: `/blog/category/${post.category.slug}` }] : []),
          { label: post.title || post.slug },
        ]}
      />
      <article className="blog-post">
        {post.category && <span className="blog-eyebrow">{post.category.name}</span>}
        <h1 className="blog-post-title">{post.title || post.slug}</h1>
        {post.dek && <p className="blog-dek">{post.dek}</p>}
        <Byline post={post} />
        {post.aiDisclosure && <AiDisclosure text={post.aiDisclosure} />}
        {cover && (
          <figure className="blog-cover">
            <img
              src={cover}
              srcSet={coverSrcSet(post.coverImage)}
              sizes="100vw"
              alt={post.coverImage?.alt ?? ""}
              width={post.coverImage?.width || 1600}
              height={post.coverImage?.height || 900}
              fetchPriority="high"
            />
          </figure>
        )}
        <div className="blog-post-layout">
          <Toc entries={post.toc} />
          <ArticleBody html={post.bodyHtml} />
        </div>
        {post.tags.length > 0 && (
          <p className="blog-tags">
            {post.tags.map((t) => (
              <Link key={t.slug} to={`/blog/tag/${t.slug}`}>
                #{t.name}
              </Link>
            ))}
          </p>
        )}
        <ShareLinks title={post.title} path={location.pathname} />
      </article>
      <RelatedPosts posts={related} />
      <BlogCta />
    </div>
  );
}

/** Shared loader for published posts and staff preview tokens. */
export default function BlogPost({ preview = false }: { preview?: boolean }) {
  const { slug = "", token = "" } = useParams();
  const key = preview ? token : slug;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [data, setData] = useState<BlogPostResponse | null>(() =>
    preview ? null : getInitialBlogData<BlogPostResponse>(pathname) ?? (() => {
      const post = findLaunchPost(slug) as BlogPost | null;
      return post ? { post, related: launchPosts.filter((item) => item.slug !== slug) as BlogPostSummary[] } : null;
    })(),
  );
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    if (!preview && data?.post.slug === slug && !data.post.id.startsWith("launch-")) return;
    setData((current) => current?.post.slug === slug ? current : null);
    (async () => {
      setNotFound(false);
      setError(null);
      try {
        const res = preview ? await getPreview(key, ctrl.signal) : await getPost(key, ctrl.signal);
        if (cancelled) return;
        setData(res);
        if (!preview && res.post.slug !== slug) navigate(`/blog/${res.post.slug}`, { replace: true });
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        if (e && typeof e === "object" && (e as { code?: string }).code === "BLOG_POST_NOT_FOUND") setNotFound(true);
        else setError(e instanceof Error ? e.message : "Could not load the post.");
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

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
  if (!data || (!preview && data.post.slug !== slug)) {
    return (
      <div className="blog-page container">
        <p className="blog-status" role="status">
          Loading story…
        </p>
      </div>
    );
  }
  return <PostView key={data.post.slug} post={data.post} related={data.related} preview={preview} />;
}
