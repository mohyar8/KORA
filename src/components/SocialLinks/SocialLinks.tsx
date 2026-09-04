import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { siteConfig } from "../../config/site";

const socialLinks = [
  {
    name: "instagram",
    href: siteConfig.socialLinks.instagram,
    heroLabel: "تابع كورة على إنستغرام",
    footerLabel: "حساب كورة على إنستغرام",
    Icon: SiInstagram,
  },
  {
    name: "x",
    href: siteConfig.socialLinks.x,
    heroLabel: "تابع كورة على منصة X",
    footerLabel: "حساب كورة على منصة X",
    Icon: SiX,
  },
  {
    name: "tiktok",
    href: siteConfig.socialLinks.tiktok,
    heroLabel: "تابع كورة على تيك توك",
    footerLabel: "حساب كورة على تيك توك",
    Icon: SiTiktok,
  },
] as const;

interface SocialLinksProps {
  readonly className?: string;
  readonly location?: "hero" | "footer";
}

export function SocialLinks({ className, location = "footer" }: SocialLinksProps) {
  return (
    <nav
      className={["social-links", className].filter(Boolean).join(" ")}
      aria-label="حسابات كورة الاجتماعية"
    >
      {socialLinks.map(({ name, href, heroLabel, footerLabel, Icon }) => (
        <a
          key={name}
          href={href}
          data-platform={name}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={location === "hero" ? heroLabel : footerLabel}
        >
          <Icon aria-hidden="true" focusable="false" />
        </a>
      ))}
    </nav>
  );
}
