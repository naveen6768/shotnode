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

This is a static Vite + React app. Choose any platform below.

### GCP (two accounts)

| Env | Command | Account | Project | VM | IP | Path |
| --- | --- | --- | --- | --- | --- | --- |
| Production | `SHOTNODE_ENV=production bash scripts/deploy-gcp.sh` | `k.naveen6767@gmail.com` | `shotnode-prod-k6767-2026` | `shotnode-prod` | `34.93.135.34` | `/var/www/shotnode` |
| Staging | `SHOTNODE_ENV=development bash scripts/deploy-gcp.sh` | `tradingbeast9@gmail.com` | `shotnode-dev-tb` | `shotnode-dev` | `35.200.131.199` | `/var/www/shotnode-dev` |

Production SSH uses IAP. The deploy script adds `--tunnel-through-iap`. Live sites: https://shotnode.pro/ and https://staging.shotnode.pro/. Account setup is in the Android repo guide [`../neo_cut_studio/docs/SETUP_FULL_STACK.md`](../neo_cut_studio/docs/SETUP_FULL_STACK.md).

### Vercel (recommended)

1. Push the repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects the Vite framework via `vercel.json`.
4. Deploy — no environment variables required.

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
