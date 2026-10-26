import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
import { createCache } from "./server/render/cache.js";
import { splitTemplate, stripStaticSeo } from "./server/render/html.js";
import { route as renderBlogRoute } from "./server/render/server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, "dist");
const shell = fs.readFileSync(path.join(distPath, "index.html"), "utf8");
const blogParts = { shell, parts: splitTemplate(shell), baseHead: stripStaticSeo(shell.slice(0, shell.indexOf("</head>"))) };
const blogCache = createCache({ max: 500, ttlMs: 60_000 });
const backendOrigin = (process.env.BACKEND_ORIGIN || "http://127.0.0.1:8091").replace(/\/+$/, "");
const siteOrigin = (process.env.SITE_ORIGIN || "https://shotnode.pro").replace(/\/+$/, "");

// CMS content takes precedence on Node hosting. Build-time HTML/XML remains
// available to static hosts and while the separate render proxy rolls out.
app.get(/^\/blog(?:\/.*)?$|^\/sitemap(?:-pages|-blog)?\.xml$/, async (req, res) => {
  try {
    const rendered = await renderBlogRoute({
      path: req.path,
      parts: blogParts,
      backendOrigin,
      siteOrigin,
      cache: blogCache,
    });
    res.status(rendered.status).set(rendered.headers).send(rendered.body);
  } catch {
    res.status(503).send("Blog temporarily unavailable");
  }
});

app.use(express.static(distPath, { maxAge: "1y", index: false }));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`ShotNode running at http://0.0.0.0:${port}`);
});
