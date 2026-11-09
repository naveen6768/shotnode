import { ArrowUpRight, Play, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import Brand from "../components/Brand";
import DownloadLink, { PLAY_STORE_URL } from "../components/DownloadLink";
import { absoluteUrl, apiUrl } from "../lib/apiBase";
import { recordProjectPreviewEvent } from "../lib/projectPreviewAnalytics";

type ProjectListing = {
  listingId?: string;
  listingReleaseId?: string;
  publicId: string;
  listingKind: "PROJECT" | "TEMPLATE";
  title: string;
  status: string;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  creator: { displayName: string };
  artifactSummary?: {
    durationMs?: number | null;
    aspectRatio?: string | null;
  };
  posterUrl?: string | null;
  previewUrl?: string | null;
  analyticsContextToken?: string | null;
};

const SHARE_DESCRIPTION =
  "Watch this short project preview, then open the editable ShotNode project to make it your own.";

function previewPlaybackEnabled(): boolean {
  const serverValue = typeof document === "undefined"
    ? null
    : document.querySelector<HTMLMetaElement>('meta[name="project-preview-playback"]')?.content;
  if (serverValue != null) return serverValue === "true";
  const env = (import.meta as ImportMeta & { env?: { VITE_PROJECT_PREVIEW_PLAYBACK_ENABLED?: string } }).env;
  return env?.VITE_PROJECT_PREVIEW_PLAYBACK_ENABLED !== "false";
}

function formatDuration(durationMs: number | null | undefined): string | null {
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0) {
    return null;
  }
  const seconds = Math.round(durationMs / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function parseAspectRatio(value: string | null | undefined): { css: string; numeric: number } {
  if (value) {
    const parts = value.trim().match(/^(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)$/i);
    if (parts) {
      const width = Number(parts[1]);
      const height = Number(parts[2]);
      const ratio = width / height;
      if (Number.isFinite(ratio) && ratio >= 0.4 && ratio <= 2.5) {
        return { css: `${width} / ${height}`, numeric: ratio };
      }
    }
    const ratio = Number(value);
    if (Number.isFinite(ratio) && ratio >= 0.4 && ratio <= 2.5) {
      return { css: String(ratio), numeric: ratio };
    }
  }
  return { css: "16 / 9", numeric: 16 / 9 };
}

export default function ProjectListingShareLanding() {
  const { publicId = "" } = useParams();
  const [listing, setListing] = useState<ProjectListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [playerAttempt, setPlayerAttempt] = useState(0);
  const [refreshingPreview, setRefreshingPreview] = useState(false);
  const [canPlayPreview, setCanPlayPreview] = useState(previewPlaybackEnabled);
  const startReported = useRef(false);
  const completionReported = useRef(false);

  const openIntent = useMemo(() => {
    if (!publicId) return PLAY_STORE_URL;
    return `intent://l/${encodeURIComponent(publicId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;
  }, [publicId]);

  const loadListing = useCallback(async (signal?: AbortSignal) => {
    if (!publicId) {
      setError("Missing project id");
      setLoading(false);
      return null;
    }
    setError(null);
    try {
      const response = await fetch(
        apiUrl(`/api/v1/marketplace/listings/${encodeURIComponent(publicId)}`),
        { cache: "no-store", signal },
      );
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "This project is no longer available"
            : "Could not load this project",
        );
      }
      const result = (await response.json()) as ProjectListing;
      if (result.listingKind !== "PROJECT" || result.visibility === "PRIVATE") {
        throw new Error("This link is not a public project listing");
      }
      setListing(result);
      setPreviewError(false);
      return result;
    } catch (reason) {
      if (signal?.aborted) return null;
      setError(reason instanceof Error ? reason.message : "Could not load this project");
      return null;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    startReported.current = false;
    completionReported.current = false;
  }, [publicId]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/__project-preview-config", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() as Promise<{ enabled?: unknown }> : null)
      .then((config) => {
        if (!controller.signal.aborted && typeof config?.enabled === "boolean") {
          setCanPlayPreview(config.enabled);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    void loadListing(controller.signal);
    return () => controller.abort();
  }, [loadListing]);

  useEffect(() => {
    if (!listing) return;
    const oldTitle = document.title;
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const oldDescription = descriptionMeta?.content;
    const socialTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const oldSocialTitle = socialTitle?.content;
    const socialDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const oldSocialDescription = socialDescription?.content;

    document.title = `${listing.title} · ShotNode project`;
    if (descriptionMeta) descriptionMeta.content = SHARE_DESCRIPTION;
    if (socialTitle) socialTitle.content = `${listing.title} · ShotNode project`;
    if (socialDescription) socialDescription.content = SHARE_DESCRIPTION;
    return () => {
      document.title = oldTitle;
      if (descriptionMeta && oldDescription !== undefined) descriptionMeta.content = oldDescription;
      if (socialTitle && oldSocialTitle !== undefined) socialTitle.content = oldSocialTitle;
      if (socialDescription && oldSocialDescription !== undefined) socialDescription.content = oldSocialDescription;
    };
  }, [listing]);

  const refreshPreview = async () => {
    setRefreshingPreview(true);
    await loadListing();
    setPlayerAttempt((attempt) => attempt + 1);
    startReported.current = false;
    completionReported.current = false;
    setRefreshingPreview(false);
  };

  const posterUrl = absoluteUrl(listing?.posterUrl);
  const previewUrl = canPlayPreview ? absoluteUrl(listing?.previewUrl) : null;
  const duration = formatDuration(listing?.artifactSummary?.durationMs);
  const previewRatio = parseAspectRatio(listing?.artifactSummary?.aspectRatio);

  return (
    <main className="listing-share-page">
      <Brand />
      <section className="listing-share-card" aria-labelledby="listing-title">
        <div className="listing-share-heading">
          <span className="eyebrow"><span /> A PROJECT TO PREVIEW</span>
          <h1 id="listing-title">{loading ? "Loading project…" : listing?.title ?? "Project preview"}</h1>
          {listing && (
            <p className="listing-share-byline">
              Made by <strong>{listing.creator.displayName}</strong>
              {duration && <span aria-label={`Project duration ${duration}`}> · {duration}</span>}
            </p>
          )}
        </div>

        {listing && (
          <div
            className="listing-share-player-wrap"
            style={{
              aspectRatio: previewRatio.css,
              "--listing-preview-ratio": previewRatio.numeric,
            } as CSSProperties}
          >
            {previewUrl && !previewError ? (
              <video
                key={`${previewUrl}:${playerAttempt}`}
                className="listing-share-player"
                controls
                playsInline
                muted
                preload="none"
                poster={posterUrl ?? undefined}
                aria-label={`Preview of ${listing.title}`}
                onError={() => setPreviewError(true)}
                onPlaying={() => setPreviewError(false)}
                onPlay={() => {
                  if (startReported.current) return;
                  startReported.current = true;
                  recordProjectPreviewEvent(listing, "content.preview_start");
                }}
                onEnded={(event: SyntheticEvent<HTMLVideoElement>) => {
                  if (completionReported.current) return;
                  completionReported.current = true;
                  recordProjectPreviewEvent(
                    listing,
                    "content.preview_complete",
                    event.currentTarget.currentTime * 1000,
                  );
                }}
              >
                <source src={previewUrl} type="video/mp4" />
                Your browser cannot play this project preview.
              </video>
            ) : (
              <div className="listing-share-poster" role="img" aria-label={`Poster for ${listing.title}`}>
                {posterUrl ? <img src={posterUrl} alt="" /> : <span className="listing-share-poster-placeholder"><Play size={32} /></span>}
                {previewError && <p role="status">Preview could not be played. The project poster is still available.</p>}
                {!previewUrl && !previewError && (
                  <p role="status">
                    {!canPlayPreview && listing.previewUrl
                      ? "Video previews are temporarily unavailable."
                      : "A video preview is not available for this project yet."}
                  </p>
                )}
                {previewUrl && (
                  <button
                    className="listing-share-retry"
                    type="button"
                    onClick={() => void refreshPreview()}
                    disabled={refreshingPreview}
                  >
                    <RefreshCw size={15} className={refreshingPreview ? "spin" : undefined} />
                    {refreshingPreview ? "Refreshing preview…" : "Try preview again"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="listing-share-error" role="alert">
            <p>{error}. Check the link or try loading it again.</p>
            <button type="button" onClick={() => void loadListing()} disabled={loading}>
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        )}

        <p className="listing-share-description">{SHARE_DESCRIPTION}</p>
        <div className="listing-share-actions">
          <a className="button button-orange" href={openIntent}>
            Open in ShotNode <ArrowUpRight size={16} />
          </a>
          <DownloadLink className="button button-outline" icon />
        </div>
        <span className="listing-share-note">Preview the edit first. Remix it when you’re ready.</span>
      </section>
      <span className="listing-share-footer">Made for the way you create.</span>
    </main>
  );
}
