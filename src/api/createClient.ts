import { resolveApiMode, type SiteChatClient } from './client';
import { createHttpClient } from './httpClient';
import { createMockClient } from './mockClient';

// ?simulate=chat-error makes the first question fail, so the error state and Retry
// can be demonstrated (and screenshotted) offline. Mock mode only.
function simulatedChatFailures(): number {
  if (typeof window === 'undefined') return 0;
  return new URLSearchParams(window.location.search).get('simulate') === 'chat-error' ? 1 : 0;
}

export function createClient(mode = resolveApiMode(import.meta.env.VITE_API_MODE)): SiteChatClient {
  return mode === 'http' ? createHttpClient() : createMockClient({ chatFailures: simulatedChatFailures() });
}
