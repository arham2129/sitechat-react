import type { ChatEvent, CrawlBudget, CrawlStatus } from './types';

export type ApiMode = 'mock' | 'http';

// Components and hooks depend only on this interface, so the mock and the real
// backend are interchangeable without touching UI code.
export interface SiteChatClient {
  readonly mode: ApiMode;
  startCrawl(url: string, maxPages: CrawlBudget, signal?: AbortSignal): Promise<string>;
  getCrawlStatus(jobId: string, signal?: AbortSignal): Promise<CrawlStatus>;
  cancelCrawl(jobId: string): Promise<void>;
  ask(question: string, jobId: string, signal?: AbortSignal): AsyncIterable<ChatEvent>;
}

export function resolveApiMode(value: string | undefined): ApiMode {
  // Anything other than an explicit "http" falls back to mock, so a typo in .env
  // can never point the interview demo at a backend that is not running.
  return value === 'http' ? 'http' : 'mock';
}
