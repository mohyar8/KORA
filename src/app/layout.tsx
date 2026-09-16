import type { Metadata, Viewport } from "next";
import { brandFont } from "@/lib/fonts";
import { BRAND, EVENT, SITE_URL } from "@/lib/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const title = `${BRAND.name} | ${BRAND.nameAr} — ${BRAND.taglineAr}`;
const description =
  "كورة: الصناعة خلف اللعبة. حدث جامعي وطني في جامعة الملك فهد للبترول والمعادن يستكشف كرة القدم السعودية بوصفها صناعة متكاملة. انضم إلى فريق كورة وشارك في صناعة الحدث.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
      </body>
    </html>
  );
}
