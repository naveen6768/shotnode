import { useState } from "react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
const items = [
  [
    "What is ShotNode?",
    "ShotNode is an AI-assisted video editing app for Android, designed to turn your footage and creative direction into an edit. Describe the mood and pacing, then refine the result to make it your own.",
  ],
  [
    "Where can I use it?",
    "ShotNode is currently available as an Android mobile app. Download it from Google Play to edit your own footage on your phone. This website introduces the app; it is not an online editor.",
  ],
  [
    "Do I need editing experience?",
    "You can start with your clips and a plain-language idea. The goal is to make the first cut easier, while keeping room for you to review and adjust the details.",
  ],
  [
    "Can I still control the final edit?",
    "Yes. AI helps with the groundwork; you decide the creative direction. Review your cut, adjust the timing and framing, and shape the story before you share it.",
  ],
  [
    "Is the preview on this page a real editor?",
    "It’s an interactive illustration of a mobile editing workflow, not a recording of the app. Switch example projects, play the sample timeline, and toggle captions or beat sync. It does not upload, process, or export your videos. Get the Android app to work with your own footage.",
  ],
  [
    "Where can I find app pricing?",
    "Check ShotNode’s Google Play listing and the app for current pricing and any available purchases. This website does not sell subscriptions or take payments.",
  ],
];
export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="faq-section section-space container" id="faq-section">
      <div className="faq-heading">
        <span className="eyebrow">
          <span /> GOOD QUESTIONS
        </span>
        <h2>
          A little
          <br />
          more <em>clarity.</em>
        </h2>
        <p>Something else on your mind?</p>
        <a className="text-link" href="mailto:contact@shotnode.pro">
          Talk to the team <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="faq-list">
        {items.map(([question, answer], index) => (
          <div className="faq-item" key={question}>
            <h3>
              <button
                aria-expanded={open === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                onClick={() => setOpen(open === index ? null : index)}
              >
                {question}
                {open === index ? <Minus size={17} /> : <Plus size={17} />}
              </button>
            </h3>
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              hidden={open !== index}
            >
              <p>{answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
