/**
 * Community template landing — App Link target for https://shotnode.pro/t/{templateId}
 * (mirrors RemixShareLanding for CapCut-class community templates; /r/ remains remix packages)
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ShareLanding from "../components/ShareLanding";
import { apiUrl } from "../lib/apiBase";

import { PLAY_STORE_URL as PLAY_STORE } from "../components/DownloadLink";

type TemplateCard = {
  template_id?: string;
  package_id?: string;
  title: string;
  required_media_slot_count?: number | null;
  slot_count?: number | null;
  clip_count?: number | null;
  share_url?: string | null;
  status?: string | null;
};

function resolveSlotCount(card: TemplateCard): number | null {
  const n =
    card.required_media_slot_count ??
    card.slot_count ??
    card.clip_count ??
    null;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : null;
}

export default function TemplateShareLanding() {
  const { templateId = "" } = useParams();
  const [card, setCard] = useState<TemplateCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openIntent = useMemo(() => {
    if (!templateId) return PLAY_STORE;
    return `intent://t/${encodeURIComponent(templateId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`;
  }, [templateId]);

  const slotCount = card ? resolveSlotCount(card) : null;

  useEffect(() => {
    if (!templateId) {
      setError("Missing template id");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Same templates endpoint as remix; backend resolves community after remix.
        const res = await fetch(
          apiUrl(`/api/v1/templates/${encodeURIComponent(templateId)}`),
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404 ? "Template not found" : `HTTP ${res.status}`,
          );
        }
        const json = (await res.json()) as TemplateCard;
        if (!cancelled) setCard(json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Could not load template");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  return (
    <ShareLanding
      title={card?.title ?? "Open community template"}
      description="A little inspiration. A whole new story. Open this template in ShotNode and replace the editable clips with your own footage."
      openIntent={openIntent}
      error={error}
      slotCount={slotCount}
    />
  );
}
