import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { brandFont } from "@/lib/fonts";
import { BRAND, EVENT, SITE_URL, SOCIAL_LINKS } from "@/lib/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const title = `${BRAND.name} | ${BRAND.nameAr} — ${BRAND.taglineAr}`;
const description =
  "كورة: الصناعة خلف اللعبة. حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يستكشف كرة القدم السعودية بوصفها صناعة متكاملة، عبر تسعة مسارات من المتحف التاريخي إلى التقنية والاستثمار.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title,
  description,
  keywords: [
    "كورة",
    "KORA",
    "جامعة الملك فهد للبترول والمعادن",
    "كرة القدم السعودية",
    "KFUPM",
    "الصناعة خلف اللعبة",
  ],
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: BRAND.name,
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  other: {
    "event:dates": EVENT.dates,
    "event:venue": EVENT.venueShort,
  },
};

/** Tells Google which logo and site name belong to KORA. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: `${BRAND.name} | ${BRAND.nameAr}`,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/brand/kora-logo-card.png`,
  sameAs: Object.values(SOCIAL_LINKS),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C1233",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={brandFont.variable}>
      <body className="min-h-svh bg-ink font-brand text-paper antialiased">
        <a href="#main-content" className="skip-link">
          تخطي إلى المحتوى الرئيسي
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
