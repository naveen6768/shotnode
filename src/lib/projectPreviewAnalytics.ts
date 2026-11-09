import { apiUrl } from "./apiBase";

export type ProjectPreviewEvent = "content.preview_start" | "content.preview_complete";

export type ProjectPreviewAnalyticsContext = {
  listingId?: string | null;
  listingReleaseId?: string | null;
  analyticsContextToken?: string | null;
};

/**
 * Sends the existing signed-context marketplace engagement contract. No URL, title, viewer
 * identifier, media bytes, or playback position leaves the page; missing context means no event.
 */
export function recordProjectPreviewEvent(
  context: ProjectPreviewAnalyticsContext,
  eventName: ProjectPreviewEvent,
  durationWatchedMs?: number,
): void {
  const listingId = context.listingId?.trim();
  const contextToken = context.analyticsContextToken?.trim();
  if (!listingId || !contextToken) return;

  const factsJson: Record<string, string | number> = {
    listing_id: listingId,
    surface: "PROJECT_SHARE_WEB",
    device_class: "WEB",
  };
  if (context.listingReleaseId) factsJson.listing_release_id = context.listingReleaseId;
  if (eventName === "content.preview_complete" && Number.isFinite(durationWatchedMs)) {
    factsJson.duration_watched_ms = Math.max(0, Math.round(durationWatchedMs ?? 0));
  }
  const sourceEventId = globalThis.crypto?.randomUUID?.() ??
    `web-preview-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const body = JSON.stringify({
    events: [{
      sourceKind: "CLIENT_CONTEXT",
      sourceEventId,
      eventName,
      eventVersion: 1,
      occurredAt: new Date().toISOString(),
      surface: "PROJECT_SHARE_WEB",
      referrerBucket: "DIRECT",
      deviceClass: "WEB",
      consentClass: "ANALYTICS",
      contextToken,
      factsJson,
    }],
  });

  try {
    void fetch(apiUrl("/api/v1/analytics/events"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Engagement reporting is best effort and must never affect playback.
  }
}
