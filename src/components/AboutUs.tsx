import { ArrowUpRight, Compass, Heart, Sparkles } from "lucide-react";
import DownloadLink from "./DownloadLink";
import Affiliations from "./Affiliations";
export default function AboutUs() {
  return (
    <div className="about-page container">
      <span className="eyebrow">
        <span /> THE STORY BEHIND SHOTNODE
      </span>
      <h1>
        More creating.
        <br />
        Less <em>getting in the way.</em>
      </h1>
      <p className="about-intro">
        We believe the distance between a good idea and a great video should be
        a little shorter.
      </p>
      <div className="about-photo">
        <img
          src="/images/coast.jpg"
          alt="Colorful houses on the Italian coast, inspiration for a travel story"
        />
        <span>Every great story starts somewhere.</span>
      </div>
      <div className="about-story">
        <h2>
          Built for the
          <br />
          <em>creative part.</em>
        </h2>
        <div>
          <p>
            ShotNode started with a familiar frustration: a camera roll full of
            moments, an idea worth sharing, and too much time spent on the
            timeline.
          </p>
          <p>
            We’re building a mobile editor for Android that understands creative
            direction in everyday language. One that helps with the cuts, the
            rhythm, and the framing, so you can shoot, edit, and share from your
            phone.
          </p>
          <p>
            ShotNode is a product of SECONDBRAIN VENTURES PRIVATE LIMITED, based
            in Noida, India.
          </p>
        </div>
      </div>
      <div className="about-values">
        {[
          {
            icon: Compass,
            title: "Your vision comes first.",
            text: "Tools should follow your creative direction and leave you room to make the work your own.",
          },
          {
            icon: Sparkles,
            title: "Make the hard parts easier.",
            text: "Thoughtful automation should clear a path from raw footage to a first cut.",
          },
          {
            icon: Heart,
            title: "Keep the creator at the center.",
            text: "We’re building around the people who have something to say, whatever their experience.",
          },
        ].map((item) => (
          <article key={item.title}>
            <item.icon size={24} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <Affiliations about />
      <div className="about-contact">
        <div>
          <span className="eyebrow">FIND US</span>
          <h3>SECONDBRAIN VENTURES PRIVATE LIMITED</h3>
          <p>
            Seat BS2T4, H-1A/20, Sector 63
            <br />
            Noida, Uttar Pradesh – 201301, India
          </p>
          <a className="text-link" href="mailto:contact@shotnode.pro">
            contact@shotnode.pro <ArrowUpRight size={16} />
          </a>
        </div>
        <DownloadLink icon />
      </div>
    </div>
  );
}
