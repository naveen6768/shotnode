import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Brand from "../components/Brand";
import DownloadLink from "../components/DownloadLink";
import { apiUrl } from "../lib/apiBase";
import "../styles/creator-profile.css";

type Creator = {
  userId: string;
  slug: string;
  displayName: string;
  bio?: string | null;
  headline?: string | null;
  stats: { liveProjectCount: number; followerCount: number; followingCount: number };
};

type Listing = {
  listingId: string;
  title: string;
  posterUrl?: string | null;
  shareUrl?: string | null;
  status: string;
  listingKind: string;
};

type ListingPage = { items: Listing[]; nextCursor?: string | null };

export default function CreatorProfileLanding() {
  const { slug = "" } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setCreator(null);
    setItems([]);
    setCursor(null);
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const profileResponse = await fetch(
          apiUrl(`/api/v1/creators/${encodeURIComponent(slug)}`),
          { signal: controller.signal },
        );
        if (!profileResponse.ok) throw new Error(profileResponse.status === 404 ? "Creator not found" : "Could not load creator");
        const profile = (await profileResponse.json()) as Creator;
        const listingResponse = await fetch(
          apiUrl(`/api/v1/creators/${encodeURIComponent(profile.userId)}/listings?kind=PROJECT&limit=24`),
          { signal: controller.signal },
        );
        if (!listingResponse.ok) throw new Error("Could not load projects");
        const page = (await listingResponse.json()) as ListingPage;
        if (!controller.signal.aborted) {
          setCreator(profile);
          setItems(page.items.filter((item) => item.status === "LIVE" && item.listingKind === "PROJECT"));
          setCursor(page.nextCursor ?? null);
        }
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load creator");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [slug]);

  async function loadMore() {
    if (!creator || !cursor || moreLoading) return;
    setMoreLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/v1/creators/${encodeURIComponent(creator.userId)}/listings?kind=PROJECT&limit=24&cursor=${encodeURIComponent(cursor)}`));
      if (!response.ok) throw new Error("Could not load more projects");
      const page = (await response.json()) as ListingPage;
      setItems((old) => [...new Map([...old, ...page.items.filter((item) => item.status === "LIVE" && item.listingKind === "PROJECT")].map((item) => [item.listingId, item])).values()]);
      setCursor(page.nextCursor ?? null);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load more projects");
    } finally {
      setMoreLoading(false);
    }
  }

  return (
    <main className="creator-page">
      <header className="creator-topbar"><Brand /><DownloadLink className="button button-orange" /></header>
      {loading && <p role="status" className="creator-state">Loading creator profile…</p>}
      {error && !creator && <p role="alert" className="creator-state">{error}</p>}
      {creator && <>
        <section className="creator-header">
          <div className="creator-avatar" aria-hidden="true">{creator.displayName.trim().slice(0, 1).toUpperCase()}</div>
          <div className="creator-heading">
            <span className="creator-handle">@{creator.slug}</span>
            <h1>{creator.displayName}</h1>
            {(creator.headline || creator.bio) && <p>{creator.headline || creator.bio}</p>}
            <div className="creator-stats" aria-label="Creator statistics">
              <span><strong>{creator.stats.liveProjectCount}</strong> projects</span>
              <span><strong>{creator.stats.followerCount}</strong> followers</span>
              <span><strong>{creator.stats.followingCount}</strong> following</span>
            </div>
          </div>
        </section>
        <section className="creator-portfolio" aria-label="Published projects">
          <h2>Projects</h2>
          {items.length === 0 && <p className="creator-state">No published projects yet.</p>}
          <div className="creator-grid">{items.map((item) => <a key={item.listingId} href={item.shareUrl || undefined} className="creator-project" aria-label={`Open ${item.title}`}>
            {item.posterUrl ? <img src={item.posterUrl} alt="" loading="lazy" /> : <span className="creator-poster-fallback">ShotNode</span>}
            <span>{item.title}</span>
          </a>)}</div>
          {error && <p role="alert" className="creator-state">{error}</p>}
          {cursor && <button className="button button-outline creator-more" onClick={loadMore} disabled={moreLoading}>{moreLoading ? "Loading…" : "Load more"}</button>}
        </section>
      </>}
    </main>
  );
}
