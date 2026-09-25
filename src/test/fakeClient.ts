import { vi } from 'vitest';
import type { SiteChatClient } from '../api/client';
import type { CrawlStatus } from '../api/types';

export function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export const running = (jobId: string): CrawlStatus => ({
  status: 'running',
  pages_crawled: 3,
  max_pages: 20,
  current_url: `https://aibitsoft.com/${jobId}`,
});

export function fakeClient(overrides: Partial<SiteChatClient> = {}): SiteChatClient {
  return {
    mode: 'mock',
    startCrawl: vi.fn(async () => 'job-1'),
    getCrawlStatus: vi.fn(async (jobId: string) => running(jobId)),
    cancelCrawl: vi.fn(async () => undefined),
    // eslint-disable-next-line require-yield -- tests override this per case
    ask: vi.fn(async function* () {
      throw new Error('ask not stubbed');
    }),
    ...overrides,
  };
}
