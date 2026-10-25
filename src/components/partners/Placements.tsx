import { clsx } from "clsx";
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/Container";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ACCENT_STYLES } from "@/lib/accent";
import { PARTNERSHIP_FORMS, TRACKS } from "@/lib/content";

export function Placements() {
  return (
    <section
      aria-labelledby="placements-heading"
      className="border-t border-paper/15 bg-navy-dark py-16 md:py-24"
    >
      <Container>
        <h2
          id="placements-heading"
          className="text-balance text-3xl font-bold leading-[1.2] sm:text-4xl md:text-5xl"
        >
          أين تظهر علامتك؟
        </h2>
        <p className="mt-4 text-lg text-paper/70">تسعة مسارات، ولكل مسار جمهوره وقطاعاته.</p>

        <Stagger as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
          {TRACKS.map((track) => {
            const accent = ACCENT_STYLES[track.accent];
            const Icon = track.icon;
            return (
              <StaggerItem
                as="li"
                key={track.number}
                className="kora-card group flex flex-col gap-4 border border-paper/15 bg-ink/60 p-6"
                style={{ "--accent": `var(--color-${track.accent})` } as CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <span className={clsx("kora-pentagon grid size-11 place-items-center transition-transform duration-700 group-hover:rotate-[72deg]", accent.softBg)}>
                    <Icon aria-hidden className={clsx("size-5", accent.text)} />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-paper/45">
                    {track.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{track.title}</h3>
                <ul className="mt-auto flex flex-wrap gap-2" aria-label="القطاعات المناسبة">
                  {track.sectors.map((sector) => (
                    <li
                      key={sector}
                      className="border border-paper/16 px-2.5 py-1.5 text-xs font-semibold text-paper/78"
                    >
                      {sector}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            );
          })}
        </Stagger>

        <h3 className="mt-16 text-2xl font-bold md:text-3xl">أشكال الشراكة</h3>
        <ul className="mt-6 grid border-t border-paper/15 md:grid-cols-2 lg:grid-cols-3">
          {PARTNERSHIP_FORMS.map((form) => (
            <li key={form.slug} className="kora-card border-b border-s border-paper/15 p-6 hover:bg-paper/5">
              <p className="font-bold">{form.title}</p>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-paper/70">
                {form.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
