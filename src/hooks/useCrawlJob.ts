import { useCallback, useEffect, useRef, useState } from 'react';
import { abortableSleep } from '../api/abortableSleep';
import type { SiteChatClient } from '../api/client';
import type { CrawlBudget, CrawlStatus } from '../api/types';

export const POLL_INTERVAL_MS = 1000;

export type CrawlPhase = 'idle' | 'starting' | 'running' | 'done' | 'cancelled' | 'error';

export interface CrawlJob {
  phase: CrawlPhase;
  url: string | null;
  budget: CrawlBudget | null;
  jobId: string | null;
  status: CrawlStatus | null;
  error: string | null;
  /** The finished crawl that "Change site" left, kept so it can be restored until a new crawl starts. */
  previous: CrawlJob | null;
}

const IDLE: CrawlJob = {
  phase: 'idle',
  url: null,
  budget: null,
  jobId: null,
  status: null,
  error: null,
  previous: null,
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function useCrawlJob(client: SiteChatClient, { pollIntervalMs = POLL_INTERVAL_MS } = {}) {
  const [job, setJob] = useState<CrawlJob>(IDLE);
  const controllerRef = useRef<AbortController | null>(null);

  const stopPolling = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  // Polling must not outlive the component, or it would set state after unmount.
  useEffect(() => stopPolling, [stopPolling]);

  const start = useCallback(
    async (url: string, budget: CrawlBudget) => {
      stopPolling();
      const controller = new AbortController();
      controllerRef.current = controller;
      const { signal } = controller;
      setJob({ ...IDLE, phase: 'starting', url, budget });
      try {
        const jobId = await client.startCrawl(url, budget, signal);
        setJob((prev) => ({ ...prev, phase: 'running', jobId }));
        for (;;) {
          const status = await client.getCrawlStatus(jobId, signal);
          setJob((prev) => ({ ...prev, phase: status.status, status, error: status.error ?? null }));
          if (status.status !== 'running') break;
          await abortableSleep(pollIntervalMs, signal);
        }
      } catch (error) {
        // An abort is a deliberate cancel, reset or unmount, not a failure to report.
        if (signal.aborted) return;
        setJob((prev) => ({ ...prev, phase: 'error', error: messageOf(error) }));
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [client, pollIntervalMs, stopPolling],
  );

  const cancel = useCallback(async () => {
    const { jobId } = job;
    stopPolling();
    if (!jobId) {
      setJob(IDLE);
      return;
    }
    // The guard stops a slow cancel response from overwriting a crawl started since.
    try {
      await client.cancelCrawl(jobId);
      setJob((prev) => (prev.jobId === jobId ? { ...prev, phase: 'cancelled' } : prev));
    } catch (error) {
      setJob((prev) => (prev.jobId === jobId ? { ...prev, phase: 'error', error: messageOf(error) } : prev));
    }
  }, [client, job, stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    // Keep the last address and budget so the form reopens ready to edit, and keep a
    // finished crawl so "Change site" is undoable until a new crawl actually starts.
    setJob((prev) => ({
      ...IDLE,
      url: prev.url,
      budget: prev.budget,
      previous: prev.phase === 'done' ? prev : prev.previous,
    }));
  }, [stopPolling]);

  const restore = useCallback(() => setJob((prev) => prev.previous ?? prev), []);

  return { job, start, cancel, reset, restore };
}
