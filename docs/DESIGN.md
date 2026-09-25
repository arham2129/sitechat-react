# SiteChat design system

Design read: a single-screen tool (crawl a site, then ask it questions) for a technical interview panel, in a calm, trust-first language. It is built with CSS Modules and custom-property tokens, uses Inter, and takes AiBit Soft's logo blue and green as accents.

Dials (taste skill): variance 3 (conservative), motion 2 (low), density 5 (medium). Source of every brand value: `docs/brand-capture/README.md`.

## Principles

1. **The workspace is the first screen.** There is no hero, marketing copy or onboarding carousel. The empty state is one heading and one sentence.
2. **Colour carries meaning.** Blue means "you can act here". Green means "the crawl is ready". Everything else is neutral slate.
3. **Group with borders and space, not shadows.** Panels are flat with a 1 px border. Nothing floats.
4. **State changes are visible without motion.** Every state reads correctly with `prefers-reduced-motion: reduce`.
5. **Refusal is not failure.** A refused answer is calm and informative. Only network and crawl failures use the danger colour.

## Colour

Six named tokens. Contrast ratios are against `paper` unless noted. AA requires 4.5:1 for text and 3:1 for UI boundaries.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `ink` | `#1E293B` | Headings, body text, message text | 14.6:1 |
| `slate` | `#475569` | Secondary text, labels, helper text | 7.6:1 (7.3:1 on `canvas`) |
| `canvas` | `#F9FAFB` | Page background | n/a |
| `paper` | `#FFFFFF` | Panels, inputs, composer | n/a |
| `aibit-blue` | `#0A5797` | Primary buttons, links, selected segment, focus ring | 7.4:1; white on it 7.4:1 |
| `aibit-green` | `#49B04F` | Graphics only: progress fill, "ready" indicator | 2.8:1, so never used for text |

Functional tones, derived from the six above and used only for the stated role:

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `line` | `#E2E8F0` | Decorative dividers and panel borders | decorative |
| `control-border` | `#64748B` | Borders of inputs, the segmented control and secondary buttons | 4.8:1 (3:1 needed) |
| `blue-tint` | `#EAF1F8` | User message, selected-hover, refusal background | `aibit-blue` on it 6.5:1 |
| `green-ink` | `#2F7A34` | Text for the "Ready" status | 5.3:1 |
| `danger` | `#B42318` | Network and crawl error text and icon | 6.6:1 (6.1:1 on `danger-tint`) |
| `danger-tint` | `#FEF3F2` | Error block background | n/a |

Rules:
- Use AiBit's button blue (`#2B4DDF`) and the Tailwind blues (`#1D4ED8`) nowhere. `aibit-blue` is the only blue.
- `aibit-green` never touches text and never fills a button.
- There are no gradients anywhere, and shadows are limited to the one listed under Elevation.
- `color-scheme: light`. There is no dark mode (out of scope in the brief).

## Typography

Inter is the brand face, used on every aibitsoft.com element. It is self-hosted (OFL-1.1 woff2 in the repo) so mock mode renders identically offline. Fallback stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 px | 500 | Source host, status badge, character hints |
| `text-sm` | 14 / 20 px | 400, 500 for labels, 600 for buttons | Labels, helper and error text, buttons, progress line |
| `text-md` | 16 / 24 px | 400 | Body, messages, inputs (16 px stops iOS zooming into focused inputs) |
| `text-lg` | 18 / 26 px | 600, tracking -0.01em | Panel headings |
| `text-xl` | 22 / 28 px | 700, tracking -0.015em | App name, empty-state heading |

Rules:
- Nothing above 22 px. The site's 60 px/900 heading is landing-page scale, not a tool's.
- Emphasis uses weight or `ink` against `slate`, never a coloured word in a heading.
- Numbers that change (the `12 / 60` page count) use `font-variant-numeric: tabular-nums` so the line does not jitter.
- Sentence case everywhere. No all-caps labels, no monospace labels, no em-dashes in UI copy. Quoted site text in answers and sources stays verbatim, even where it has dashes.

## Spacing

A 4 px base.

| Token | px | Typical use |
|---|---|---|
| `space-1` | 4 | Icon-to-text gap, label-to-hint gap |
| `space-2` | 8 | Label to input, between segmented options |
| `space-3` | 12 | Inside compact controls, between sources |
| `space-4` | 16 | Panel padding at 360 px, gap between messages |
| `space-5` | 24 | Panel padding at 768 px and wider, gap between form groups |
| `space-6` | 32 | Gap between the two panes |
| `space-7` | 48 | Empty-state vertical padding |

Control height is 40 px, and 44 px for touch targets at 360 px.

## Radius tiers

| Token | px | Applies to |
|---|---|---|
| `radius-sm` | 4 | Progress track and fill, inline source tags |
| `radius-md` | 8 | Buttons, inputs, segmented control, composer |
| `radius-lg` | 12 | Panels, message blocks, refusal and error blocks |
| `radius-full` | 999 | Status badge only |

Radius follows element type: controls use 8 and containers use 12. The badge is the only pill, so buttons are never pills.

## Elevation

One shadow, `0 1px 2px rgb(30 41 59 / 0.08)` (tinted with `ink`), and only on the collapsed crawl summary bar at 360 px, where it separates a sticky bar from scrolling content. Everything else is flat, with a `line` border.

## Motion

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120 ms | Hover and active colour changes, button press |
| `duration-base` | 200 ms | Progress fill (`transform: scaleX`), source list reveal (opacity) |
| `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | All of the above |

- Animate only `transform` and `opacity`. There are no entrance animations and no fade-up.
- The streaming caret blinks at 1 s. With `prefers-reduced-motion: reduce` it stays solid and every duration is 0 ms.

## Focus

`outline: 2px solid aibit-blue; outline-offset: 2px` on `:focus-visible` for every interactive element, including segmented options and the sources toggle. It is never removed. The contrast is 7.4:1 against `paper` and 7.1:1 against `canvas`.

## Layout

- **Header** (56 px): the "SiteChat" wordmark in `text-xl` `ink` and the status badge. AiBit's logo is not used, because SiteChat is not an AiBit product.
- **768 px and wider**: two panes in a grid. The crawl pane is 320 px wide at 768 px and 360 px at 1280 px, and chat takes the rest. The container is at most 1280 px wide with 24 px gutters. Chat fills the viewport height (`100dvh` minus the header), the message list scrolls, and the composer stays at the bottom.
- **360 px**: one column with 16 px gutters. Before the crawl finishes, the crawl panel sits above chat. Once it is done, it collapses into a sticky summary bar showing the host, the page count and a "Change site" button. The host truncates first; the page count and button never do.

## Components

| Component | Rules |
|---|---|
| **Button** | Primary: `aibit-blue` fill, white `text-sm`/600, `radius-md`, 40 px tall. Secondary: `paper` with a `control-border` border and `ink` text. Text button: no border, `aibit-blue` text. Disabled: `canvas` fill, `slate` text, `not-allowed` cursor. Pressed: `translateY(1px)`. Labels have at most 3 words and no arrow glyphs. |
| **Text input** | Label above, helper below, then the error below that. `control-border`, `radius-md`, `text-md`. Invalid state: `danger` border and message, with `aria-invalid` and `aria-describedby`. Placeholder text is never the label. |
| **BudgetPicker** | A segmented control with `role="radiogroup"`. Three equal segments (20, 60, 120 pages) sit in one `control-border` frame. The selected segment is an `aibit-blue` fill with white text. Arrow keys move the selection and Tab enters and leaves the group. |
| **Crawl progress** | A 6 px `radius-sm` track in `line` with an `aibit-green` fill (2.2:1 against the track, so the text count below it carries the information; the bar is supplementary). Below it: `12 / 60 pages` in tabular numbers, then the current URL in `slate`, truncated in the middle with an ellipsis. The count never wraps, truncates or hides at any width, including 360 px; only the URL gives way. The Cancel button is secondary. |
| **StatusBadge** | `radius-full`, `text-xs`/500. Demo data: `slate` on `canvas` with a `line` border. Live: `green-ink` on `paper` with a `line` border. |
| **Message (user)** | `blue-tint` block, `radius-lg`, `ink` text, right-aligned, at most 80% of the width. |
| **Message (answer)** | On `paper` with no fill and left-aligned, with text limited to 65 characters per line. A caret shows while the answer is streaming. |
| **SourceList** | A text-button toggle, "Sources (3)", with a chevron that rotates 180°. Each source shows its title in `ink` and its host in `slate` `text-xs`, and links out with `rel="noreferrer"`. |
| **RefusalNotice** | `blue-tint` background, `radius-lg`, an info icon in `aibit-blue` and the reason in `ink`. Contact details (email, phone, contact page) render as a row of `aibit-blue` links, with no danger colour. |
| **Error block** | `danger-tint` background, a `danger` icon and text, and a secondary Retry button that re-sends the last question. |
| **Composer** | A textarea (1 to 6 rows, auto-growing) and a send icon button with `aria-label="Send"`, which becomes a Stop button while streaming. Enter sends and Shift+Enter adds a newline. Hint text in `slate` `text-xs`. |
| **Empty state** | Centred in the chat pane: a `text-xl` heading ("Crawl a site to start") and one `slate` sentence pointing at the crawl panel. No illustration. |

## Icons

Six inline SVGs at most, drawn on a 20 px grid with a 1.5 px stroke and `currentColor`: send, stop, chevron-down, info, alert, retry. Each one is `aria-hidden` next to a visible label, or has an `aria-label` when it stands alone.

## Banned

Gradient washes, identical rounded-card grids sharing one soft shadow, all-caps eyebrow labels, emoji, "→" in button text, fade-up on every element, one accented word in a heading, monospace for small labels, and numbered 01/02/03 markers. From the taste skill (direction only): em-dashes in UI copy, decorative dots, and scroll cues. The brief overrides the skill's icon libraries, Tailwind, Motion and dark mode.
