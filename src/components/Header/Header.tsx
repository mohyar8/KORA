import { useEffect, useRef, useState } from "react";
import { ApplicationAction } from "../ApplicationAction/ApplicationAction";
import lightLogo from "../../assets/brand/logos/logo_0_transparent_HQ.svg";

const navigationItems = [
  { href: "#about", label: "عن كورة" },
  { href: "#benefits", label: "لماذا تنضم؟" },
  { href: "#teams", label: "فرق العمل" },
] as const;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand-wordmark" href="#top" aria-label="كورة — العودة إلى بداية الصفحة">
          <img
            className="brand-logo"
            src={lightLogo}
            alt="شعار كورة"
            width="65"
            height="65"
            decoding="async"
          />
        </a>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <ApplicationAction className="application-action--header" />
        </nav>

        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="sr-only">{isOpen ? "إغلاق القائمة" : "فتح القائمة"}</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="التنقل الرئيسي للجوال">
          <ul className="container">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <ApplicationAction className="application-action--mobile-nav" />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
