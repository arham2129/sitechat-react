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

## Computed styles and screenshots

Pending: see "Blocked" below.

## Blocked

The site styles itself at runtime with the Tailwind Play CDN (`https://cdn.tailwindcss.com`). This environment's network policy denies that host, so the page renders unstyled and computed colours for headings, body text and buttons would be browser defaults, not the brand.
