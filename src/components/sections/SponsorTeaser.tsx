import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SPONSOR_TEASER } from "@/lib/content";

const ACCENTS = ["bg-coral", "bg-fuchsia", "bg-green"] as const;

export function SponsorTeaser() {
  return (
    <section
      aria-labelledby="sponsor-teaser-heading"
      className="kora-grid relative border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container>
        <p className="kora-label text-coral">للشركات</p>
        <h2
          id="sponsor-teaser-heading"
          className="mt-3 max-w-2xl text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          لماذا ترعى كورة؟
        </h2>

        <Stagger
          as="ul"
          className="mt-12 grid border-t border-paper/15 md:grid-cols-3"
          gap={0.12}
        >
          {SPONSOR_TEASER.map((item, index) => (
            <StaggerItem
              as="li"
              key={item.number}
              className="flex min-h-56 flex-col gap-4 border-b border-s border-paper/15 bg-ink/40 p-7 md:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-widest text-paper/60">
                  {item.number}
                </span>
                <span
                  aria-hidden
                  className={clsx("kora-pentagon size-6", ACCENTS[index % ACCENTS.length])}
                />
              </div>
              <h3 className="mt-auto text-xl font-bold">{item.title}</h3>
              <p className="text-pretty leading-relaxed text-paper/72">{item.description}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10">
          <Button href="/partners" variant="primary">
            اعرف أكثر عن الشراكة
          </Button>
        </div>
      </Container>
    </section>
  );
}
