import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: ReactNode;
  description?: string;
  align?: "start" | "center";
  /** Set when the section behind this heading has a navy/dark background. */
  onDarkBackground?: boolean;
  className?: string;
  headingId?: string;
}

/**
 * The eyebrow + heading + description pattern repeated at the top of every
 * major section. `onDarkBackground` flips text colors for use on navy vs.
 * paper section backgrounds.
 */
export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "start",
  onDarkBackground = false,
  className,
  headingId,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const useInkText = !onDarkBackground;

  return (
    <div
      className={clsx(
        "max-w-2xl",
        isCenter && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-coral">
            <span aria-hidden="true" className="h-px w-6 bg-current" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          id={headingId}
          className={clsx(
            "text-balance text-3xl font-bold leading-[1.15] sm:text-4xl md:text-5xl",
            useInkText ? "text-ink" : "text-white",
          )}
        >
          {heading}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p
            className={clsx(
              "mt-5 text-pretty text-lg leading-relaxed",
              useInkText ? "text-ink/70" : "text-white/75",
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
