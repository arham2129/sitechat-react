# SiteChat React — Build Brief for Claude Code

You are building a React frontend for **SiteChat**, a website Q&A chatbot, for Irham Shafi to demo at a **React Intern interview at AiBit Soft on Monday, 28 Sep 2026**. Irham must be able to explain every line to a technical panel. Optimise for **clarity and polish over feature count**.

Work in the phases below. **At the end of every phase: stop, summarise what changed (files + why), commit, and wait for me to type `continue`.** Never start the next phase on your own.

---

## Phase 0 — Preflight (stop if anything fails)

1. Confirm these skills are installed (`ls .claude/skills ~/.claude/skills`, or `npx skills list`). If one is missing, print its name and stop; do not substitute a different skill.
   - `design-taste-frontend` (taste-skill, Leonxlnx/taste-skill)
   - `web-design-guidelines` (vercel-labs/agent-skills)
   - `playwright-cli` (microsoft/playwright-cli), and the `playwright-cli` binary is on PATH
   - `awesome-claude-design` (VoltAgent/awesome-claude-design — README-only reference for the DESIGN.md format; no installable skill. Write `docs/DESIGN.md` by hand instead.)
2. Node >= 18. `git init` if needed.

---

## Context

- Existing backend: Python FastAPI (crawler + hybrid retrieval + LLM with refusal). **Its source is NOT available to you.** Build against the assumed contract below and a mock adapter. Reconciling with the real API must later be a change to **one file** (`src/api/httpClient.ts`).
- The job post asks for: responsive React UIs, reusable components, API integration, fixing frontend issues, responsive design across devices, Git. Every phase should visibly serve one of these.
- The panel works at AiBit Soft (aibitsoft.com). The demo crawls their site.

---

## Hard constraints

- Vite + React 18 + TypeScript (strict). Function components and hooks only.
- Styling: **CSS Modules + CSS custom-property tokens** in `src/styles/tokens.css`. No Tailwind, no UI kit (MUI/shadcn/Chakra), no animation library, no icon font. Inline SVG icons only where needed, max 6.
- Runtime dependencies allowed: `react`, `react-dom`. Nothing else without asking me first and stating why.
- Dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `eslint` + `typescript-eslint` + `eslint-plugin-react-hooks`, `@playwright/test`.
- Files <= 150 lines. Components are presentational; state and effects live in hooks.
- Comments explain **why**, never what.
- Light theme only; declare `color-scheme: light`.

---

## API contract (ASSUMED — lives in `src/api/types.ts`)

Backend base URL via Vite proxy: `/api` -> `http://localhost:8000` (assumed port; configurable in `vite.config.ts`).

```ts
type CrawlBudget = 20 | 60 | 120;

// POST /api/crawl        body: { url: string; max_pages: CrawlBudget }  -> { job_id: string }
// GET  /api/crawl/:id    -> CrawlStatus   (poll every 1000 ms while status === "running")
// POST /api/crawl/:id/cancel -> { status: "cancelled" }
interface CrawlStatus {
  status: "running" | "done" | "cancelled" | "error";
  pages_crawled: number;
  max_pages: CrawlBudget;
  current_url?: string;
  error?: string;
}

// POST /api/chat  body: { question: string; job_id: string }
// Response: text/event-stream, events:
//   event: token    data: { "text": string }
//   event: sources  data: { "items": { "title": string; "url": string; "score": number }[] }
//   event: refused  data: { "reason": string; "contact": { "email"?: string; "phone"?: string; "url"?: string } }
//   event: done     data: {}
```

- `EventSource` cannot POST, so parse the stream with `fetch` + `ReadableStream` + `TextDecoder` in `src/api/sseParser.ts`. The parser must handle events split across chunk boundaries.
- Cancellation: `AbortController` for chat streams and crawl polling.

### Adapters

- `src/api/client.ts` exports one `SiteChatClient` interface.
- `src/api/httpClient.ts` implements it against the contract above.
- `src/api/mockClient.ts` implements it offline, with realistic delays: crawl progress ticks, token-by-token streaming at ~25 ms per token.
- Select the adapter with `VITE_API_MODE=mock|http` (default `mock`). Show a small "Demo data" / "Live" badge in the header.

### Mock data must be real, not invented

In Phase 1, use `playwright-cli` to visit aibitsoft.com and save up to 20 pages as `src/mocks/site.json` (`{ title, url, text }`, text trimmed to 1,500 chars).

The mock client:
- answers by naive keyword overlap over those pages;
- streams a short answer made **only of sentences copied from the best-matching page**;
- returns up to 3 of those pages as sources;
- refuses when the best score is below a threshold, returning contact details found on the site.

Never fabricate facts about AiBit Soft.

---

## Features

### P0 — must ship

1. **Crawl panel**
   - URL input with validation: `new URL()`, http/https only, inline error text.
   - Page budget as a segmented control (20 / 60 / 120, radio-group semantics).
   - Start button, progress (`pages_crawled / max_pages` plus current URL, truncated), Cancel button.
   - Chat is disabled until status is `done`.
2. **Chat**
   - Message list with `aria-live="polite"` on the streaming message.
   - Composer: Enter sends, Shift+Enter adds a newline, button disabled while empty; Stop button while streaming.
   - Each answer shows a collapsible source list (title + host).
   - Refused answers render as a distinct, calm state: the reason plus contact details as links. This is not an error.
3. **States**
   - Empty state that tells the user what to do first.
   - Loading states.
   - Network error with a Retry that re-sends the last question.
4. **Responsive**
   - 360 px: single column, crawl panel collapses to a summary bar after the crawl is done.
   - 768 px and 1280 px: two-pane layout (crawl left, chat right).
5. **Accessibility**
   - Full keyboard flow and visible focus.
   - Labels on every control.
   - `prefers-reduced-motion` respected.
   - Contrast AA.

### P1 — only if P0 is done and audited before Saturday 22:00 PKT

- Copy-answer button.
- Suggested questions generated from crawled page titles.
- Deploy mock mode to Vercel or Netlify for a shareable link.

### Out of scope

Auth, persistence, dark mode, i18n, markdown rendering.

---

## Structure (target)

```
src/
  api/        client.ts httpClient.ts mockClient.ts sseParser.ts types.ts
  hooks/      useCrawlJob.ts useChatStream.ts
  state/      chatReducer.ts            # useReducer: messages, streaming, error
  components/ CrawlPanel/ BudgetPicker/ ChatView/ MessageList/ Message/ SourceList/ Composer/ RefusalNotice/ StatusBadge/
  styles/     tokens.css global.css
  mocks/      site.json
  App.tsx main.tsx
docs/         DESIGN.md DECISIONS.md audit.md screenshots/ brand-capture/
```

---

## Phases

### Phase 1 — Brand capture (skill: `playwright-cli`)

- Screenshot aibitsoft.com at 1280 px and 360 px into `docs/brand-capture/`.
- Record the computed colours and font families of the logo, headings, body text and buttons.
- Build `src/mocks/site.json` as specified above.

### Phase 2 — Design system (skill: `design-taste-frontend`)

- Write `docs/DESIGN.md` by hand (no skill covers this format as an installable skill — `VoltAgent/awesome-claude-design` is README-only). Do not adopt another brand's look (no Stripe, Linear or Vercel clones) — derive it from AiBit Soft's own site captured in Phase 1.
- Write `docs/DESIGN.md` for SiteChat, derived from the Phase 1 capture:
  - 4–6 named colour tokens (AiBit's blue and green as accents, not everywhere);
  - type scale;
  - spacing scale;
  - radius tiers (not one radius everywhere);
  - component rules.
- Apply the taste skill with low motion, medium density and conservative layout variance. This is a tool, not a landing page: the app opens straight into the crawl + chat workspace, with no hero.
- Banned:
  - gradient washes;
  - identical rounded-card grids with the same soft shadow;
  - ALL-CAPS eyebrow labels;
  - emoji;
  - "→" appended to button text;
  - fade-up on every element;
  - one accented word in a heading;
  - a monospace face for small labels;
  - numbered 01/02/03 markers.
- Write `src/styles/tokens.css` from DESIGN.md.
- Stop and show me DESIGN.md before any component code.

### Phase 3 — API layer + state

- Build `types.ts`, `sseParser.ts`, both clients, `chatReducer.ts` and both hooks.
- Tests: the reducer (every action), the SSE parser (split chunks, multiple events per chunk, a malformed line), and the mock client refusal threshold.

### Phase 4 — Components + wiring

- Build the components, then `App.tsx`.
- Component tests: Composer (Enter vs Shift+Enter, disabled when empty), RefusalNotice renders the contact links, BudgetPicker keyboard arrows.

### Phase 5 — Audit (skill: `web-design-guidelines`)

- Run it on `src/**/*.{tsx,css}`.
- Fix every finding or justify it in `docs/audit.md` using the format `file:line — rule — fix | justification`.

### Phase 6 — Verification (skill: `playwright-cli`)

- Screenshots in mock mode at 360, 768 and 1280 px for: empty, crawling, answer with sources, refusal, error. Save to `docs/screenshots/`.
- Complete one full flow with the keyboard only.
- Assert zero console errors or warnings.
- Add one `@playwright/test` spec for the happy path (crawl, ask, answer, sources visible).

### Phase 7 — Docs for the interview

- `README.md`: what it is, run steps (`npm i`, `npm run dev`, mock vs live), architecture diagram in Mermaid, and screenshots.
- `docs/DECISIONS.md`: 8–12 entries in the format `Decision · Alternative rejected · Why`. Cover at least:
  - useReducer vs useState;
  - fetch-stream vs EventSource;
  - the adapter pattern;
  - CSS Modules vs Tailwind;
  - polling vs streaming for crawl progress;
  - AbortController;
  - where state lives.
- `docs/DEMO.md`: a 3-minute demo script, plus 10 likely panel questions with 2-line answers grounded in this codebase.

---

## Definition of done (failure = any line false)

- `npm run build`: zero TypeScript errors.
- `npm run lint`: zero errors.
- `npm test`: all green.
- Playwright spec passes; zero console errors across all captured states.
- Every `web-design-guidelines` finding is fixed or justified in `docs/audit.md`.
- No file over 150 lines; no runtime dependency beyond react and react-dom.
- Mock mode works with the network disconnected. This is the interview fallback.
- One commit per phase, using conventional messages (`feat:`, `test:`, `docs:`, `fix:`).
