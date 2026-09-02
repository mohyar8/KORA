import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { siteConfig } from "../../config/site";
import lightLogo from "../../assets/brand/logos/logo_0_transparent_HQ.svg";
import { BrandName } from "../BrandName/BrandName";

const socialLinks = [
  { name: "instagram", href: siteConfig.socialLinks.instagram, label: "حساب كورة على إنستغرام", Icon: SiInstagram },
  { name: "x", href: siteConfig.socialLinks.x, label: "حساب كورة على منصة X", Icon: SiX },
  { name: "tiktok", href: siteConfig.socialLinks.tiktok, label: "حساب كورة على تيك توك", Icon: SiTiktok },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img
            className="footer-logo"
            src={lightLogo}
            alt="شعار كورة"
            width="62"
            height="62"
            loading="lazy"
            decoding="async"
          />
          <span>{siteConfig.arabicTagline}</span>
        </div>
        <div className="footer-contact">
          <span>للتواصل</span>
          <a href={`mailto:${siteConfig.contactEmail}`} dir="ltr">{siteConfig.contactEmail}</a>
        </div>
        <div className="social-links" aria-label="حسابات كورة الاجتماعية">
          {socialLinks.map(({ name, href, label, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon aria-hidden="true" focusable="false" />
            </a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 <BrandName /></span>
        <span>جامعة الملك فهد للبترول والمعادن</span>
      </div>
    </footer>
  );
}
