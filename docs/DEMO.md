# SiteChat demo

Run `npm run dev` (mock mode) and open `http://localhost:5173` at desktop width, with DevTools ready for device mode. It needs no internet.

## 3-minute script

| Time | Do | Say |
|---|---|---|
| 0:00–0:20 | Show the header badge "Demo data". | "SiteChat crawls a site and answers questions only from its pages. This is mock mode: the same UI, over 20 pages I captured from aibitsoft.com, so it runs offline. With one environment variable it talks to the FastAPI backend instead." |
| 0:20–0:50 | Change the URL to `ftp://aibitsoft.com` and press Enter. Fix it, arrow to 60 pages, then Start crawl. | "Validation uses `new URL()`, http and https only, and focus goes to the field so a screen reader reads the error. The page budget is a real radio group. Progress is polled once a second, and the page count never truncates, even on a phone." |
| 0:50–1:30 | Ask "Do you use React?", then "Do you build mobile apps?". Press Stop within about 2 seconds of sending the second, ask it again, and open Sources. | "It streams over fetch, because EventSource can't POST. Stop aborts the request itself and keeps the partial answer. Every sentence is copied word for word from a crawled page, and here are the sources." |
| 1:30–1:55 | Ask "Who founded it?". | "The pages don't say, so it refuses. That's a calm information state, not an error, and it offers the contact details it found on the site." |
| 1:55–2:20 | Switch DevTools to 360 px. | "On a phone it's one column, and after the crawl the panel collapses into a sticky bar. The composer stays pinned above the keyboard." |
| 2:20–2:45 | Open `/?simulate=chat-error`, crawl, ask, then Retry. | "This is the network-error state. Retry re-sends the last question without duplicating it in the transcript." |
| 2:45–3:00 | Open `src/api/httpClient.ts`. | "The backend contract is assumed, so this is the one file that knows it. There are 52 unit tests, an end-to-end test that also proves the demo needs no internet, and an accessibility audit in `docs/audit.md`." |

## Questions to ask live

These answer correctly, with sources, from the captured pages.

| Question | Answers from |
|---|---|
| Do you use React? | IT Staff Augmentation ("Ship React, Next.js, Laravel, Node.js, and PHP apps that scale.") |
| Do you do React development? | IT Staff Augmentation |
| Do you build mobile apps? | Mobile Experiences |
| Do you offer IT staff augmentation? | IT Staff Augmentation |
| Can you build an MVP? | MVP Development |
| Do you do SEO? | SEO & AI SEO |
| Can you help with digital marketing? | Digital Marketing |
| What does AiBit Soft do? | Homepage |
| How soon can we meet? | Book an Expert (FAQ) |
| Is the expert call free? | Book an Expert (FAQ) |

To show a refusal on purpose, ask "Who founded it?" or "How much does it cost?". The pages do not say, so SiteChat refuses and offers the site's email, phone and contact page.

## Questions to avoid live

These are known false negatives: the pages do answer them, but the mock's keyword matching does not find it.

| Question | Why it refuses |
|---|---|
| What technologies do you use? | The page that lists the stack never uses the word "technology". |
| Are you hiring? | No captured page uses the word "hiring". |
| do you do react? (lowercase) | A one-word question only counts in full when the name is capitalised. |

## What the answers are

Answers are sentences copied word for word from aibitsoft.com, so they are the company's own marketing copy, not neutral facts. SiteChat reports what the site says; that is expected behaviour, not a bug.

## Likely panel questions

1. **How does the streaming work?**
   `httpClient.ask` POSTs with `fetch` and reads `response.body` through `readSse` in `sseParser.ts`. That uses a `TextDecoder` in streaming mode and buffers partial lines until a blank line completes an event. Each event becomes a reducer action in `useChatStream`.

2. **Why not `EventSource`?**
   It only does GET, so the question can't go in a request body, and it can't be cancelled with an `AbortSignal`. Parsing the stream myself cost about 70 lines, and the tests cover events split across chunks.

3. **How would you connect it to the real backend?**
   Set `VITE_API_MODE=http`, and Vite proxies `/api` to port 8000 (`vite.config.ts`). The contract is assumed, so any difference is fixed in `httpClient.ts` alone. Nothing else knows URLs or field names.

4. **How does cancelling work?**
   Every operation takes an `AbortController` signal: Stop, Cancel crawl, a new crawl, unmount. The hook checks `signal.aborted` to tell a user's cancel apart from a failure, so Stop keeps the partial answer as "stopped", not "error".

5. **Why `useReducer` instead of `useState`?**
   One stream event updates the text, the active answer, the error and the last question together. As a pure function, each transition is named and unit-tested without React, and late events after Stop are ignored in one place.

6. **What race conditions did you handle?**
   A slow cancel response can't overwrite a newer crawl, because it checks the job id. A new crawl remounts the chat by `key`, so an old stream can't write into it. The race test was checked by deleting the guard and watching it fail.

7. **How is it accessible?**
   The budget picker is a radio group with arrow keys. Answers are `aria-live` with `aria-busy` while streaming, so they're read once, not token by token. Focus is moved when a focused button disappears, contrast was measured (AA), and reduced motion is honoured. The whole flow was verified keyboard-only.

8. **How is it responsive?**
   From 768 px it's a CSS grid: crawl panel left, chat right, and only the conversation scrolls. Below that it's one column, with a sticky crawl bar and composer. The e2e test found that a long chat pushed the composer off-screen (a flex-basis bug), and now asserts it can't.

9. **How did you test it?**
   52 Vitest tests: the reducer (every action), the SSE parser edge cases, the mock refusal threshold, hook races, and the Composer, RefusalNotice and BudgetPicker. One Playwright happy path also asserts no page scroll on desktop, no requests leaving localhost, and a clean console. Each invariant was proven to fail when its fix is removed.

10. **What are the limits, and what would you do next?**
    The mock's keyword matching misses synonyms ("hiring" vs "careers"), and the API contract hasn't been verified against the real FastAPI service. Next steps: reconcile `httpClient.ts` with the backend, then add persistence, and virtualise long conversations if sessions grow.
