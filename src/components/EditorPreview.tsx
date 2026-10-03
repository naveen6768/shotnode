import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Smartphone,
  Sparkles,
  Subtitles,
} from "lucide-react";

const projects = [
  {
    name: "A summer in Italy",
    label: "Travel reel",
    image: "/images/coast.jpg",
    title: "Somewhere",
    subtitle: "you’d rather be.",
    prompt: "Make this travel reel feel like an endless summer.",
  },
  {
    name: "The slow weekend",
    label: "Lifestyle",
    image: "/images/beach.jpg",
    title: "Take it",
    subtitle: "a little slower.",
    prompt: "Give my weekend clips a warm, relaxed feel.",
  },
  {
    name: "Beyond the everyday",
    label: "Adventure",
    image: "/images/mountains.jpg",
    title: "Find your",
    subtitle: "next adventure.",
    prompt: "Make this mountain adventure feel cinematic.",
  },
];

export default function EditorPreview() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [beatSync, setBeatSync] = useState(true);
  const [prompt, setPrompt] = useState(projects[0].prompt);
  const [applied, setApplied] = useState(false);
  const project = projects[selected];
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setTime((value) => (value + 1) % 31),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  return (
    <section
      id="product-demo"
      className="mobile-showcase"
      aria-label="Illustrative mobile editing preview"
    >
      <div className="mobile-showcase-copy">
        <span className="eyebrow">
          <span /> BIG IDEAS. POCKET-SIZED STUDIO.
        </span>
        <h2>
          Made for the
          <br />
          way you <em>move.</em>
        </h2>
        <p>
          Your footage is already on your phone.
          <br />
          Now your creative studio is, too.
        </p>
        <div
          className="mobile-demo-tabs"
          role="group"
          aria-label="Example projects"
        >
          {projects.map((item, index) => (
            <button
              key={item.label}
              aria-pressed={selected === index}
              onClick={() => {
                setSelected(index);
                setPrompt(item.prompt);
                setTime(0);
                setPlaying(false);
                setApplied(false);
              }}
            >
              {item.label}
              {selected === index && <Check size={13} />}
            </button>
          ))}
        </div>
        <div className="mobile-demo-caption">
          <Smartphone size={15} />
          <span>
            Interactive illustration of mobile editing.
            <br />
            Not an app screenshot or a working video editor.
          </span>
        </div>
      </div>
      <div className="phone-stage">
        <div className="phone-frame">
          <div className="phone-camera" aria-hidden="true" />
          <div className="phone-project">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{project.name}</span>
            <span className="phone-example">DEMO</span>
          </div>
          <div
            className={`phone-video ${playing ? "phone-playing" : ""}`}
            style={{ backgroundImage: `url(${project.image})` }}
          >
            <span className="phone-video-overline">A SHOTNODE STORY</span>
            {captions && (
              <div className="phone-video-title">
                {project.title}
                <br />
                <em>{project.subtitle}</em>
              </div>
            )}
            <span className="phone-video-footer">
              LITTLE MOMENTS. YOUR STORY.
            </span>
          </div>
          <div className="phone-playback">
            <span>
              00:{String(time).padStart(2, "0")} <small>/ 00:30</small>
            </span>
            <button
              aria-label={playing ? "Pause preview" : "Play preview"}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? (
                <Pause size={15} fill="currentColor" />
              ) : (
                <Play size={15} fill="currentColor" />
              )}
            </button>
            <button
              aria-label="Restart preview"
              onClick={() => {
                setTime(0);
                setPlaying(false);
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <div className="phone-timeline">
            <div className="phone-clips">
              {[0, 1, 2, 0, 1, 2].map((offset, index) => (
                <div
                  key={index}
                  style={{
                    backgroundImage: `url(${projects[(selected + offset) % 3].image})`,
                  }}
                />
              ))}
            </div>
            <div
              className={`phone-wave ${beatSync ? "" : "is-muted"}`}
              aria-hidden="true"
            >
              {Array.from({ length: 55 }, (_, i) => (
                <i key={i} style={{ height: `${4 + ((i * 13) % 17)}px` }} />
              ))}
            </div>
            <div
              className="phone-playhead"
              style={{ left: `${(time / 30) * 100}%` }}
            />
          </div>
          <div className="phone-tools">
            <button
              aria-pressed={beatSync}
              onClick={() => setBeatSync(!beatSync)}
            >
              <Music2 size={14} />
              Beat sync<span>{beatSync ? "On" : "Off"}</span>
            </button>
            <button
              aria-pressed={captions}
              onClick={() => setCaptions(!captions)}
            >
              <Subtitles size={14} />
              Captions<span>{captions ? "On" : "Off"}</span>
            </button>
          </div>
          <form
            className="phone-prompt"
            onSubmit={(event) => {
              event.preventDefault();
              if (!prompt.trim()) return;
              setCaptions(!/no captions|remove captions/i.test(prompt));
              setBeatSync(!/no beat|disable beat/i.test(prompt));
              setApplied(true);
            }}
          >
            <label htmlFor="demo-prompt">
              <Sparkles size={13} /> Describe your edit
            </label>
            <div>
              <input
                id="demo-prompt"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  setApplied(false);
                }}
              />
              <button aria-label="Apply demo prompt" disabled={!prompt.trim()}>
                <ArrowUp size={16} />
              </button>
            </div>
            <span className="phone-prompt-status" role="status">
              {applied
                ? "Preview updated. Make it your own."
                : "Try “remove captions” in this demo."}
            </span>
          </form>
          <div className="phone-home-indicator" aria-hidden="true" />
        </div>
        <div className="phone-floating-note">
          <Sparkles size={17} />
          <span>
            Your next story.
            <br />
            <strong>Right at your fingertips.</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
