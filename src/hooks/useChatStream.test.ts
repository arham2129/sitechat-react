import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { abortableSleep } from '../api/abortableSleep';
import { ApiError, type ChatEvent } from '../api/types';
import { fakeClient } from '../test/fakeClient';
import { useChatStream } from './useChatStream';

describe('useChatStream', () => {
  it('stop aborts the stream and keeps the partial answer', async () => {
    const ask = vi.fn(async function* (_q: string, _id: string, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
      yield { type: 'token', text: 'Partial ' };
      await abortableSleep(10_000, signal);
      yield { type: 'token', text: 'never shown' };
    });
    const { result } = renderHook(() => useChatStream(fakeClient({ ask }), 'job-1'));

    act(() => result.current.ask('What do you build?'));
    await waitFor(() => expect(result.current.messages[1]?.text).toBe('Partial '));
    act(() => result.current.ask('A second question while streaming'));
    act(() => result.current.stop());

    await waitFor(() => expect(result.current.isStreaming).toBe(false));
    expect(result.current.messages[1]).toMatchObject({ text: 'Partial ', state: 'stopped' });
    expect(result.current.messages).toHaveLength(2);
    expect(ask).toHaveBeenCalledTimes(1);
    expect(ask.mock.calls[0]?.[2]?.aborted).toBe(true);
  });

  it('retry re-sends the last question after a network error', async () => {
    const ask = vi
      .fn()
      // eslint-disable-next-line require-yield -- the first attempt fails before streaming
      .mockImplementationOnce(async function* () {
        throw new ApiError('Could not reach the SiteChat server');
      })
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'We build web apps.' };
        yield { type: 'done' };
      });
    const { result } = renderHook(() => useChatStream(fakeClient({ ask }), 'job-1'));

    act(() => result.current.ask('What do you build?'));
    await waitFor(() => expect(result.current.error).toBe('Could not reach the SiteChat server'));
    expect(result.current.messages[1]?.state).toBe('error');

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.messages[1]?.state).toBe('complete'));

    expect(result.current.messages.map((m) => [m.role, m.text])).toEqual([
      ['user', 'What do you build?'],
      ['assistant', 'We build web apps.'],
    ]);
    expect(result.current.error).toBeNull();
    expect(ask.mock.calls.map((call) => call[0])).toEqual(['What do you build?', 'What do you build?']);
  });

  it('ignores blank questions and questions before the crawl is done', () => {
    const ask = vi.fn();
    const { result, rerender } = renderHook(({ jobId }) => useChatStream(fakeClient({ ask }), jobId), {
      initialProps: { jobId: null as string | null },
    });
    act(() => result.current.ask('What do you build?'));
    rerender({ jobId: 'job-1' });
    act(() => result.current.ask('   '));
    expect(ask).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });
});
