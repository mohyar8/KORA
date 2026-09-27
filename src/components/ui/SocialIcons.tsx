import { SOCIAL_LINKS } from "@/lib/constants";

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.15" cy="6.85" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.98-.86-1.58-2.1-1.58-3.47h-3.14v13.7c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.28 0 .55.04.8.12V10.3a5.9 5.9 0 0 0-.8-.05 5.87 5.87 0 1 0 5.87 5.87V9.03a8.1 8.1 0 0 0 4.77 1.53V7.42a5.05 5.05 0 0 1-3.2-1.6z" />
    </svg>
  );
}

export function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.37 3.02A2.37 2.37 0 1 1 5.37 7.76a2.37 2.37 0 0 1 0-4.74ZM3.33 9.67h4.08V21.75H3.33V9.67Zm6.64 0h3.91v1.65h.06c.54-1.03 1.88-2.12 3.87-2.12 4.14 0 4.91 2.73 4.91 6.28v6.27h-4.08v-5.56c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.66h-4.08V9.67Z" />
    </svg>
  );
}

export const SOCIAL_NETWORKS = [
  { href: SOCIAL_LINKS.instagram, label: "إنستغرام", Icon: InstagramIcon, accent: "fuchsia" },
  { href: SOCIAL_LINKS.x, label: "إكس", Icon: XIcon, accent: "green" },
  { href: SOCIAL_LINKS.tiktok, label: "تيك توك", Icon: TikTokIcon, accent: "coral" },
  { href: SOCIAL_LINKS.linkedin, label: "لينكدإن", Icon: LinkedInIcon, accent: "fuchsia" },
] as const;
