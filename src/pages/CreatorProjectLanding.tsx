import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Brand from "../components/Brand";
import DownloadLink from "../components/DownloadLink";
import { apiUrl } from "../lib/apiBase";
import "../styles/creator-profile.css";

type Listing = {
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  posterUrl?: string | null;
  previewUrl?: string | null;
  creator: { slug: string; displayName: string };
};

export default function CreatorProjectLanding() {
  const { publicId = "" } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setListing(null);
    setError(null);
    fetch(apiUrl(`/api/v1/marketplace/listings/${encodeURIComponent(publicId)}`), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(response.status === 404 ? "Project not found" : "Could not load project");
        return response.json() as Promise<Listing>;
      })
      .then((data) => { if (!controller.signal.aborted) setListing(data); })
      .catch((reason) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load project"); });
    return () => controller.abort();
  }, [publicId]);

  return <main className="creator-page">
    <header className="creator-topbar"><Brand /><DownloadLink className="button button-orange" /></header>
    {error && <p role="alert" className="creator-state">{error}</p>}
    {!error && !listing && <p role="status" className="creator-state">Loading project…</p>}
    {listing && <article className="creator-listing">
      <div className="creator-listing-media">
        {listing.previewUrl ? <video controls poster={listing.posterUrl ?? undefined} src={listing.previewUrl} /> : listing.posterUrl ? <img src={listing.posterUrl} alt="" /> : <span>ShotNode</span>}
      </div>
      <div>
        <Link className="creator-handle" to={`/c/${encodeURIComponent(listing.creator.slug)}`}>@{listing.creator.slug}</Link>
        <h1>{listing.title}</h1>
        <p>{listing.description || listing.shortDescription || `A project by ${listing.creator.displayName}.`}</p>
        <DownloadLink className="button button-orange" />
      </div>
    </article>}
  </main>;
}
