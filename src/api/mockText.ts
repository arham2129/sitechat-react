const STOPWORDS = new Set(
  ('a an and are as at be but by can do does for from has have how i if in into is it its ' +
    'me much my of on or our so tell than that the their them there they this to us was we ' +
    'what when where which who why will with you your about any all also offer provide ' +
    // Question verbs: "Do you use React?" is about React, not about using.
    'know use using work help make get need want able')
    .split(' '),
);

function stem(word: string): string {
  // Naive plural folding so "apps" matches "app" and "technologies" matches "technology".
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function tokenize(text: string): string[] {
  return words(text).map(stem);
}

export function queryTerms(question: string): string[] {
  // Stopwords are removed before stemming, or "does" would survive as "doe".
  return [...new Set(words(question).filter((word) => !STOPWORDS.has(word)).map(stem))];
}

export function namedTerms(question: string): Set<string> {
  // A capitalised word the user typed ("React", "Laravel") names something specific.
  const capitalised = question.match(/\b[A-Z][A-Za-z0-9]*/g) ?? [];
  return new Set(capitalised.map((word) => word.toLowerCase()).filter((w) => !STOPWORDS.has(w)).map(stem));
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

export function isProse(sentence: string): boolean {
  // Buttons and headings ("Learn More", "OUR SERVICES") have no end punctuation.
  return /[.!?]$/.test(sentence) && sentence.split(' ').length >= 4;
}

export function isAnswer(sentence: string | undefined): sentence is string {
  return sentence !== undefined && /[.!]$/.test(sentence);
}
