# Brand capture — aibitsoft.com

Captured 2026-09-25 with `playwright-cli` (Chromium, headless).

## Logo

`https://aibitsoft.com/images/Blue-Green-Main-Logo.png` (3000×536 PNG). Dominant opaque pixels, sampled via canvas:

| Role | Hex | Share of opaque pixels |
|---|---|---|
| Logo blue (wordmark + "A") | `#0A5797` | 73% |
| Logo green ("i" mark) | `#49B04F` | 27% |

## Declared site theme

From the inline `tailwind.config` and `<style>` in the homepage `<head>`:

| Token | Hex | Where it is used |
|---|---|---|
| `primary` | `#2B4DDF` | Nav "Book Expert" button border/text, `.btn-primary` gradient start |
| `secondary` | `#0A165E` | Declared; dark navy |
| `accent` | `#E8EDFF` | Declared; pale blue tint |
| body background | Tailwind `bg-gray-50` | `<body class="antialiased bg-gray-50">` |

Font family: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` (Google Fonts, weights 300–900). The hero `h1` uses `font-black` (900) with `leading-tight`.

Observations relevant to SiteChat's design (not adopted wholesale):

- The site's UI blue (`#2B4DDF`) differs from the logo blue (`#0A5797`).
- The site leans on gradients (`.hero-bg`, `.btn-primary`, `.text-gradient`), hover lift (`translateY(-5px)`), and pill buttons — all on the brief's banned list for SiteChat.

## Screenshots

- `home-1280.png`: viewport at 1280×800.
- `home-360.png`: viewport at 360×780.

## Computed styles

Read with `getComputedStyle` at 1280 px (hero section and header of `/`). Hex values are conversions of the reported `rgb()`.

| Element | Colour | Background | Font | Size / weight / line-height | Radius | Border |
|---|---|---|---|---|---|---|
| Logo | PNG: `#0A5797` + `#49B04F` | — | — | image, height 32 px (`lg:h-8`) | — | — |
| Body | `#000000` | `#F9FAFB` | Inter | 16 / 400 / 24 px | — | — |
| Nav link ("Build") | `#4B5563` | — | Inter | 16 / 500 / 24 px | — | — |
| H1 text | `#1E293B` | — | Inter | 60 / 900 / 60 px (24 px at 360) | — | — |
| H1 accent word ("Solutions") | `#1D4ED8` | — | Inter | 60 / 900 | — | — |
| Eyebrow badge ("AI POWERED SOLUTION") | `#1D4ED8` | `rgba(219,234,254,.8)` | Inter | 14 / 500, uppercase | 9999 px | 1 px `rgba(191,219,254,.5)` |
| Hero paragraph | `#475569` | — | Inter | 18 / 400 / 28 px (14 px at 360) | — | — |
| H2 (first) | `#1F2937` | — | Inter | 20 / 700 / 36 px | — | — |
| Button, primary ("Get Started Today") | `#FFFFFF` | `#1D4ED8` | Inter | 18 / 700 / 28 px | 16 px | — |
| Button, secondary ("Book Expert Call") | `#1D4ED8` | `rgba(255,255,255,.8)` | Inter | 18 / 700 / 28 px | 16 px | 2 px `#BFDBFE` |
| Nav button, solid ("Get Proposal") | `#FFFFFF` | gradient `#1D4ED8 → #2563EB` | Inter | 16 / 500 / 24 px | 9999 px | — |
| Nav button, outline ("Book Expert") | `#2B4DDF` | `#FFFFFF` | Inter | 16 / 500 / 24 px | 9999 px | 2 px `#2B4DDF` |

Font family on every element: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

## Takeaways for SiteChat's DESIGN.md

- Brand blue is the logo blue `#0A5797` (decision: the logo is the brand mark). The site's UI blues (`#1D4ED8`, `#2B4DDF`) are Tailwind defaults and a declared token, not the mark.
- Brand green is the logo green `#49B04F`; the site UI does not use it outside the logo.
- Inter is the brand face; neutrals are Tailwind slate/gray (`#1E293B`, `#475569`, `#4B5563`, `#F9FAFB`).
- Not carried over, per the brief's bans: gradient buttons and hero wash, the one accented word in the H1, the all-caps eyebrow badge, `→` in button text, pill radius on every button.
