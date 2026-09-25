# Decisions

Format: **Decision** · Alternative rejected · Why. Each entry points to the code that implements it.

1. **`useReducer` for chat state** (`src/state/chatReducer.ts`) · `useState` per field · A single stream event changes several fields together: the message text, which answer is active, the error, and the last question. As one pure function, every transition is named, testable without React (11 tests covering every action), and can refuse impossible ones. For example, a token that arrives after Stop is dropped because no answer is active.

2. **`fetch` + `ReadableStream` + a hand-written SSE parser** (`src/api/sseParser.ts`) · `EventSource` · `EventSource` can only send GET, so it cannot carry the question in a POST body, and it cannot be cancelled with an `AbortSignal`. Reading the body myself also meant handling what the network actually does: events split across chunks, a `\r\n` split in two, and a multi-byte character split between two byte chunks. Each case has a test.

3. **An adapter interface with two implementations** (`SiteChatClient` in `src/api/client.ts`; `mockClient.ts`, `httpClient.ts`) · Calling `fetch` inside hooks, or intercepting requests with MSW · The UI depends only on the interface, so the offline demo and the real backend are interchangeable through one environment variable. Only `httpClient.ts` knows the assumed wire format, so reconciling with the real FastAPI service is one file. MSW would have added a dependency outside the brief's allowed list.

4. **CSS Modules + custom-property tokens** (`src/styles/tokens.css`, `*.module.css`) · Tailwind · Class names are scoped per component without a naming convention to police. Each token is named in `docs/DESIGN.md` with its role and measured contrast. A reviewer reads plain CSS with no build plugin. The brief also ruled out Tailwind and UI kits.

5. **Polling crawl status every 1 s** (`useCrawlJob`, `POLL_INTERVAL_MS`) · Streaming progress over SSE or WebSocket · Crawl progress is coarse (a page count), so a one-second poll is as informative as a stream at a fraction of the complexity. It keeps the backend's crawl endpoint a plain GET. Cancelling is just aborting the next request. A streaming connection would need reconnect logic for a number that changes about once a second.

6. **`AbortController` for every cancellable operation** (`useCrawlJob`, `useChatStream`, `abortableSleep.ts`) · "Ignore the result" flags · Aborting stops the work itself: the network request, the mock's timers, the poll loop. It also tells cancellation apart from failure, since `signal.aborted` means the user chose it and it is not an error. Stop, Cancel crawl, a new crawl, and unmount all run through this one mechanism.

7. **State lives in two hooks, not a global store** (`useCrawlJob` in `App`, `useChatStream` in `ChatView`) · Context, Redux or Zustand · There are two independent state machines, and the only thing they share is the crawl job id, passed as a prop. A store would add indirection and a dependency for no sharing benefit. Components stay presentational: they call hooks and render what comes back.

8. **Reset the chat by remounting it with `key={jobId}`** (`src/App.tsx`) · A `reset` action in the reducer · With a reset action, a slow stream from the previous crawl could still dispatch into the new conversation. Remounting destroys the old hook, whose unmount aborts its stream, so that cannot happen. "Change site" keeps the previous key until a new crawl starts, which is what makes it undoable.

9. **Mock answers are sentences copied from real pages** (`src/api/mockSearch.ts`, `src/mocks/site.json`) · Generated or templated answers · The demo runs on AiBit Soft's own site, so an invented fact would be both wrong and embarrassing. Pages are ranked by keyword overlap weighted by how rare each word is (IDF), and anything below a 0.75 match is refused. Measured on 34 labelled questions: no wrong answers, and 2 wrong refusals, both vocabulary gaps (`docs/DEMO.md`).

10. **A refusal is a calm information state, not an error** (`RefusalNotice`) · Showing it as an error · Refusing to guess is the product working as designed. It uses the blue tint, never the danger colour or `role="alert"`, and offers the site's contact links as the next step. A test checks that it does not announce as an alert.

11. **Focus is managed when the focused control disappears** (`useFocusWhenLost`, `useComposer`) · Leaving it to the browser · Start, Cancel and Stop each unmount or become disabled after use, which drops focus to `<body>`. Focus now moves to the crawl panel while it is busy, and to the question field when the crawl finishes or after Stop. It only moves when focus was actually lost, so it never overrides a user's choice. The whole flow was verified keyboard-only (`docs/verification.md`).

12. **Inter self-hosted from `public/fonts`, not preloaded** (`src/styles/global.css`) · Google Fonts, or a `<link rel="preload">` · Google Fonts breaks the offline demo. An earlier preload made Chrome warn "preloaded but not used" on every repeat load, which broke the zero-console-warnings requirement. The render-blocking stylesheet already requests the 48 KB font immediately, so the preload bought almost nothing.
