import { Link } from "react-router-dom";
import { useBlogMeta } from "../components/blog/Related";

/** On-brand 404 with links home and to the blog. */
export default function NotFoundPage() {
  useBlogMeta("Page not found", "The page you are looking for does not exist.", { noindex: true });
  return (
    <div className="blog-page container blog-notfound">
      <span className="blog-eyebrow">404</span>
      <h1 className="blog-h1">
        Lost the <em>plot?</em>
      </h1>
      <p className="blog-intro">The page you are looking for moved, or never existed.</p>
      <p className="blog-notfound-links">
        <Link to="/" className="button button-dark">
          Back home
        </Link>
        <Link to="/blog" className="button">
          Browse the blog
        </Link>
      </p>
    </div>
  );
}
