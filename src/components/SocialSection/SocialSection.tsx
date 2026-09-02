import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { siteConfig } from "../../config/site";
import { BrandName } from "../BrandName/BrandName";

const socialAccounts = [
  {
    id: "instagram",
    platform: "إنستغرام",
    handle: "@kora_kfupm",
    href: siteConfig.socialLinks.instagram,
    label: "تابع كورة على إنستغرام",
    accent: "fuchsia",
    Icon: SiInstagram,
  },
  {
    id: "x",
    platform: "منصة X",
    handle: "@KORA_KFUPM",
    href: siteConfig.socialLinks.x,
    label: "تابع كورة على منصة X",
    accent: "green",
    Icon: SiX,
  },
  {
    id: "tiktok",
    platform: "تيك توك",
    handle: "@kfupm_kora",
    href: siteConfig.socialLinks.tiktok,
    label: "تابع كورة على تيك توك",
    accent: "coral",
    Icon: SiTiktok,
  },
] as const;

export function SocialSection() {
  return (
    <section className="social-section" aria-labelledby="social-title">
      <div className="container social-grid">
        <div className="section-heading social-heading">
          <p className="eyebrow">ابقَ قريبًا</p>
          <h2 id="social-title">
            تابع <BrandName /> وكن أول من يعرف
          </h2>
          <p>
            تابع حساباتنا لتصلك مواعيد فتح التقديم، وتعريفات فرق العمل، وآخر تحديثات الحدث.
          </p>
        </div>

        <div className="social-accounts" aria-label="حسابات كورة الاجتماعية">
          {socialAccounts.map(({ id, platform, handle, href, label, accent, Icon }) => (
            <a
              className={`social-account social-account--${accent}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              key={id}
            >
              <span className="social-account-icon" aria-hidden="true">
                <Icon focusable="false" />
              </span>
              <span className="social-account-copy">
                <strong>{platform}</strong>
                <span dir="ltr">{handle}</span>
              </span>
              <span className="social-account-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
