import { Alexandria } from "next/font/google";

/**
 * Brand typography.
 *
 * The official KORA identity typeface is "Ghroob" (brand-assets/04 Fonts).
 * Its license (iwantype Desktop License, 1-5 users) explicitly excludes web
 * and mobile use ("Covered Uses: All media except web and mobile
 * applications"), so it cannot legally be shipped as a web font here.
 *
 * Alexandria is used instead: a geometric, editorial Arabic + Latin
 * variable typeface with a similarly confident, modern character, and full
 * OpenType support for Arabic shaping (initial/medial/final forms,
 * ligatures) rather than a generic system fallback.
 */
export const brandFont = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-brand-sans",
  display: "swap",
});
