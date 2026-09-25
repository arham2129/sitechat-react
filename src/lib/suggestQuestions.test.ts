// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { answerQuestion } from '../api/mockSearch';
import site from '../mocks/site.json';
import { suggestQuestions } from './suggestQuestions';

describe('suggestQuestions', () => {
  const suggestions = suggestQuestions(site.pages);

  it('builds up to 4 questions from page titles, skipping the start page and blogs', () => {
    expect(suggestions).toHaveLength(4);
    expect(suggestions.join(' ')).not.toMatch(/blog|Smart Digital Solutions/i);
    expect(suggestions[0]).toBe('Tell me about Services');
  });

  it('only suggests questions the crawled pages can answer', () => {
    for (const question of suggestions) expect(answerQuestion(question, site.pages).kind).toBe('answer');
  });

  it('suggests nothing when the backend sends no page list', () => {
    expect(suggestQuestions([])).toEqual([]);
  });
});
