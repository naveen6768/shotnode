import { useEffect } from "react";
import type { BlogTocEntry } from "../../lib/blogApi";

/** Sticky table of contents (≥1100px); collapsible on mobile via <details>. */
export function Toc({ entries }: { entries: BlogTocEntry[] }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!entries || entries.length === 0) return null;
  const list = (
    <ol>
      {entries.map((t) => (
        <li key={t.anchor} data-level={t.level}>
          <a href={`#${t.anchor}`}>{t.text}</a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <aside className="blog-toc" aria-label="Table of contents">
        <p>On this page</p>
        {list}
      </aside>
      <details className="blog-toc-mobile">
        <summary>On this page</summary>
        {list}
      </details>
    </>
  );
}

/**
 * Renders backend-sanitized `bodyHtml`. No client-side markdown anywhere —
 * the HTML comes only from the API and is injected once.
 */
export function ArticleBody({ html }: { html: string }) {
  return <div className="blog-article" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Plain share links (no third-party scripts). */
export function ShareLinks({ title, path }: { title: string; path: string }) {
  const url = `https://shotnode.pro${path}`;
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  return (
    <div className="blog-share">
      <span>Share</span>
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`} target="_blank" rel="noreferrer">
        X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noreferrer">
        LinkedIn
      </a>
      <a href={`https://wa.me/?text=${text}%20${encoded}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => {
          const done = (ok: boolean) => {
            const el = document.getElementById("blog-copy-link-status");
            if (el) el.textContent = ok ? "Link copied" : "Copy failed";
          };
          if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => done(true), () => done(false));
          else done(false);
        }}
      >
        Copy link
      </button>
      <span id="blog-copy-link-status" role="status" aria-live="polite" />
    </div>
  );
}
