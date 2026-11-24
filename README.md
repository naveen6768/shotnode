# ShotNode AI

Marketing site for ShotNode — the AI video editing app for Android. The site introduces the mobile app and sends download calls to action directly to Google Play.

The phone preview is an interactive marketing illustration, not a recording of the Android app or a browser-based video editor. App pricing and purchase information are provided by Google Play and the app; this site does not collect payments or early-access registrations.

The shared-project (`/r/:packageId`) and template (`/t/:templateId`) routes retain their API lookups and Android app links. The Google Play destination is shared through `src/components/DownloadLink.tsx`.

**Full platform setup** (Android, backend, admin, this site): see [`../neo_cut_studio/docs/SETUP_FULL_STACK.md`](../neo_cut_studio/docs/SETUP_FULL_STACK.md) in the Android monorepo.

## Prerequisites

- Node.js 20+

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run preview   # preview the static build locally
# or
npm start         # serve dist/ with the production Node server
```

## Deploy

The public `shotnode.pro` site runs on the newer production VM. Use the
website-only deploy script below so the backend on that VM is left intact.

### GCP (two accounts)

| Env | Command | Account | Project | VM | IP | Path |
| --- | --- | --- | --- | --- | --- | --- |
| Live production | `bash scripts/deploy-live-web.sh` | `shotnode@gmail.com` | `shotnode-prod-sn-2026` | `shotnode-production` | `34.14.209.32` | `/var/www/shotnode-dev` |
| Staging | `SHOTNODE_ENV=development bash scripts/deploy-gcp.sh` | `shotnodeapp@gmail.com` | `shotnode-staging-k6767-2026` | `shotnode-staging` | `34.47.197.158` | `/var/www/shotnode-dev` |
| Preserved legacy VM | `SHOTNODE_ENV=production bash scripts/deploy-gcp.sh` | `k.naveen6767@gmail.com` | `shotnode-prod-k6767-2026` | `shotnode-prod` | `34.93.135.34` | `/var/www/shotnode` |

All VM access uses IAP. The live deploy builds locally, uploads only website
files, backs up the prior site, and verifies the blog and existing API before
completing. Live sites: https://shotnode.pro/ and https://staging.shotnode.pro/.
Account setup is in the Android repo guide [`../neo_cut_studio/docs/SETUP_FULL_STACK.md`](../neo_cut_studio/docs/SETUP_FULL_STACK.md).

### SEO render service (GCP)

`/blog*`, `/l/:publicId`, `/l/:publicId/poster`, `/sitemap.xml`, and
`/sitemap-*.xml` are proxied by nginx to a loopback Node render service
(`server/render/server.js`, no React SSR) that injects crawler-visible metadata
and page content into the built SPA shell. Listing pages resolve current public
listing data on each request and use a no-store poster resolver for social
images, so expiring signed media URLs are not saved in page or image metadata.

Project share links (`/l/:publicId`) never play in the browser. Link-preview
crawlers get OG/Twitter metadata with the poster image. Human visitors get a
redirect to the ShotNode app (Android intent) or Google Play, with the listing id
in the install referrer. The web does not serve project preview video, and
`/l/:publicId/preview` is not routed.

| Env | Unit | Port | Backend |
| --- | --- | --- | --- |
| Production | `shotnode-web-render` | `3020` | `http://127.0.0.1:8090` |
| Staging | `shotnode-web-render-dev` | `3021` | `http://127.0.0.1:8091` |

The deploy scripts install/refresh the systemd unit from
`scripts/shotnode-web-render.service`, restarts it after every build, waits for
`/healthz`, then reloads nginx. If the render service is down, nginx falls back
to the SPA shell for `/blog*` (`error_page 502 503 504 /index.html`).
The `/l/` route never plays a project in the browser: Android App Links open the app, and the renderer
(or, without it, the SPA route) sends browsers to the Play listing with the listing id in the install
referrer. The renderer on GCP also serves OG metadata to link-preview crawlers; static Vercel, Netlify and
Cloudflare Pages deployments serve only the SPA redirect and no crawler metadata.

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects the Vite framework via `vercel.json`.
4. Deploy. The render service has no project-preview playback switch: `/l/:publicId` redirects humans to the app or Play and serves metadata to crawlers only.

### Netlify

1. Push the repo to GitHub.
2. Import at [app.netlify.com](https://app.netlify.com).
3. Netlify reads build settings from `netlify.toml` automatically.
4. Deploy.

### Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20+

### Railway / Render / Fly.io (Node server)

These platforms need a start command:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Port:** set `PORT` from the platform (the server reads `process.env.PORT`)

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start Vite dev server on port 3000 |
| `npm run build`   | Production build to `dist/`        |
| `npm start`       | Serve `dist/` with Express         |
| `npm run preview` | Preview production build locally   |
| `npm run lint`    | Type-check with TypeScript         |
