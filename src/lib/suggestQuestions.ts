import type { CrawledPage } from '../api/types';

// Turns crawled page titles into starter questions, so the first question is one
// the crawled pages can actually answer. The first page is skipped: it is the start
// URL, whose title is usually a tagline rather than a topic.
export function suggestQuestions(pages: CrawledPage[], max = 4): string[] {
  const topics = new Set<string>();
  for (const page of pages.slice(1)) {
    const topic = page.title
      .split(/\s+[—–|-]\s+/)[0]
      ?.replace(/^Our\s+/i, '')
      .trim();
    if (!topic || topic.length > 40 || /\bblog\b/i.test(topic)) continue;
    topics.add(topic);
    if (topics.size === max) break;
  }
  return [...topics].map((topic) => `Tell me about ${topic}`);
}
