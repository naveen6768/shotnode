import { ArrowUpRight } from "lucide-react";
import { affiliations } from "../data/affiliations";

export default function Affiliations({ about = false }: { about?: boolean }) {
  return (
    <section
      className={`affiliations container${about ? " affiliations-about" : ""}`}
      aria-labelledby={about ? "about-affiliations-title" : "affiliations-title"}
    >
      <div className="affiliations-intro">
        <span className="eyebrow"><span /> RECOGNITION & PROGRAMS</span>
        <h2 id={about ? "about-affiliations-title" : "affiliations-title"}>
          {about ? "Growing with good company." : "A strong start, together."}
        </h2>
        <p>
          ShotNode is part of these startup programs and is recognized under the
          Startup India initiative. Each organization has its own role in our journey.
        </p>
      </div>
      <div className="affiliations-grid">
        {affiliations.map((item) => (
          <a
            className="affiliation-card"
            href={item.href}
            key={item.name}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.name} — ${item.relationship} (opens in a new tab)`}
          >
            <div className="affiliation-logo-wrap">
              <img className={item.className} src={item.logo} alt={item.logoAlt} loading="lazy" />
            </div>
            <div className="affiliation-card-copy">
              <strong>{item.name}</strong>
              <span>{item.relationship}</span>
            </div>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
