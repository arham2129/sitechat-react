import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { deferred, fakeClient } from '../test/fakeClient';
import { useCrawlJob } from './useCrawlJob';

const POLL = { pollIntervalMs: 10 };

describe('useCrawlJob', () => {
  it('polls until cancelled, then stops polling', async () => {
    const client = fakeClient();
    const { result } = renderHook(() => useCrawlJob(client, POLL));

    act(() => void result.current.start('https://aibitsoft.com', 20));
    await waitFor(() => expect(vi.mocked(client.getCrawlStatus).mock.calls.length).toBeGreaterThan(1));
    await act(() => result.current.cancel());

    expect(result.current.job.phase).toBe('cancelled');
    expect(client.cancelCrawl).toHaveBeenCalledWith('job-1');
    const callsAtCancel = vi.mocked(client.getCrawlStatus).mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(client.getCrawlStatus).toHaveBeenCalledTimes(callsAtCancel);
  });

  it('a slow cancel does not overwrite a crawl started after it', async () => {
    const cancelResponse = deferred();
    const client = fakeClient({
      startCrawl: vi.fn().mockResolvedValueOnce('job-1').mockResolvedValueOnce('job-2'),
      cancelCrawl: vi.fn(() => cancelResponse.promise),
    });
    const { result } = renderHook(() => useCrawlJob(client, POLL));

    act(() => void result.current.start('https://aibitsoft.com', 20));
    await waitFor(() => expect(result.current.job).toMatchObject({ phase: 'running', jobId: 'job-1' }));

    let pendingCancel!: Promise<void>;
    act(() => {
      pendingCancel = result.current.cancel();
    });
    act(() => void result.current.start('https://aibitsoft.com', 60));
    await waitFor(() => expect(result.current.job).toMatchObject({ phase: 'running', jobId: 'job-2' }));

    await act(async () => {
      cancelResponse.resolve();
      await pendingCancel;
    });
    expect(result.current.job).toMatchObject({ phase: 'running', jobId: 'job-2' });
  });

  it('aborts the in-flight poll on unmount', async () => {
    const client = fakeClient();
    const { result, unmount } = renderHook(() => useCrawlJob(client, POLL));

    act(() => void result.current.start('https://aibitsoft.com', 20));
    await waitFor(() => expect(client.getCrawlStatus).toHaveBeenCalled());
    const signal = vi.mocked(client.getCrawlStatus).mock.calls[0]?.[1];
    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it('reports a failed start as an error', async () => {
    const client = fakeClient({ startCrawl: vi.fn().mockRejectedValue(new Error('Server down')) });
    const { result } = renderHook(() => useCrawlJob(client, POLL));

    await act(() => result.current.start('https://aibitsoft.com', 20));

    expect(result.current.job).toMatchObject({ phase: 'error', error: 'Server down' });
  });
});
