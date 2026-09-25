// @vitest-environment node
import { describe, expect, it } from 'vitest';
import site from '../mocks/site.json';
import { createMockClient } from './mockClient';
import { answerQuestion, queryTerms, REFUSAL_THRESHOLD, scorePage, splitSentences } from './mockSearch';
import type { ChatEvent } from './types';

async function crawledClient(url = 'https://aibitsoft.com') {
  const client = createMockClient({ tickMs: 0, tokenMs: 0 });
  const jobId = await client.startCrawl(url, 20);
  return { client, jobId };
}

async function collect(events: AsyncIterable<ChatEvent>): Promise<ChatEvent[]> {
  const out: ChatEvent[] = [];
  for await (const event of events) out.push(event);
  return out;
}

function bestScore(question: string): number {
  const terms = queryTerms(question);
  return Math.max(...site.pages.map((page) => scorePage(terms, page)));
}

describe('mock search refusal threshold', () => {
  it('refuses when the best page scores below the threshold', () => {
    const question = 'What is the capital of France?';
    expect(bestScore(question)).toBeLessThan(REFUSAL_THRESHOLD);
    expect(answerQuestion(question, site.pages)).toEqual({ kind: 'refused' });
  });

  it('answers when the best page meets the threshold', () => {
    const question = 'Do you build mobile apps for iOS?';
    expect(bestScore(question)).toBeGreaterThanOrEqual(REFUSAL_THRESHOLD);
    expect(answerQuestion(question, site.pages).kind).toBe('answer');
  });

  it('answers an FAQ question with the answer that follows it on the page', () => {
    const result = answerQuestion('How soon can we meet?', site.pages);
    expect(result).toMatchObject({ kind: 'answer', text: expect.stringMatching(/^Typically within/) });
  });

  it('refuses when no pages were crawled', () => {
    expect(answerQuestion('Do you build mobile apps?', [])).toEqual({ kind: 'refused' });
  });

  it('answers only with sentences copied from the best page', () => {
    const result = answerQuestion('Do you offer SEO services?', site.pages);
    if (result.kind !== 'answer') throw new Error('expected an answer');
    const best = site.pages.find((page) => page.url === result.sources[0]?.url);
    // Verbatim up to whitespace: wrapped lines in the capture are rejoined with a space.
    const pageText = best?.text.replace(/\s+/g, ' ');
    for (const sentence of splitSentences(result.text)) expect(pageText).toContain(sentence);
    expect(result.sources.length).toBeLessThanOrEqual(3);
  });
});

describe('mock client', () => {
  it('streams tokens, then sources, then done', async () => {
    const { client, jobId } = await crawledClient();
    await client.getCrawlStatus(jobId);
    const events = await collect(client.ask('Do you build mobile apps?', jobId));
    expect(events[0]?.type).toBe('token');
    expect(events.slice(-2).map((e) => e.type)).toEqual(['sources', 'done']);
  });

  it('streams a refusal with the contact details from the site', async () => {
    const { client, jobId } = await crawledClient();
    const events = await collect(client.ask('What is the capital of France?', jobId));
    expect(events).toEqual([
      { type: 'refused', reason: expect.any(String), contact: site.contact },
      { type: 'done' },
    ]);
  });

  it('reports an error for sites outside the demo data', async () => {
    const { client, jobId } = await crawledClient('https://example.com');
    expect(await client.getCrawlStatus(jobId)).toMatchObject({ status: 'error' });
  });
});
