import { SOCIAL_LINKS } from "@/lib/constants";
import { MailLink } from "@/components/layout/MailLink";
import { InstagramIcon, TikTokIcon, XIcon, LinkedInIcon } from "@/components/ui/SocialIcons";

const APPS = [
  { href: SOCIAL_LINKS.instagram, label: "إنستغرام", accent: "fuchsia", Icon: InstagramIcon },
  { href: SOCIAL_LINKS.x, label: "إكس", accent: "green", Icon: XIcon },
  { href: SOCIAL_LINKS.tiktok, label: "تيك توك", accent: "coral", Icon: TikTokIcon },
  { href: SOCIAL_LINKS.linkedin, label: "لينكدإن",  accent: "fuchsia", Icon: LinkedInIcon },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <ul className="site-footer-apps">
        <li>
          <MailLink className="site-footer-app" />
        </li>
        {APPS.map(({ href, label, accent, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
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
