import { isAnswer, isProse, namedTerms, queryTerms, splitSentences, tokenize } from './mockText';
import type { Source } from './types';

export interface SitePage {
  title: string;
  url: string;
  text: string;
}

export type MockAnswer =
  | { kind: 'answer'; text: string; sources: Source[] }
  | { kind: 'refused' };

// Share of the question's (rarity-weighted) terms the best page must contain. Below
// this the mock refuses instead of guessing, mirroring the real backend's refusal.
export const REFUSAL_THRESHOLD = 0.75;
const SINGLE_KEYWORD_WEIGHT = 0.5;
const MAX_SOURCES = 3;
const MAX_SENTENCES = 3;

function titleHits(terms: string[], page: SitePage): number {
  const words = new Set(tokenize(page.title));
  return terms.filter((term) => words.has(term)).length;
}

export interface Query {
  terms: string[];
  /** Inverse document frequency per term across the crawled pages. */
  weights: Map<string, number>;
  named: Set<string>;
}

export function analyzeQuery(question: string, pages: SitePage[]): Query {
  const terms = queryTerms(question);
  // A word on every page ("development") says nothing about which page answers, so it
  // weighs 0; a word on one page ("react") weighs the most.
  const pageWords = pages.map((page) => new Set(tokenize(`${page.title} ${page.text}`)));
  const weights = new Map(
    terms.map((term) => {
      const pagesWithTerm = pageWords.filter((set) => set.has(term)).length;
      return [term, Math.log((pages.length + 1) / (pagesWithTerm + 1))];
    }),
  );
  return { terms, weights, named: namedTerms(question) };
}

export function scorePage({ terms, weights, named }: Query, page: SitePage): number {
  if (terms.length === 0) return 0;
  const words = new Set(tokenize(`${page.title} ${page.text}`));
  const matched = terms.filter((term) => words.has(term));
  const weightOf = (list: string[]) => list.reduce((sum, term) => sum + (weights.get(term) ?? 0), 0);
  const total = weightOf(terms);
  // When every term is on every page, weights are all 0; fall back to plain overlap.
  const coverage = total > 0 ? weightOf(matched) / total : matched.length / terms.length;
  // A one-word question matched only in body text is weak evidence: "Where is your
  // office?" would otherwise match a careers blurb about office perks. A named thing
  // ("Do you do React?") is specific enough to count in full.
  const [only] = terms;
  const weak = terms.length === 1 && only !== undefined && !named.has(only) && titleHits(terms, page) === 0;
  return weak ? coverage * SINGLE_KEYWORD_WEIGHT : coverage;
}

function pickSentences(terms: string[], page: SitePage): string {
  const sentences = splitSentences(page.text);
  const hits = sentences.map((sentence, index) => {
    const words = new Set(tokenize(sentence));
    return { index, count: terms.filter((term) => words.has(term)).length };
  });
  const chosen = new Set<number>();
  for (const hit of hits.filter((h) => h.count > 0).sort((a, b) => b.count - a.count || a.index - b.index)) {
    if (chosen.size >= MAX_SENTENCES) break;
    if (sentences[hit.index]?.endsWith('?')) {
      // A matching FAQ question is answered by what follows it ("Yes. It's a free
      // session..."), which may start with a sentence too short to pass isProse.
      for (let i = hit.index + 1; i <= hit.index + 2 && isAnswer(sentences[i]); i++) chosen.add(i);
    } else if (isProse(sentences[hit.index] ?? '')) {
      chosen.add(hit.index);
    }
  }
  const indexes =
    chosen.size > 0 ? [...chosen] : sentences.flatMap((s, i) => (isProse(s) && isAnswer(s) ? [i] : [])).slice(0, 2);
  return indexes
    .sort((a, b) => a - b)
    .map((i) => sentences[i])
    .join(' ');
}

export function answerQuestion(question: string, pages: SitePage[]): MockAnswer {
  const query = analyzeQuery(question, pages);
  const { terms } = query;
  const ranked = pages
    .map((page) => ({ page, score: scorePage(query, page), inTitle: titleHits(terms, page) }))
    .filter((entry) => entry.score > 0)
    // Ties go to the page whose title names the topic, so "MVP development" answers
    // from the MVP page rather than the homepage that merely links to it.
    .sort((a, b) => b.score - a.score || b.inTitle - a.inTitle);
  const best = ranked[0];
  if (!best || best.score < REFUSAL_THRESHOLD) return { kind: 'refused' };
  return {
    kind: 'answer',
    // Only sentences copied verbatim from the page, so the mock never invents facts.
    text: pickSentences(terms, best.page),
    sources: ranked.slice(0, MAX_SOURCES).map(({ page, score }) => ({
      title: page.title,
      url: page.url,
      score: Math.round(score * 100) / 100,
    })),
  };
}
