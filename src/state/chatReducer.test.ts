import { describe, expect, it } from 'vitest';
import { chatReducer, initialChatState, type ChatAction, type ChatState } from './chatReducer';

const contact = { email: 'info@aibitsoft.com' };
const source = { title: 'Services', url: 'https://aibitsoft.com/?page=services', score: 1 };

function run(...actions: ChatAction[]): ChatState {
  return actions.reduce(chatReducer, initialChatState);
}

const ask: ChatAction = { type: 'ask', question: 'What do you build?', questionId: 'q1', answerId: 'a1' };

describe('chatReducer', () => {
  it('ask appends the question and a streaming answer', () => {
    const state = run(ask);
    expect(state.messages.map((m) => [m.id, m.role, m.state])).toEqual([
      ['q1', 'user', 'complete'],
      ['a1', 'assistant', 'streaming'],
    ]);
    expect(state.activeId).toBe('a1');
    expect(state.lastQuestion).toBe('What do you build?');
  });

  it('ask is ignored while an answer is streaming', () => {
    const state = run(ask, { ...ask, questionId: 'q2', answerId: 'a2' });
    expect(state.messages).toHaveLength(2);
  });

  it('token appends text to the active answer', () => {
    const state = run(ask, { type: 'token', text: 'We ' }, { type: 'token', text: 'build.' });
    expect(state.messages[1]?.text).toBe('We build.');
  });

  it('sources attaches items to the active answer', () => {
    const state = run(ask, { type: 'sources', items: [source] });
    expect(state.messages[1]?.sources).toEqual([source]);
  });

  it('refused attaches the reason and contact', () => {
    const state = run(ask, { type: 'refused', reason: 'Not found', contact });
    expect(state.messages[1]?.refusal).toEqual({ reason: 'Not found', contact });
  });

  it('done completes the answer and clears the active id', () => {
    const state = run(ask, { type: 'token', text: 'Hi' }, { type: 'done' });
    expect(state.messages[1]?.state).toBe('complete');
    expect(state.activeId).toBeNull();
  });

  it('stopped keeps the partial text and marks it stopped', () => {
    const state = run(ask, { type: 'token', text: 'Part' }, { type: 'stopped' });
    expect(state.messages[1]).toMatchObject({ text: 'Part', state: 'stopped' });
    expect(state.activeId).toBeNull();
  });

  it('failed marks the answer as an error and records the message', () => {
    const state = run(ask, { type: 'failed', error: 'Network down' });
    expect(state.messages[1]?.state).toBe('error');
    expect(state.error).toBe('Network down');
    expect(state.activeId).toBeNull();
  });

  it('retry replaces the failed answer without repeating the question', () => {
    const state = run(ask, { type: 'failed', error: 'Network down' }, { type: 'retry', answerId: 'a2' });
    expect(state.messages.map((m) => [m.id, m.state])).toEqual([
      ['q1', 'complete'],
      ['a2', 'streaming'],
    ]);
    expect(state.activeId).toBe('a2');
    expect(state.error).toBeNull();
  });

  it('retry is ignored when nothing has been asked', () => {
    expect(run({ type: 'retry', answerId: 'a1' })).toBe(initialChatState);
  });

  it('stream events after the answer finished are ignored', () => {
    const finished = run(ask, { type: 'done' });
    for (const action of [
      { type: 'token', text: 'late' },
      { type: 'sources', items: [source] },
      { type: 'refused', reason: 'x', contact },
      { type: 'done' },
      { type: 'stopped' },
      { type: 'failed', error: 'x' },
    ] satisfies ChatAction[]) {
      expect(chatReducer(finished, action)).toBe(finished);
    }
  });
});
