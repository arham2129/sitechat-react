import site from '../mocks/site.json';
import { abortableSleep } from './abortableSleep';
import type { SiteChatClient } from './client';
import { answerQuestion } from './mockSearch';
import { ApiError, type CrawlBudget, type CrawlStatus } from './types';

export interface MockOptions {
  /** Milliseconds per crawled page. */
  tickMs?: number;
  /** Milliseconds per streamed token (~25 ms reads like a live model). */
  tokenMs?: number;
  /**
   * Fail this many chat requests before succeeding, to show the network-error state
   * and a working Retry without a network.
   */
  chatFailures?: number;
}

interface Job {
  maxPages: CrawlBudget;
  startedAt: number;
  cancelledAt?: number;
  error?: string;
}

const DEMO_HOST = 'aibitsoft.com';
const REFUSAL_REASON = "I couldn't find an answer to that on the crawled pages.";

export function createMockClient(options: MockOptions = {}): SiteChatClient {
  const { tickMs = 150, tokenMs = 25 } = options;
  let chatFailures = options.chatFailures ?? 0;
  const jobs = new Map<string, Job>();
  let nextId = 1;

  const getJob = (jobId: string): Job => {
    const job = jobs.get(jobId);
    if (!job) throw new ApiError('Unknown crawl job', 404);
    return job;
  };

  const statusOf = (job: Job): CrawlStatus => {
    if (job.error) {
      return { status: 'error', pages_crawled: 0, max_pages: job.maxPages, error: job.error };
    }
    // The snapshot has 20 pages, so a bigger budget finishes early, as a real crawl
    // of a small site would.
    const available = Math.min(job.maxPages, site.pages.length);
    const elapsed = (job.cancelledAt ?? Date.now()) - job.startedAt;
    const crawled = tickMs > 0 ? Math.min(available, Math.floor(elapsed / tickMs)) : available;
    const status = job.cancelledAt ? 'cancelled' : crawled >= available ? 'done' : 'running';
    return {
      status,
      pages_crawled: crawled,
      max_pages: job.maxPages,
      current_url: status === 'running' ? site.pages[crawled]?.url : undefined,
    };
  };

  return {
    mode: 'mock',

    async startCrawl(url: string, maxPages: CrawlBudget, signal?: AbortSignal) {
      await abortableSleep(300, signal);
      const host = new URL(url).hostname.replace(/^www\./, '');
      const id = `mock-${nextId++}`;
      jobs.set(id, {
        maxPages,
        startedAt: Date.now(),
        error:
          host === DEMO_HOST
            ? undefined
            : `Demo data only covers ${DEMO_HOST}. Switch to live mode to crawl other sites.`,
      });
      return id;
    },

    async getCrawlStatus(jobId: string, signal?: AbortSignal) {
      await abortableSleep(80, signal);
      return statusOf(getJob(jobId));
    },

    async cancelCrawl(jobId: string) {
      await abortableSleep(150);
      const job = getJob(jobId);
      if (statusOf(job).status === 'running') job.cancelledAt = Date.now();
    },

    async *ask(question: string, jobId: string, signal?: AbortSignal) {
      const status = statusOf(getJob(jobId));
      if (status.status !== 'done') throw new ApiError('Crawl is not finished', 409);
      await abortableSleep(400, signal);
      if (chatFailures > 0) {
        chatFailures -= 1;
        throw new ApiError('Could not reach the SiteChat server');
      }

      const result = answerQuestion(question, site.pages.slice(0, status.pages_crawled));
      if (result.kind === 'refused') {
        yield { type: 'refused', reason: REFUSAL_REASON, contact: site.contact };
        yield { type: 'done' };
        return;
      }
      for (const token of result.text.match(/\S+\s*/g) ?? []) {
        await abortableSleep(tokenMs, signal);
        yield { type: 'token', text: token };
      }
      yield { type: 'sources', items: result.sources };
      yield { type: 'done' };
    },
  };
}
