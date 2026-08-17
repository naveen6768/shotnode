/**
 * Shared remix project landing — App Link target for https://shotnode.pro/r/{packageId}
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const PLAY_STORE =
  "https://play.google.com/store/apps/details?id=com.shotnode.app";
const API_BASE =
  (import.meta as ImportMeta & { env?: { VITE_SHOTNODE_API_BASE?: string } }).env
    ?.VITE_SHOTNODE_API_BASE ?? "https://shotnode.pro";

type PackageCard = {
  package_id: string;
  title: string;
  duration_ms: number;
  share_url?: string | null;
  status?: string | null;
};

export default function RemixShareLanding() {
  const { packageId = "" } = useParams();
  const [card, setCard] = useState<PackageCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openIntent = useMemo(() => {
    if (!packageId) return PLAY_STORE;
    return `intent://r/${encodeURIComponent(packageId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`;
  }, [packageId]);

  useEffect(() => {
    if (!packageId) {
      setError("Missing project id");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const base = API_BASE.replace(/\/$/, "").replace(/\/api\/v1$/, "");
        const res = await fetch(`${base}/api/v1/templates/${encodeURIComponent(packageId)}`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Project not found" : `HTTP ${res.status}`);
        }
        const json = (await res.json()) as PackageCard;
        if (!cancelled) setCard(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load project");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageId]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
        background:
          "radial-gradient(1200px 600px at 20% 0%, #1b2a3a 0%, #0b1118 55%, #070a0e 100%)",
        color: "#f4f7fb",
        fontFamily: '"Fraunces", "Iowan Old Style", Georgia, serif',
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p
          style={{
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            opacity: 0.7,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          ShotNode
        </p>
        <h1 style={{ fontSize: "2.4rem", lineHeight: 1.1, margin: "0.4rem 0 0.75rem" }}>
          {card?.title ?? "Open shared project"}
        </h1>
        <p style={{ opacity: 0.85, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          Editable timeline with effects and filters preserved. Open in the ShotNode app to remix.
        </p>
        {error ? (
          <p style={{ color: "#ffb4a8", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
            {error}
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
          <a
            href={openIntent}
            style={{
              display: "inline-block",
              padding: "0.85rem 1.25rem",
              background: "#e8f1ff",
              color: "#0b1118",
              textDecoration: "none",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            Open in ShotNode
          </a>
          <a
            href={PLAY_STORE}
            style={{
              display: "inline-block",
              padding: "0.85rem 1.25rem",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#f4f7fb",
              textDecoration: "none",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Get the app
          </a>
        </div>
      </div>
    </main>
  );
}
