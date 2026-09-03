import { siteConfig } from "../../config/site";
import lightLogo from "../../assets/brand/logos/logo_0_transparent_HQ.svg";
import { BrandName } from "../BrandName/BrandName";
import { SocialLinks } from "../SocialLinks/SocialLinks";

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
        <SocialLinks />
      </div>
      <div className="container footer-bottom">
        <span>© 2026 <BrandName /></span>
        <span>جامعة الملك فهد للبترول والمعادن</span>
      </div>
    </footer>
  );
}
