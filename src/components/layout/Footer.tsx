import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.15" cy="6.85" r="1.2" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82c-.98-.86-1.58-2.1-1.58-3.47h-3.14v13.7c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.28 0 .55.04.8.12V10.3a5.9 5.9 0 0 0-.8-.05 5.87 5.87 0 1 0 5.87 5.87V9.03a8.1 8.1 0 0 0 4.77 1.53V7.42a5.05 5.05 0 0 1-3.2-1.6z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5.25" width="18" height="13.5" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.2 7.2 12 12.6l7.8-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

const APPS = [
  { href: `mailto:${CONTACT_EMAIL}`, label: "البريد", accent: "coral", Icon: MailIcon, external: false },
  { href: SOCIAL_LINKS.instagram, label: "إنستغرام", accent: "fuchsia", Icon: InstagramIcon, external: true },
  { href: SOCIAL_LINKS.x, label: "إكس", accent: "green", Icon: XIcon, external: true },
  { href: SOCIAL_LINKS.tiktok, label: "تيك توك", accent: "coral", Icon: TikTokIcon, external: true },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <ul className="site-footer-apps">
        {APPS.map(({ href, label, accent, Icon, external }) => (
          <li key={label}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              aria-label={label}
              title={label}
              className="site-footer-app"
              data-accent={accent}
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
