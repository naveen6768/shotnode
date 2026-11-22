/**
 * Editable project share link landing: https://shotnode.pro/l/{publicId}
 *
 * Never plays or previews the project in the browser. App Links open the ShotNode app directly
 * when installed. When the link lands here, this page sends the visitor to the intent URL
 * (Android, which retries the app and falls back to Play) or straight to the Play listing
 * (other platforms), with the listing id in the install referrer.
 */
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Brand from "../components/Brand";
import {
  buildListingIntentUrl,
  buildListingStoreUrl,
  isValidListingPublicId,
  PLAY_STORE_PACKAGE_URL,
} from "../lib/listingStoreLink";

export default function ProjectListingShareLanding() {
  const { publicId = "" } = useParams();
  const valid = isValidListingPublicId(publicId);
  const storeUrl = valid ? buildListingStoreUrl(publicId) : PLAY_STORE_PACKAGE_URL;
  const intentUrl = valid ? buildListingIntentUrl(publicId) : null;

  useEffect(() => {
    if (!valid) return;
    const isAndroid = /Android/i.test(navigator.userAgent);
    window.location.replace(isAndroid ? buildListingIntentUrl(publicId) : buildListingStoreUrl(publicId));
  }, [publicId, valid]);

  return (
    <main className="listing-share-page">
      <Brand />
      <section className="listing-share-card" aria-live="polite">
        {valid ? (
          <>
            <h1>Opening this project in ShotNode…</h1>
            <p className="listing-share-description">
              If nothing happens, use the buttons below.
            </p>
          </>
        ) : (
          <>
            <h1>This link is not valid</h1>
            <p className="listing-share-description">
              Get ShotNode on Google Play to start creating.
            </p>
          </>
        )}
        <div className="listing-share-actions">
          <a className="button button-orange" href={storeUrl}>
            Get ShotNode on Google Play <ArrowUpRight size={16} />
          </a>
        </div>
        {intentUrl && (
          <p className="listing-share-note">
            <a href={intentUrl}>Already installed? Open in the app</a>
          </p>
        )}
      </section>
    </main>
  );
}
