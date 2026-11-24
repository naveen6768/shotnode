import type { ReactNode } from "react";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { trackEvent } from "../lib/analytics";

const PLAY_STORE_PACKAGE_URL = "https://play.google.com/store/apps/details?id=com.shotnode.app";

export const DEFAULT_PLAY_CAMPAIGN = "site_download";

/** Keeps only [a-z0-9_] so a campaign can never inject URL or tracking noise. */
export function playCampaignName(campaign: string = DEFAULT_PLAY_CAMPAIGN): string {
  return campaign.replace(/[^a-z0-9_]/gi, "").toLowerCase().slice(0, 40) || DEFAULT_PLAY_CAMPAIGN;
}

/** Play Store link carrying a web install referrer, so website installs can be told apart in Play and Firebase. */
export function playStoreUrl(campaign: string = DEFAULT_PLAY_CAMPAIGN): string {
  const referrer = `utm_source=web&utm_medium=organic&utm_campaign=${playCampaignName(campaign)}`;
  return `${PLAY_STORE_PACKAGE_URL}&referrer=${encodeURIComponent(referrer)}`;
}

/** Shared default link (site_download campaign). Used by the intent-fallback landings too. */
export const PLAY_STORE_URL = playStoreUrl();

export default function DownloadLink({
  className = "button button-orange",
  children = "Get the Android app",
  icon = false,
  campaign = DEFAULT_PLAY_CAMPAIGN,
}: {
  className?: string;
  children?: ReactNode;
  icon?: boolean;
  /** Labels this placement in the install referrer and in the click_play_store event. */
  campaign?: string;
}) {
  const name = playCampaignName(campaign);
  return (
    <a
      className={className}
      href={playStoreUrl(name)}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackEvent("click_play_store", { campaign: name })}
    >
      {icon && <Smartphone size={17} />}
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}
