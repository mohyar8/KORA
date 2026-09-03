import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { siteConfig } from "../../config/site";

const socialLinks = [
  {
    name: "instagram",
    href: siteConfig.socialLinks.instagram,
    headerLabel: "Instagram",
    footerLabel: "حساب كورة على إنستغرام",
    Icon: SiInstagram,
  },
  {
    name: "x",
    href: siteConfig.socialLinks.x,
    headerLabel: "X",
    footerLabel: "حساب كورة على منصة X",
    Icon: SiX,
  },
  {
    name: "tiktok",
    href: siteConfig.socialLinks.tiktok,
    headerLabel: "TikTok",
    footerLabel: "حساب كورة على تيك توك",
    Icon: SiTiktok,
  },
] as const;

interface SocialLinksProps {
  readonly className?: string;
  readonly location?: "header" | "footer";
}

export function SocialLinks({ className, location = "footer" }: SocialLinksProps) {
  return (
    <nav
      className={["social-links", className].filter(Boolean).join(" ")}
      aria-label="حسابات كورة الاجتماعية"
    >
      {socialLinks.map(({ name, href, headerLabel, footerLabel, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={location === "header" ? headerLabel : footerLabel}
        >
          <Icon aria-hidden="true" focusable="false" />
        </a>
      ))}
    </nav>
  );
}
