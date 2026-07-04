# ShotNode AI

Marketing site for ShotNode — the AI video editor built for creators who move fast.

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

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start Vite dev server on port 3000   |
| `npm run build` | Production build to `dist/`          |
| `npm start`     | Serve `dist/` with Express           |
| `npm run preview` | Preview production build locally |
| `npm run lint`  | Type-check with TypeScript           |
