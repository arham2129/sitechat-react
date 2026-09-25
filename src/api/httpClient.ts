import type { SiteChatClient } from './client';
import { readSse, type SseMessage } from './sseParser';
import { ApiError, type ChatEvent, type CrawlBudget, type CrawlStatus } from './types';

// The only file that knows the backend's wire format. Reconciling with the real
// FastAPI service should mean editing this file and nothing else.
const BASE_URL = '/api';

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

function postJson(body: unknown, signal?: AbortSignal): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  };
}

function parseData(message: SseMessage): Record<string, unknown> {
  try {
    return JSON.parse(message.data) as Record<string, unknown>;
  } catch {
    throw new ApiError(`Malformed "${message.event}" event from the chat stream`);
  }
}

function toChatEvent(message: SseMessage): ChatEvent | null {
  switch (message.event) {
    case 'token':
      return { type: 'token', text: String(parseData(message).text ?? '') };
    case 'sources': {
      const items = parseData(message).items;
      return { type: 'sources', items: Array.isArray(items) ? items : [] };
    }
    case 'refused': {
      const data = parseData(message);
      return {
        type: 'refused',
        reason: String(data.reason ?? ''),
        contact: (data.contact ?? {}) as Extract<ChatEvent, { type: 'refused' }>['contact'],
      };
    }
    case 'done':
      return { type: 'done' };
    default:
      // Forward compatibility: a new event type from the backend should not break the UI.
      return null;
  }
}

export function createHttpClient(): SiteChatClient {
  return {
    mode: 'http',

    async startCrawl(url: string, maxPages: CrawlBudget, signal?: AbortSignal) {
      const body = await request<{ job_id: string }>(
        '/crawl',
        postJson({ url, max_pages: maxPages }, signal),
      );
      return body.job_id;
    },

    getCrawlStatus(jobId: string, signal?: AbortSignal) {
      return request<CrawlStatus>(`/crawl/${encodeURIComponent(jobId)}`, { signal });
    },

    async cancelCrawl(jobId: string) {
      await request(`/crawl/${encodeURIComponent(jobId)}/cancel`, postJson({}));
    },

    async *ask(question: string, jobId: string, signal?: AbortSignal) {
      const response = await fetch(`${BASE_URL}/chat`, {
        ...postJson({ question, job_id: jobId }, signal),
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      });
      if (!response.ok || !response.body) {
        throw new ApiError(`Chat request failed with ${response.status}`, response.status);
      }
      for await (const message of readSse(response.body)) {
        const event = toChatEvent(message);
        if (!event) continue;
        yield event;
        if (event.type === 'done') return;
      }
      // A stream that closes without "done" was cut off, so the answer may be partial.
      throw new ApiError('The chat stream ended before the answer finished');
    },
  };
}
