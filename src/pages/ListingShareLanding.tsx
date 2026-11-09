/**
 * Published project listing landing — App Link target for https://shotnode.pro/l/{publicId}
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ShareLanding from "../components/ShareLanding";
import { apiUrl } from "../lib/apiBase";

import { PLAY_STORE_URL as PLAY_STORE } from "../components/DownloadLink";

type ListingCard = {
  title: string;
  shortDescription?: string | null;
  creator?: { displayName?: string | null } | null;
  artifactSummary?: { clipCount?: number | null } | null;
};

const DEFAULT_DESCRIPTION =
  "A story worth making your own. Open this editable timeline in ShotNode to remix its clips, effects, and filters.";

export default function ListingShareLanding() {
  const { publicId = "" } = useParams();
  const [card, setCard] = useState<ListingCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openIntent = useMemo(() => {
    if (!publicId) return PLAY_STORE;
    return `intent://l/${encodeURIComponent(publicId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`;
  }, [publicId]);

  useEffect(() => {
    if (!publicId) {
      setError("Missing project id");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/v1/marketplace/listings/${encodeURIComponent(publicId)}`),
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "This project is no longer available"
              : `HTTP ${res.status}`,
          );
        }
        const json = (await res.json()) as ListingCard;
        if (!cancelled) setCard(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load project");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const creator = card?.creator?.displayName?.trim();
  const description = card?.shortDescription?.trim()
    ? card.shortDescription
    : creator
      ? `Shared by ${creator}. ${DEFAULT_DESCRIPTION}`
      : DEFAULT_DESCRIPTION;

  return (
    <ShareLanding
      title={card?.title ?? "Open shared project"}
      description={description}
      openIntent={openIntent}
      error={error}
      slotCount={card?.artifactSummary?.clipCount ?? null}
    />
  );
}
