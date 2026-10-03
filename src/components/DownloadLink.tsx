import type { ReactNode } from "react";
import { ArrowUpRight, Smartphone } from "lucide-react";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.shotnode.app";

export default function DownloadLink({
  className = "button button-orange",
  children = "Get the Android app",
  icon = false,
}: {
  className?: string;
  children?: ReactNode;
  icon?: boolean;
}) {
  return (
    <a
      className={className}
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noreferrer"
    >
      {icon && <Smartphone size={17} />}
      {children}
      <ArrowUpRight size={16} />
    </a>
  );
}
