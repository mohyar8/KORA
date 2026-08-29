# KORA recruitment landing page

Arabic, right-to-left, single-page recruitment website for KORA 2026. The application entry point is centrally controlled and starts in `coming-soon`; no applicant data is collected by the site.

## Project structure

```text
.
├── e2e/recruitment.spec.ts
├── public/robots.txt
├── scripts/validate.mts
├── src/
│   ├── components/
│   ├── config/site.ts
│   ├── data/teams.ts
│   ├── hooks/useMediaQuery.ts
│   ├── styles/{fonts,tokens,globals}.css
│   ├── test/{App.test,setup}.tsx
│   ├── App.tsx
│   └── main.tsx
├── ASSET_AUDIT.md
├── index.html
├── package.json
├── playwright.config.ts
└── vite.config.ts
```

## Setup and development

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The dependency-free structural validation can also run on Node.js 24:

```bash
node scripts/validate.mts
```

## Configuration

All operational site values live in [`src/config/site.ts`](src/config/site.ts).

- Open applications: change `applicationStatus` to `"open"`. Every application control will become a link to the configured Microsoft Forms URL and display `ابدأ طلبك`.
- Close applications: change `applicationStatus` to `"closed"`. Every application control becomes non-interactive and displays `انتهى التقديم`.
- Coming soon: use `"coming-soon"`. No active form link is rendered.
- Microsoft Forms URL: edit `microsoftFormUrl`.
- Deadline: edit `applicationDeadlineArabic` and its matching machine-readable `applicationDeadlineISO`.
- Contact email: edit `contactEmail`.
- Social accounts: edit `socialLinks.instagram`, `socialLinks.x`, and `socialLinks.tiktok`.
- Dates and location: edit their matching values in the same configuration object.
- Team content: edit the typed data in [`src/data/teams.ts`](src/data/teams.ts).

The explicit application status is always the source of truth. Visitor device time never changes it automatically.

## Missing brand assets

The workspace arrived without `src/assets` and `references`. See [`ASSET_AUDIT.md`](ASSET_AUDIT.md) for the exact audit.

When the official files are supplied:

1. Place them at the exact paths in the audit without renaming them.
2. Change `--font-primary` in `src/styles/fonts.css` to `"Ghroob", Tahoma, Arial, sans-serif`.
3. Replace the temporary text-only brand fallback in `Header`, `Hero`, and `Footer` with the approved logo `<img>` elements described in the brief.
4. Add only the approved pattern assets where specified; do not recreate or recolor them.
5. Rerun all checks and visual QA.

No favicon was fabricated from a wordmark.

## Future domain and sharing image

After a production domain and Open Graph image are approved:

1. Set `canonicalUrl` and `openGraphImage` in `src/config/site.ts`.
2. Add matching `<link rel="canonical">`, `og:url`, and `og:image` tags to `index.html`.
3. Add a sitemap only when it can use the final production domain.

## Production build and deployment

```bash
npm run build
```

Deploy the generated `dist/` directory to any static host such as KFUPM infrastructure, Netlify, Vercel static hosting, or GitHub Pages. No backend, runtime secrets, rewrites, database, analytics, cookies, or service worker are required. Configure HTTPS and the final domain at the host, then add the metadata described above.

## Current verification status

- Dependency-free configuration and source validation: available through `node scripts/validate.mts`.
- TypeScript, ESLint, Vitest, Vite build, Playwright, axe, and Lighthouse require installed npm dependencies.
- In the supplied execution environment, registry access and browser downloads returned HTTP 403. Results for checks that could not execute must not be treated as passing.
- Official SVG and OTF asset-load acceptance checks cannot pass until those files are supplied.

## Design rationale

The layout expresses “Beyond the Visible Game” through partial editorial blocks, cropped edge geometry, connected rules, asymmetry, and a clear relationship between event tracks and delivery teams. Navy carries the page, while coral, green, and fuchsia identify selected transitions and team groups. The composition avoids club, stadium, esports, SaaS-card, and stock-photo conventions.
