# KORA asset audit

Audit date: 29 August 2026.

The supplied workspace did not contain `src/assets` or `references`. The following required files were therefore not readable and were not reconstructed, renamed, recolored, or replaced with unofficial brand artwork.

| Exact filename | Type | Intended use | Valid/readable |
| --- | --- | --- | --- |
| `src/assets/brand/logos/logo 20.svg` | SVG logo | Black horizontal bilingual lockup on a light surface | No — missing |
| `src/assets/brand/logos/logo 23.svg` | SVG logo | Black vertical Arabic lockup on a light surface | No — missing |
| `src/assets/brand/logos/logo_0_transparent_HQ.svg` | SVG logo | Light Arabic lockup for the header, hero, and footer | No — missing |
| `src/assets/brand/patterns/Pattern_0_transparent_HQ.svg` | SVG pattern | Small three-color section accent | No — missing |
| `src/assets/brand/patterns/Pattern_2_transparent_HQ.svg` | SVG pattern | Subtle symbol pattern on a light section | No — missing |
| `src/assets/brand/patterns/Pattern_6_transparent_HQ.svg` | SVG pattern | Navy hexagon structural divider | No — missing |
| `src/assets/brand/patterns/Pattern_7_transparent_HQ.svg` | SVG pattern | Green outline pattern on dark sections | No — missing |
| `src/assets/brand/patterns/Pattern_8_transparent_HQ.svg` | SVG pattern | Multicolor controlled section divider | No — missing |
| `src/assets/fonts/itfGhroob-Light.otf` | OpenType font | Ghroob weight 300 | No — missing |
| `src/assets/fonts/itfGhroob-Regular.otf` | OpenType font | Ghroob weight 400 | No — missing |
| `src/assets/fonts/itfGhroob-Medium.otf` | OpenType font | Ghroob weight 500 | No — missing |
| `src/assets/fonts/itfGhroob-Bold.otf` | OpenType font | Ghroob weight 700 | No — missing |
| `src/assets/fonts/itfGhroob-ExtraBold.otf` | OpenType font | Ghroob weight 800 | No — missing |

Additional missing assets:

- Dedicated favicon.
- Open Graph sharing image.
- Production domain.
- Any identity/event reference files expected inside `references`.

Current implementation treatment:

- Text-only `KORA` branding is used as a clearly temporary fallback; no logo has been traced or reconstructed.
- Identity colors and restrained rectangular editorial geometry provide layout structure without pretending to be the missing official patterns.
- Tahoma and Arial are used so the browser does not issue failed requests for missing OTF files. The exact Ghroob declarations are already registered in `src/styles/fonts.css`; enable the family only after the files are supplied.
- No stock or placeholder photography is used.
