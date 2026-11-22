/**
 * Pure helpers for the /l/{publicId} share redirect. Kept free of React and DOM imports so the
 * unit test can run under plain Node.
 *
 * The Play base URL is the package URL without a referrer. DownloadLink's PLAY_STORE_URL already
 * carries a site_download referrer, and appending a second `referrer` param would give Play two
 * values, so the listing referrer replaces it here.
 */

export const PLAY_STORE_PACKAGE_URL = "https://play.google.com/store/apps/details?id=com.shotnode.app";

export const LISTING_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export function isValidListingPublicId(publicId: string): boolean {
  return LISTING_ID_PATTERN.test(publicId);
}

/** Play listing URL whose install referrer carries the listing id for post-install deep linking. */
export function buildListingStoreUrl(publicId: string): string {
  const referrer = `shotnode_listing=${publicId}&utm_source=share&utm_medium=listing_link&utm_campaign=project_link`;
  // PLAY_STORE_PACKAGE_URL already has ?id=, so the referrer is always appended with '&'.
  return `${PLAY_STORE_PACKAGE_URL}&referrer=${encodeURIComponent(referrer)}`;
}

/** Android intent URL that opens the installed app, falling back to the Play listing URL. */
export function buildListingIntentUrl(publicId: string): string {
  const fallback = encodeURIComponent(buildListingStoreUrl(publicId));
  return `intent://l/${encodeURIComponent(publicId)}#Intent;scheme=shotnode;package=com.shotnode.app;S.browser_fallback_url=${fallback};end`;
}
