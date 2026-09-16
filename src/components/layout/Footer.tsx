import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/constants";
import { InstagramIcon, TikTokIcon, XIcon } from "@/components/ui/SocialIcons";

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
