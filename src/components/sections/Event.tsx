import { Reveal } from "@/components/motion/Reveal";
import { HexField } from "@/components/motion/HexField";
import { SpinningBall } from "@/components/motion/SpinningBall";
import { HOME_COPY } from "@/lib/content";

const { heading, description, closing } = HOME_COPY.event;

/** The event itself: what visitors live through, over the live hexagon field. */
export function Event() {
  return (
    <section
      id="event"
      aria-labelledby="event-heading"
      className="manifesto has-hex scroll-mt-16"
    >
      <HexField />
      <SpinningBall className="manifesto-ball" />
      <div className="manifesto-stage">
        <div className="manifesto-copy">
          <p className="kora-label text-coral">الحدث</p>
          <h2 id="event-heading" className="mt-3">
            {heading.map((line, index) => (
              <Reveal
                key={line}
                as="span"
                delay={index * 0.12}
                className={`manifesto-line ${index === heading.length - 1 ? "manifesto-line-3" : ""}`}
              >
                {line}
              </Reveal>
            ))}
          </h2>

          {description.map((paragraph, index) => (
            <Reveal key={index} delay={0.25 + index * 0.1}>
              <p className="manifesto-body">{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.45} className="event-aside">
          <p className="event-closing">
            <span aria-hidden className="kora-pentagon" />
            {closing}
          </p>
          <div aria-hidden className="event-aside-marks">
            <i />
            <i />
            <i />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
