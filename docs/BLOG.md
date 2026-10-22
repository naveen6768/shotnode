# Blog (`/blog`) — where the plan lives

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
