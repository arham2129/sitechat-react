import { resolveApiMode, type SiteChatClient } from './client';
import { createHttpClient } from './httpClient';
import { createMockClient } from './mockClient';

export function createClient(mode = resolveApiMode(import.meta.env.VITE_API_MODE)): SiteChatClient {
  return mode === 'http' ? createHttpClient() : createMockClient();
}
