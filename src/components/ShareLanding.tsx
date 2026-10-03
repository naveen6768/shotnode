import { ArrowUpRight, Clapperboard } from "lucide-react";
import Brand from "./Brand";
import DownloadLink from "./DownloadLink";

export default function ShareLanding({
  title,
  description,
  openIntent,
  error,
  slotCount,
}: {
  title: string;
  description: string;
  openIntent: string;
  error: string | null;
  slotCount?: number | null;
}) {
  return (
    <main className="share-page">
      <Brand />
      <section className="share-card">
        <span className="share-icon">
          <Clapperboard size={30} strokeWidth={1.4} />
        </span>
        <span className="eyebrow">A LITTLE CREATIVE COLLABORATION</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {slotCount != null && (
          <span className="share-slots">
            {slotCount === 1
              ? "1 editable clip"
              : `${slotCount} editable clips`}
          </span>
        )}
        {error && (
          <p className="share-error" role="alert">
            {error}. Please check your link or try again later.
          </p>
        )}
        <div className="share-actions">
          <a className="button button-orange" href={openIntent}>
            Open in ShotNode <ArrowUpRight size={16} />
          </a>
          <DownloadLink className="button button-outline" icon />
        </div>
        <span className="share-note">Your next great edit starts here.</span>
      </section>
      <span className="share-footer">Made for the way you create.</span>
    </main>
  );
}
