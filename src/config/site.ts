export type ApplicationStatus = "open" | "closed" | "coming-soon";

export interface SiteConfig {
  readonly eventName: string;
  readonly arabicTagline: string;
  readonly englishTagline: string;
  readonly eventDate: string;
  readonly eventDateArabic: string;
  readonly eventLocationArabic: string;
  readonly applicationStatus: ApplicationStatus;
  readonly applicationDeadlineArabic: string;
  readonly applicationDeadlineISO: string;
  readonly microsoftFormUrl: string;
  readonly contactEmail: string;
  readonly socialLinks: {
    readonly instagram: string;
    readonly x: string;
    readonly tiktok: string;
  };
  readonly canonicalUrl: string | null;
  readonly openGraphImage: string | null;
}

export const siteConfig: SiteConfig = {
  eventName: "KORA",
  arabicTagline: "الصناعة خلف اللعبة",
  englishTagline: "THE INDUSTRY BEHIND THE GAME",
  eventDate: "12-14 November 2026",
  eventDateArabic: "12-14 نوفمبر 2026",
  eventLocationArabic: "جامعة الملك فهد للبترول والمعادن، الظهران",
  applicationStatus: "open",
  applicationDeadlineArabic: "20 سبتمبر 2026، الساعة 11:59 مساءً بتوقيت السعودية",
  applicationDeadlineISO: "2026-09-01T23:59:00+03:00",
  microsoftFormUrl: "https://forms.cloud.microsoft/r/QQmb1auxvd",
  contactEmail: "kora.kfupm@gmail.com",
  socialLinks: {
    instagram: "https://www.instagram.com/kora_kfupm",
    x: "https://x.com/KORA_KFUPM",
    tiktok: "https://www.tiktok.com/@kfupm_kora",
  },
  canonicalUrl: null,
  openGraphImage: null,
};
