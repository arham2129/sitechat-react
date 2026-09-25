# Verification (Phase 6)

All checks ran against the **production build** (`npm run build` + `vite preview`) in **mock mode**, in Chromium, on 2026-09-25.

## Screenshots

`docs/screenshots/<state>-<width>.png`, viewport captures (not full page) at 1280×800, 768×1024 and 360×780.

| State | How it was reached | 1280 | 768 | 360 |
|---|---|---|---|---|
| Empty | First load | [empty-1280](screenshots/empty-1280.png) | [empty-768](screenshots/empty-768.png) | [empty-360](screenshots/empty-360.png) |
| Crawling | Start crawl, captured mid-crawl | [crawling-1280](screenshots/crawling-1280.png) | [crawling-768](screenshots/crawling-768.png) | [crawling-360](screenshots/crawling-360.png) |
| Answer with sources | "Do you build mobile apps?", sources expanded | [answer-sources-1280](screenshots/answer-sources-1280.png) | [answer-sources-768](screenshots/answer-sources-768.png) | [answer-sources-360](screenshots/answer-sources-360.png) |
| Refusal | "Who founded it?" | [refusal-1280](screenshots/refusal-1280.png) | [refusal-768](screenshots/refusal-768.png) | [refusal-360](screenshots/refusal-360.png) |
| Network error | `?simulate=chat-error`, "Can you build an MVP?" | [error-1280](screenshots/error-1280.png) | [error-768](screenshots/error-768.png) | [error-360](screenshots/error-360.png) |

Before each capture the script moves the pointer away and waits 350 ms, so no image shows a hover state or a half-finished 200 ms transition.

## Console

- **Screenshot run:** 0 errors and 0 warnings across all 15 states and 18 page loads, recorded with `page.on('console')` and `page.on('pageerror')`.
- **Keyboard run:** 0 errors and 0 warnings.
- **Playwright spec:** asserts the same, and passes.

## Keyboard-only flow

At 1280 px, using only `page.keyboard`: no clicks, no `fill`. Each line shows the key pressed and where focus landed.

```text
Tab          -> input "Website address"             (prefilled)
Tab          -> radio "20"
ArrowRight   -> radio "60"                          (budget moves to 60)
ArrowLeft    -> radio "20"
Tab          -> button "Start crawl"
Enter        -> section "Crawl a website"           (crawl starts; focus parks on the panel)
(crawl done) -> textarea "Question"                 (focus moves to the question field)
Enter        -> textarea "Question"                 (question sent)
(answer)     -> textarea "Question"
Shift+Tab    -> summary "Sources (3)"
Enter        -> summary "Sources (3)"               (sources expand)
Tab          -> link "Mobile Experiences — iOS & Android Apps (opens in a new tab)"
Tab          -> link "Web App Development (opens in a new tab)"
Tab          -> link "AiBit Soft Smart Digital Solutions… (opens in a new tab)"
Tab          -> textarea "Question"
Enter        -> textarea "Question"                 ("Who founded it?" sent)
Shift+Tab    -> link "Contact page"                 (refusal contact links)
Shift+Tab    -> link "+923008642198"
Shift+Tab    -> link "info@aibitsoft.com"
```

Focus never fell to `<body>`, and every control was reached and operated from the keyboard.

## Playwright spec

`e2e/happy-path.spec.ts`, run with `npm run test:e2e`. In this sandbox `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` points it at the preinstalled browser. Result: **1 passed**.

It covers:
- the crawl: progress shown, "Ready", and the question field enabled and focused;
- the question, including the Stop button while streaming;
- the answer text copied from the page;
- 3 source links with the correct URL;
- a follow-up question.

It also asserts four invariants:
1. **The page never scrolls on desktop.** Only the conversation does.
2. **The composer stays in the viewport.**
3. **No request leaves localhost.** Every other host is blocked and recorded, which covers the DoD's "mock mode works with the network disconnected".
4. **Zero console errors or warnings.**

Each invariant was checked the same way: remove the thing it protects, confirm the spec fails, then restore.

| Invariant | Mutation | Result |
|---|---|---|
| Page does not scroll | Revert the `flex: none` layout fix | Failed with "Expected false, Received true" |
| No external requests | Add a Google Fonts stylesheet to `index.html` | Failed, listing the blocked URL |

## Bugs found by this phase and fixed

1. **A long conversation pushed the composer off-screen at 768 px and up.** `main` had `flex: 1` inside a content-sized column, so its basis resolved to the content height and overrode `height`. Fix: `flex: none; min-height: 0` at 48rem and up (`src/App.module.css`), guarded by the spec.
2. **Chrome warned "preloaded but not used" on repeat loads**, once the font was already in memory cache. Fix: removed the Phase 5 font preload; the reasoning is recorded in `docs/audit.md`.
3. **Early screenshots caught the Sources chevron mid-rotation.** This was capture timing, not a UI bug; the capture script now settles transitions first.

## Tooling note

`context().setOffline(true)` crashes the playwright-cli daemon (0.1.21), so the offline check lives in the `@playwright/test` spec as request blocking instead.
