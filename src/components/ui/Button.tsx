import { clsx } from "clsx";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  showArrow?: boolean;
}

const base =
  "group kora-cut relative inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-bold transition-colors duration-300 focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  primary: "bg-coral text-white hover:bg-paper hover:text-ink active:bg-[#dddccc]",
  secondary:
    "border border-white/30 text-white hover:border-coral hover:text-coral",
  ghost: "border border-navy/20 text-navy hover:border-navy hover:bg-navy/5",
};

/**
 * Shared CTA button. `href` is required — every button on this site either
 * navigates to the external application form or scrolls to an in-page
 * anchor; there is no submit-style button since there is no backend.
 */
export function Button({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
  ...rest
}: ButtonProps) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      className={clsx(base, variants[variant], className)}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...rest}
    >
      <span>{children}</span>
      {showArrow && (
        <ArrowLeft
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
        />
      )}
    </Link>
  );
}
