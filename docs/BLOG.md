# Blog (`/blog`)

The blog is architected and planned in the backend repository, which owns the content API.
This repo implements the public pages and the SEO render service.

- Entry point and phase index: `../shotnode_backend/docs/execution/blog-cms/README.md`
- Agent prompt: `../shotnode_backend/docs/execution/blog-cms/AGENT_PROMPT.md`
- Architecture (see §10 for rendering/SEO): `../shotnode_backend/docs/backend/45_blog_cms_architecture.md`
- Public API contract (§5): `../shotnode_backend/docs/backend/46_blog_cms_database_and_api_contracts.md`

Phases that change this repo:

| Phase | What |
|---|---|
| 0 | Hosting facts (which VM serves `shotnode.pro`), prod nginx `^~ /static/` fix prepared |
| 7 | Blog pages, typed public API client, AI disclosure, first-render data hand-off |
| 8 | Node SEO render service, nginx routes for `/blog`, `/sitemap.xml`, `/blog/rss.xml`, robots fix, staging deploy |
| 9 | Production rollout (only with explicit approval) |

Branch: `feature/blog-cms`.

The live `shotnode.pro` host is now confirmed as `shotnode-production` in
`shotnode-prod-app-2026` (`34.93.6.78`). Use `scripts/deploy-live-web.sh` for
website releases there. `scripts/deploy-gcp.sh` with `SHOTNODE_ENV=production`
targets the preserved legacy VM, which does not serve the public domain.

## Launch articles and future publishing

The three launch articles live in `src/data/launchPosts.js`. Their cover artwork
is in `public/blog/` (editable SVG sources and optimized JPEGs for page and
social previews). The public API client and render service merge these articles
with published CMS posts. A CMS post with the same slug takes precedence. Keep
the slug unchanged when moving an article into the CMS, then remove its local
entry after the CMS and production render service are confirmed live.

`npm run build` writes HTML for the launch index, articles, category, tag, and
author archives, plus sitemap and RSS XML into `dist/`. These files make the
launch articles discoverable on static hosting. The Node server serves the
same routes dynamically with CMS precedence. For future CMS posts, route
`/blog*`, `/sitemap.xml`, `/sitemap-blog.xml`, and `/blog/rss.xml` through the
Node server or the dedicated render service; static build output only contains
launch articles.

The browser fetches the public CMS API for new posts. Keep the backend's blog
publishing workflow as the long-term source of truth; do not add routine posts
to `launchPosts.js` after the CMS rollout.
