"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { SocialPentagons } from "@/components/ui/SocialIcons";

/** "تابعنا": opens KORA's official social accounts — visitors get no form. */
export function FollowButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 font-bold text-paper underline-offset-4 hover:text-coral hover:underline"
      >
        {label}
        <ChevronDown
          aria-hidden
          className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <SocialPentagons className="final-cta-socials participate-socials mt-4" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
