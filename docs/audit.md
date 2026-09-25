# Web Interface Guidelines audit

- **Skill:** `web-design-guidelines` (vercel-labs/agent-skills), rules fetched from `vercel-labs/web-interface-guidelines/main/command.md` on 2026-09-25.
- **Scope:** `src/**/*.{tsx,css}` (32 files, tests excluded), plus `index.html` where a rule concerns it.
- **Line numbers** refer to the audited revision `b6e2813`. The Phase 5 commit changes them.

Format: `file:line — rule — fix | justification`. **Fix** means changed in the Phase 5 commit. **Justified** means deliberately left, with the reason.

## Fixed

- `src/components/CrawlPanel/CrawlSummary.tsx:36` — Destructive actions need confirmation or undo — **Fix:** "Change site" no longer discards the conversation. The finished crawl is kept as `previous`, the form offers "Back to <host>", and the conversation is only replaced once a new crawl starts (`useCrawlJob.reset`/`restore`, `App` key). Covered by a hook test.
- `src/api/mockClient.ts:27` — Second person, avoid first person; curly quotes — **Fix:** "I couldn't find an answer…" became "The crawled pages don’t cover this question."
- `src/components/CrawlPanel/CrawlForm.tsx:18` — Focus the first error on submit — **Fix:** an invalid submit focuses the URL field, whose `aria-describedby` points at the error, so screen readers read it.
- `src/hooks/useCrawlForm.ts:17` — Error messages include the fix — **Fix:** "Only http and https addresses can be crawled." became "Only web addresses can be crawled. Start it with https:// instead."
- `src/components/Message/Message.tsx:48` — Error messages include the next step — **Fix:** appended "Check your connection, then retry."
- `src/components/CrawlPanel/CrawlPanel.tsx:61` — Error messages include the next step — **Fix:** appended "Check the address, then start the crawl again."
- `src/components/Message/Message.tsx:34` — Loading states end with `…` — **Fix:** "Searching the crawled pages…"
- `src/components/CrawlPanel/CrawlProgress.tsx:19` — Loading states end with `…` — **Fix:** "Crawling aibitsoft.com…" and "Starting crawl of aibitsoft.com…".
- `src/components/ChatView/ChatView.tsx:48` — Placeholders end with `…` — **Fix:** "Ask about aibitsoft.com…". The disabled state became "Start a crawl first…", which also reads correctly next to a kept conversation.
- `src/components/Composer/Composer.tsx:60` — Non-breaking spaces in key combinations — **Fix:** `Shift + Enter`.
- `src/components/CrawlPanel/CrawlProgress.tsx:44` — Specific button labels — **Fix:** "Cancel" became "Cancel crawl".
- `src/components/Composer/Composer.tsx:28` — Inputs need `name`; `autocomplete="off"` on non-auth fields — **Fix:** `name="question" autoComplete="off"`.
- `src/components/CrawlPanel/CrawlForm.tsx:23` — Inputs need a meaningful `name` — **Fix:** `name="url"`.
- `src/components/Button/Button.module.css:17` — Animate `transform`/`opacity` only — **Fix:** removed the `background-color` transition; only the press `transform` animates. DESIGN.md motion table updated to match.
- `src/components/BudgetPicker/BudgetPicker.module.css:22` — Animate `transform`/`opacity` only — **Fix:** removed the `background-color` transition.
- `src/components/CrawlPanel/CrawlPanel.module.css:11` — `text-wrap: balance` on headings — **Fix:** added.
- `src/components/ChatView/ChatView.module.css:26` — `text-wrap: balance` on headings — **Fix:** added to the empty-state title.
- `src/components/SourceList/SourceList.module.css:49` — Text containers handle long content — **Fix:** `overflow-wrap: anywhere` on source titles.
- `src/components/RefusalNotice/RefusalNotice.module.css:44` — Links need a hover state — **Fix:** the underline thickens on hover.
- `src/components/Composer/Composer.module.css:16` — Flex children need `min-width: 0` — **Fix:** added to the textarea.
- `src/components/CrawlPanel/CrawlPanel.module.css:37` — Flex children need `min-width: 0` — **Fix:** added to the error text.
- `src/components/CrawlPanel/CrawlPanel.module.css:51`, `src/components/ChatView/ChatView.module.css:48` — Sticky elements must not cover the focused element — **Fix:** `scroll-padding-top: 5rem; scroll-padding-bottom: 8rem` on `html` below 48rem (`global.css`).
- `src/styles/global.css:32` — `touch-action: manipulation`; set `-webkit-tap-highlight-color` intentionally — **Fix:** both added (the tap highlight is a 12% tint of `aibit-blue`).
- `src/styles/global.css:2` — Preload critical fonts — **Fix:** the font moved to `public/fonts/` for a stable URL, preloaded in `index.html` with `crossorigin`.
- `src/App.tsx:20`, `src/components/CrawlPanel/CrawlSummary.tsx:19`, `src/components/CrawlPanel/CrawlProgress.tsx:20`, `src/components/CrawlPanel/CrawlProgress.tsx:38`, `src/components/SourceList/SourceList.tsx:27`, `src/components/RefusalNotice/RefusalNotice.tsx:30` — Brand names and identifiers need `translate="no"` — **Fix:** added to the wordmark, host names, URLs, email and phone.

## Justified

- `src/App.tsx:24` — Include a skip link for main content — **Justified:** the header holds no focusable element (a heading and a badge), so the first Tab already lands in `<main>`. A skip link would skip nothing.
- `src/components/Composer/Composer.tsx:53` — Submit stays enabled until the request starts — **Justified:** the brief requires "button disabled while empty". Enter on an empty field is a no-op either way, and the hint text says how to send.
- `src/components/CrawlPanel/CrawlForm.tsx:28` — `autocomplete="off"` on non-auth fields — **Justified:** `autocomplete="url"` is deliberate, so browser history can suggest previously crawled sites. The rule targets password-manager prompts, which a `type="url"` field does not trigger.
- `src/components/CrawlPanel/CrawlForm.tsx:21` — Warn before navigation with unsaved changes — **Justified:** persistence is out of scope in the brief. A `beforeunload` prompt would interrupt the live demo whenever the page is reloaded.
- `src/components/CrawlPanel/CrawlProgress.tsx:44` — Destructive actions need confirmation — **Justified:** cancelling a crawl loses no user input. The address and budget are restored and a restart is one click, and a confirm dialog would slow the core flow.
- `src/App.tsx:33` — URL reflects state (deep links) — **Justified:** crawl jobs live in backend (or mock) memory. A deep link to a job would break after a restart, and persistence is out of scope. The one URL flag, `?simulate=chat-error`, is a demo tool.
- `src/components/MessageList/MessageList.tsx:19` — Virtualize lists over 50 items — **Justified:** a demo conversation is well under 50 messages. Virtualizing would complicate `aria-live` and auto-scroll for no measurable gain; revisit if sessions grow.
- `src/components/CrawlPanel/CrawlForm.tsx:54` and all buttons and headings — Title Case (Chicago) — **Justified:** DESIGN.md sets sentence case everywhere for a calm tool voice. It is applied consistently.
- `src/components/CrawlPanel/CrawlProgress.tsx:35` — Numbers via `Intl.NumberFormat` — **Justified:** page counts are at most 120, so there are no separators to localise, and i18n is out of scope in the brief.
- `index.html:7` — `theme-color` matches the page background — **Justified:** `#ffffff` matches the header, which is the surface adjacent to the browser chrome. The canvas below it is `#F9FAFB`.
- `index.html:5` — Full-bleed layouts need `env(safe-area-inset-*)` — **Justified:** the viewport has no `viewport-fit=cover`, so browsers keep content inside the safe area themselves.
- `src/components/Message/Message.tsx:52` — Specific button labels — **Justified:** "Retry" is the label the brief specifies. It sits inside the error block, so its object is unambiguous.

## Passed without changes

Icon-only buttons have `aria-label` (Send), and decorative icons are `aria-hidden`. Every control has a label. Heading order is h1 → h2. Focus uses `:focus-visible` everywhere and is never removed. There is no `transition: all`, reduced motion is honoured (the caret stops and durations go to 0), and `tabular-nums` is used for counts. Empty states render. There are no images, no `autoFocus`, no zoom lock, no paste blocking, and no `div` click handlers. Links are `<a>`. Controlled inputs are cheap per keystroke. `color-scheme: light` is declared.
