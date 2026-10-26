import { Container } from "@/components/ui/Container";
import { Mark } from "@/components/ui/Mark";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollWords } from "@/components/motion/ScrollWords";
import { AboutArt } from "@/components/sections/AboutArt";
import { HOME_COPY } from "@/lib/content";

const { heading, description } = HOME_COPY.hero;

/** The hero's story: its heading lights up word by word under the crest. */
export function HeroIntro() {
  return (
    <div id="hero-intro" className="about-section relative overflow-hidden border-t border-paper/15 bg-navy text-paper">
      <AboutArt trigger="#hero-intro" />
      <Container className="about-shell px-0 md:px-10">
        <div className="about-copy">
          <ScrollWords
            as="h1"
            id="hero-title"
            parts={[{ text: heading[0] }, { text: heading[1], className: "text-coral" }]}
          />
          <div className="about-copy-body">
            <Reveal>
              <p data-lead="true">{description[0]}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                <Mark>كـورة</Mark>
                {description[1].slice("كـورة".length)}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </div>
  );
}
