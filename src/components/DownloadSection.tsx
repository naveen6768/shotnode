import { Smartphone, Camera, Sparkles, Share2 } from "lucide-react";
import DownloadLink from "./DownloadLink";

export default function DownloadSection() {
  return (
    <section className="app-download section-space" id="download-section">
      <div className="container download-grid">
        <div>
          <span className="eyebrow">
            <span /> MADE FOR YOUR PHONE
          </span>
          <h2>
            Your creative studio.
            <br />
            <em>In your pocket.</em>
          </h2>
          <p>
            From the clips on your phone to a story you’re proud to share. Bring
            ShotNode along for your next idea.
          </p>
          <DownloadLink icon>Get it on Google Play</DownloadLink>
          <small>
            Available for Android. Visit Google Play for current app details and
            pricing.
          </small>
        </div>
        <div className="download-details">
          <span className="download-platform">
            <Smartphone size={22} /> ShotNode for Android
          </span>
          {[
            {
              icon: Camera,
              title: "Start with your camera roll",
              text: "Choose the moments you’ve already captured.",
            },
            {
              icon: Sparkles,
              title: "Find your creative direction",
              text: "Shape the mood, timing, and feel of your edit.",
            },
            {
              icon: Share2,
              title: "Take your story with you",
              text: "Create and share right from your phone.",
            },
          ].map((item) => (
            <div className="download-detail" key={item.title}>
              <item.icon size={20} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
