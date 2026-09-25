import type { Source } from './types';

export interface SitePage {
  title: string;
  url: string;
  text: string;
}

export type MockAnswer =
  | { kind: 'answer'; text: string; sources: Source[] }
  | { kind: 'refused' };

// Share of the question's terms the best page must contain. Below this the mock
// refuses instead of guessing, mirroring the real backend's refusal behaviour.
export const REFUSAL_THRESHOLD = 0.75;
const MAX_SOURCES = 3;
const MAX_SENTENCES = 3;

const STOPWORDS = new Set(
  ('a an and are as at be but by can do does for from has have how i if in into is it its ' +
    'me much my of on or our so tell than that the their them there they this to us was we ' +
    'what when where which who why will with you your about any all also offer provide')
    .split(' '),
);

function stem(word: string): string {
  // Naive plural folding so "apps" matches "app"; good enough for keyword overlap.
  return word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem);
}

export function queryTerms(question: string): string[] {
  return [...new Set(tokenize(question).filter((word) => !STOPWORDS.has(word)))];
}

function joinWrappedLines(text: string): string[] {
  // The capture keeps one line per rendered block. A line that starts lowercase after a
  // line with no end punctuation is the same sentence wrapped across inline elements.
  const blocks: string[] = [];
  for (const line of text.split('\n')) {
    const previous = blocks.at(-1);
    if (previous !== undefined && !/[.!?:]$/.test(previous) && /^[a-z]/.test(line)) {
      blocks[blocks.length - 1] = `${previous} ${line}`;
    } else {
      blocks.push(line);
    }
  }
  return blocks;
}

export function splitSentences(text: string): string[] {
  // Some site text lacks a space after a full stop ("growth.Every"), so split on
  // terminal punctuation followed by a capital, with or without a space.
  return joinWrappedLines(text)
    .flatMap((block) => block.split(/(?<=[.!?])\s*(?=[A-Z0-9])/))
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function isProse(sentence: string): boolean {
  // Buttons and headings ("Learn More", "OUR SERVICES") have no end punctuation.
  return /[.!?]$/.test(sentence) && sentence.split(' ').length >= 4;
}

export function scorePage(terms: string[], page: SitePage): number {
  if (terms.length === 0) return 0;
  const words = new Set(tokenize(`${page.title} ${page.text}`));
  return terms.filter((term) => words.has(term)).length / terms.length;
}

function isAnswer(sentence: string | undefined): sentence is string {
  return sentence !== undefined && /[.!]$/.test(sentence);
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

function titleHits(terms: string[], page: SitePage): number {
  const words = new Set(tokenize(page.title));
  return terms.filter((term) => words.has(term)).length;
}

export function answerQuestion(question: string, pages: SitePage[]): MockAnswer {
  const terms = queryTerms(question);
  const ranked = pages
    .map((page) => ({ page, score: scorePage(terms, page), inTitle: titleHits(terms, page) }))
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
