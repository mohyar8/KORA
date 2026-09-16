import { clsx } from "clsx";
import type { Track } from "@/lib/content";
import { ACCENT_STYLES } from "@/lib/accent";

export function TrackCard({ track, className }: { track: Track; className?: string }) {
  const accent = ACCENT_STYLES[track.accent];
  const Icon = track.icon;

  return (
    <article
      className={clsx(
        "kora-stripes relative flex h-[32rem] flex-col justify-between overflow-hidden border border-paper/15 bg-navy-dark p-8 text-paper",
        className,
      )}
    >
      <div aria-hidden className={clsx("kora-pentagon absolute -end-20 -bottom-16 size-64 opacity-35", accent.bg)} />
      <div>
        <div className="flex items-start justify-between gap-4">
          <span
            aria-hidden="true"
            className="kora-label text-paper/55"
          >
            T/{track.number}
          </span>
          <span
            className={clsx(
              "kora-pentagon grid size-11 shrink-0 place-items-center bg-paper/10",
              accent.text,
            )}
          >
            <Icon aria-hidden className="size-6" />
          </span>
        </div>

        <h3 className="mt-28 text-3xl font-bold text-paper">{track.title}</h3>
        <p className="relative mt-5 text-pretty leading-8 text-paper/65">
          {track.description}
        </p>
      </div>

      <span
        aria-hidden="true"
        className={clsx("relative mt-8 block h-1 w-14", accent.bg)}
      />
    </article>
  );
}
