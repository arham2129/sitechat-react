import { useCallback, useEffect, useRef, useState } from 'react';
import { abortableSleep } from '../api/abortableSleep';
import type { SiteChatClient } from '../api/client';
import type { CrawlBudget, CrawlStatus } from '../api/types';

export const POLL_INTERVAL_MS = 1000;

export type CrawlPhase = 'idle' | 'starting' | 'running' | 'done' | 'cancelled' | 'error';

export interface CrawlJob {
  phase: CrawlPhase;
  url: string | null;
  jobId: string | null;
  status: CrawlStatus | null;
  error: string | null;
}

const IDLE: CrawlJob = { phase: 'idle', url: null, jobId: null, status: null, error: null };

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
      setJob({ ...IDLE, phase: 'starting', url });
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
    setJob(IDLE);
  }, [stopPolling]);

  return { job, start, cancel, reset };
}
