// ASSUMED contract: the FastAPI source is not available. httpClient.ts is the only
// file that knows the wire format; if the real API differs, map it there to these types.

export type CrawlBudget = 20 | 60 | 120;

export const CRAWL_BUDGETS: readonly CrawlBudget[] = [20, 60, 120];

export type CrawlState = 'running' | 'done' | 'cancelled' | 'error';

export interface CrawledPage {
  title: string;
  url: string;
}

export interface CrawlStatus {
  status: CrawlState;
  pages_crawled: number;
  max_pages: CrawlBudget;
  current_url?: string;
  error?: string;
  /** Assumed optional: pages crawled so far. Without it the page list and suggestions are hidden. */
  pages?: CrawledPage[];
}

export interface Source {
  title: string;
  url: string;
  score: number;
}

export interface Contact {
  email?: string;
  phone?: string;
  url?: string;
}

export type ChatEvent =
  | { type: 'token'; text: string }
  | { type: 'sources'; items: Source[] }
  | { type: 'refused'; reason: string; contact: Contact }
  | { type: 'done' };

export class ApiError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
