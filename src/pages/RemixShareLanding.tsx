/**
 * Shared remix project landing — App Link target for https://shotnode.pro/r/{packageId}
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ShareLanding from "../components/ShareLanding";
import { apiUrl } from "../lib/apiBase";

import { PLAY_STORE_URL as PLAY_STORE } from "../components/DownloadLink";

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
        const res = await fetch(
          apiUrl(`/api/v1/templates/${encodeURIComponent(packageId)}`),
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Project not found" : `HTTP ${res.status}`,
          );
        }
        const json = (await res.json()) as PackageCard;
        if (!cancelled) setCard(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load project");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageId]);

  return (
    <ShareLanding
      title={card?.title ?? "Open shared project"}
      description="A story worth making your own. Open this editable timeline in ShotNode to remix its clips, effects, and filters."
      openIntent={openIntent}
      error={error}
    />
  );
}
