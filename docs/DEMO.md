# SiteChat demo

The 3-minute script and likely panel questions are written in Phase 7. This section is the question guide for the live demo, checked against the mock (demo data) with a 20-page crawl of aibitsoft.com.

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

To show the network error and Retry offline, open the app with `?simulate=chat-error`. The first question fails and Retry succeeds.

## Questions to avoid live

These are known false negatives: the pages do answer them, but the mock's keyword matching does not find it.

| Question | Why it refuses |
|---|---|
| What technologies do you use? | The page that lists the stack never uses the word "technology". |
| Are you hiring? | No captured page uses the word "hiring". |
| do you do react? (lowercase) | A one-word question only counts in full when the name is capitalised. |

## What the answers are

Answers are sentences copied word for word from aibitsoft.com, so they are the company's own marketing copy, not neutral facts. SiteChat reports what the site says; that is expected behaviour, not a bug.
