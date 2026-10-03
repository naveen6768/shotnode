import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clapperboard,
  Crop,
  Film,
  Instagram,
  Music2,
  Play,
  Scissors,
  Sparkles,
  Upload,
  Youtube,
} from "lucide-react";
import EditorPreview from "../components/EditorPreview";
import DownloadSection from "../components/DownloadSection";
import DownloadLink from "../components/DownloadLink";
import FAQAccordion from "../components/FAQAccordion";

export default function HomePage() {
  return (
    <>
      <section className="hero container">
        <a className="announcement" href="#product-demo">
          <span className="orange-dot" /> Your creative copilot. Now on Android.{" "}
          <ArrowRight size={13} />
        </a>
        <h1>
          Your vision.
          <br />
          Already in <em>motion.</em>
          <span className="hero-asterisk" aria-hidden="true">
            ✳
          </span>
        </h1>
        <p className="hero-description">
          The AI video editor built for your phone.
          <br className="desktop-break" /> Turn your clips into stories worth
          watching, wherever inspiration finds you.
        </p>
        <div className="hero-actions">
          <DownloadLink icon>Get the Android app</DownloadLink>
          <a className="button button-outline" href="#product-demo">
            <Play size={14} /> Explore the app
          </a>
        </div>
        <div className="hero-note">
          <span /> Available on Android{" "}
          <span className="note-separator">/</span> Create right on your phone
        </div>
        <EditorPreview />
      </section>
      <section
        className="platform-strip container"
        aria-label="Create for your favorite platforms"
      >
        <p>
          FROM YOUR CAMERA ROLL.
          <br />
          <strong>TO EVERYWHERE YOU CREATE.</strong>
        </p>
        <div>
          <span>
            <Instagram /> Instagram
          </span>
          <span>
            <Youtube /> YouTube
          </span>
          <span>
            <Music2 /> TikTok
          </span>
          <span>
            <Film /> Your next big thing
          </span>
        </div>
      </section>
      <section
        className="features-section section-space container"
        id="features-section"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <span /> LESS BUSYWORK. MORE BRILLIANT.
            </span>
            <h2>
              The idea is yours.
              <br />
              The heavy lifting is <em>ours.</em>
            </h2>
          </div>
          <p>
            Great videos start with a point of view.
            <br />
            Keep yours. Let ShotNode take care of
            <br className="desktop-break" /> the cuts, the timing, and the tiny
            details.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card feature-prompt">
            <div className="feature-card-copy">
              <span className="feature-number">01 / JUST ASK</span>
              <h3>
                If you can say it,
                <br />
                you can edit it.
              </h3>
              <p>
                Describe the mood, the pace, the story.
                <br />
                Turn your creative direction into a first cut.
              </p>
            </div>
            <div className="prompt-illustration">
              <div className="floating-prompt">
                <Sparkles size={18} />
                <span>“Make it feel like an endless summer.”</span>
                <span className="prompt-enter">
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <div className="prompt-result">
                <img
                  src="/images/coast.jpg"
                  loading="lazy"
                  alt="Colorful Italian coastal village used in an example travel edit"
                />
                <div>
                  <span>
                    <Check size={12} /> Creative direction applied
                  </span>
                  <strong>
                    Less explaining.
                    <br />
                    More creating.
                  </strong>
                </div>
              </div>
            </div>
          </article>
          <article className="feature-card feature-beat">
            <div className="feature-card-copy">
              <span className="feature-number">02 / FIND YOUR RHYTHM</span>
              <h3>
                Good cuts.
                <br />
                Great timing.
              </h3>
              <p>
                Let your footage move with the music.
                <br />
                Match every cut to the moments that matter.
              </p>
            </div>
            <div className="beat-illustration">
              <div className="beat-clips">
                {["coast", "beach", "mountains", "coast"].map((name, i) => (
                  <img
                    key={i}
                    src={`/images/${name}.jpg`}
                    loading="lazy"
                    alt=""
                  />
                ))}
              </div>
              <div className="beat-wave" aria-hidden="true">
                {Array.from({ length: 65 }, (_, i) => (
                  <i key={i} style={{ height: `${8 + ((i * 19) % 44)}px` }} />
                ))}
              </div>
              <span className="beat-marker" />
              <div className="beat-label">
                <Music2 size={13} /> In perfect sync <span>120 BPM</span>
              </div>
            </div>
          </article>
          <article className="feature-card feature-reframe">
            <div className="reframe-illustration">
              <img
                src="/images/mountains.jpg"
                loading="lazy"
                alt="Mountain landscape demonstrating a vertical crop inside a wide shot"
              />
              <div className="crop-frame">
                <span>9:16</span>
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="landscape-label">16:9</span>
            </div>
            <div className="feature-card-copy">
              <span className="feature-number">03 / EVERY FORMAT, COVERED</span>
              <h3>
                One story.
                <br />
                Every screen.
              </h3>
              <p>
                Reframe for the feed, the story, or the big screen. Keep the
                subject in focus and your vision intact.
              </p>
              <div className="format-chips">
                <span>9:16</span>
                <span>1:1</span>
                <span>16:9</span>
              </div>
            </div>
          </article>
        </div>
        <div className="feature-footnote">
          <span>
            <Scissors size={15} /> Intelligent cuts
          </span>
          <span>
            <Music2 size={15} /> Beat sync
          </span>
          <span>
            <Crop size={15} /> Smart reframe
          </span>
          <span>
            <Sparkles size={15} /> Creative control
          </span>
        </div>
      </section>
      <section className="workflow-section" id="tools-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span /> FROM “WHAT IF” TO “THAT’S IT”
              </span>
              <h2>
                Three steps.
                <br />
                Infinite <em>possibilities.</em>
              </h2>
            </div>
            <a className="text-link" href="#product-demo">
              Try the interactive preview <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="workflow-grid">
            {[
              {
                number: "01",
                icon: Upload,
                title: "Pick your clips.",
                description:
                  "Open ShotNode on your phone and choose clips from your gallery. Start with the moments you’ve already captured.",
              },
              {
                number: "02",
                icon: Sparkles,
                title: "Tell us what you see.",
                description:
                  "A cinematic montage? A punchy product reel? Describe your direction in your own words.",
              },
              {
                number: "03",
                icon: Clapperboard,
                title: "Make it yours. Share it.",
                description:
                  "Review your edit, fine-tune the details, and share your story from your phone.",
              },
            ].map((step) => (
              <article key={step.number}>
                <div className="step-top">
                  <span>{step.number}</span>
                  <step.icon size={24} strokeWidth={1.5} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="creative-section container section-space">
        <div className="creative-visual">
          <img
            src="/images/beach.jpg"
            loading="lazy"
            alt="Quiet seaside escape at golden hour"
          />
          <span className="creative-overline">THE WORLD IS YOUR B-ROLL.</span>
          <p>
            Go live
            <br />a little.
            <em>
              We’ll handle
              <br />
              the edit.
            </em>
          </p>
          <span className="creative-sticker">
            <Sparkles size={17} /> Made with a little help.
          </span>
        </div>
        <div className="creative-copy">
          <span className="eyebrow">
            <span /> BUILT AROUND YOU
          </span>
          <h2>
            More time
            <br />
            on the other side
            <br />
            of the <em>camera.</em>
          </h2>
          <p>
            You didn’t start creating to spend your evenings moving clips around
            a timeline. Shoot, edit, and share from the same phone, then get
            back to the part you love.
          </p>
          <div className="audience-list">
            <div>
              <span>For creators</span>
              <p>Keep up with your ideas, not your editing backlog.</p>
            </div>
            <div>
              <span>For brands</span>
              <p>Turn everyday footage into your next story.</p>
            </div>
            <div>
              <span>For everyone with a story</span>
              <p>Start with an idea. Find your own way to tell it.</p>
            </div>
          </div>
          <DownloadLink className="text-link">
            Create on your phone
          </DownloadLink>
        </div>
      </section>
      <DownloadSection />
      <FAQAccordion />
      <section className="final-cta container">
        <div className="cta-top">
          <span className="eyebrow">LESS TIMELINE. MORE LIFETIME.</span>
          <ArrowDown size={22} />
        </div>
        <h2>
          Your next great video
          <br />
          starts on <em>your phone.</em>
        </h2>
        <div className="cta-bottom">
          <p>Your camera roll. Your next story. One app.</p>
          <DownloadLink className="button button-dark" icon>
            Get it on Google Play
          </DownloadLink>
        </div>
        <span className="cta-decoration" aria-hidden="true">
          ✳
        </span>
      </section>
    </>
  );
}
