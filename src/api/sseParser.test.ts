// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createSseParser, readSse, type SseMessage } from './sseParser';

function parse(chunks: string[]): SseMessage[] {
  const messages: SseMessage[] = [];
  const parser = createSseParser((m) => messages.push(m));
  chunks.forEach((chunk) => parser.push(chunk));
  parser.end();
  return messages;
}

const token = (text: string) => ({ event: 'token', data: JSON.stringify({ text }) });

describe('createSseParser', () => {
  it('parses multiple events in one chunk', () => {
    const chunk = 'event: token\ndata: {"text":"Hi"}\n\nevent: token\ndata: {"text":" there"}\n\nevent: done\ndata: {}\n\n';
    expect(parse([chunk])).toEqual([token('Hi'), token(' there'), { event: 'done', data: '{}' }]);
  });

  it('reassembles an event split across chunk boundaries', () => {
    const whole = 'event: token\ndata: {"text":"Hello"}\n\n';
    for (let cut = 1; cut < whole.length; cut++) {
      expect(parse([whole.slice(0, cut), whole.slice(cut)])).toEqual([token('Hello')]);
    }
  });

  it('handles CRLF line endings split between the CR and the LF', () => {
    expect(parse(['event: token\r', '\ndata: {"text":"a"}\r\n\r', '\n'])).toEqual([token('a')]);
  });

  it('skips a malformed line and keeps parsing', () => {
    const chunk = 'this line has no colon\nevent: token\n: a comment\nretry: 3000\ndata: {"text":"ok"}\n\n';
    expect(parse([chunk])).toEqual([token('ok')]);
  });

  it('joins multi-line data with newlines and defaults the event name', () => {
    expect(parse(['data: one\ndata: two\n\n'])).toEqual([{ event: 'message', data: 'one\ntwo' }]);
  });

  it('does not emit a blank-line block with no data', () => {
    expect(parse(['event: token\n\n'])).toEqual([]);
  });

  it('flushes a final event that lacks a trailing blank line', () => {
    expect(parse(['event: done\ndata: {}'])).toEqual([{ event: 'done', data: '{}' }]);
  });
});

describe('readSse', () => {
  it('decodes a multi-byte character split across byte chunks', async () => {
    const bytes = new TextEncoder().encode('event: token\ndata: {"text":"café"}\n\n');
    const split = bytes.length - 5; // inside the two-byte "é"
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    });
    const messages: SseMessage[] = [];
    for await (const message of readSse(stream)) messages.push(message);
    expect(messages).toEqual([token('café')]);
  });
});
