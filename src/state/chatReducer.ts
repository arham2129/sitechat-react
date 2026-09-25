import type { Contact, Source } from '../api/types';

export type MessageState = 'streaming' | 'complete' | 'stopped' | 'error';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  state: MessageState;
  sources: Source[];
  refusal?: { reason: string; contact: Contact };
}

export interface ChatState {
  messages: ChatMessage[];
  /** The assistant message currently receiving stream events, if any. */
  activeId: string | null;
  error: string | null;
  /** Kept so Retry can re-send without the UI holding onto the question. */
  lastQuestion: string | null;
}

export type ChatAction =
  | { type: 'ask'; question: string; questionId: string; answerId: string }
  | { type: 'retry'; answerId: string }
  | { type: 'token'; text: string }
  | { type: 'sources'; items: Source[] }
  | { type: 'refused'; reason: string; contact: Contact }
  | { type: 'done' }
  | { type: 'stopped' }
  | { type: 'failed'; error: string };

export const initialChatState: ChatState = {
  messages: [],
  activeId: null,
  error: null,
  lastQuestion: null,
};

function assistant(id: string): ChatMessage {
  return { id, role: 'assistant', text: '', state: 'streaming', sources: [] };
}

function updateActive(state: ChatState, patch: (message: ChatMessage) => ChatMessage): ChatState {
  // Events that arrive after the stream ended (e.g. a late token after Stop) are dropped.
  if (state.activeId === null) return state;
  return {
    ...state,
    messages: state.messages.map((m) => (m.id === state.activeId ? patch(m) : m)),
  };
}

function finish(state: ChatState, messageState: MessageState): ChatState {
  if (state.activeId === null) return state;
  return { ...updateActive(state, (m) => ({ ...m, state: messageState })), activeId: null };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ask':
      if (state.activeId !== null) return state;
      return {
        messages: [
          ...state.messages,
          { id: action.questionId, role: 'user', text: action.question, state: 'complete', sources: [] },
          assistant(action.answerId),
        ],
        activeId: action.answerId,
        error: null,
        lastQuestion: action.question,
      };
    case 'retry': {
      if (state.activeId !== null || state.lastQuestion === null) return state;
      // The failed answer is replaced, not kept, so the transcript shows one attempt.
      const last = state.messages.at(-1);
      const kept = last?.state === 'error' ? state.messages.slice(0, -1) : state.messages;
      return { ...state, messages: [...kept, assistant(action.answerId)], activeId: action.answerId, error: null };
    }
    case 'token':
      return updateActive(state, (m) => ({ ...m, text: m.text + action.text }));
    case 'sources':
      return updateActive(state, (m) => ({ ...m, sources: action.items }));
    case 'refused':
      return updateActive(state, (m) => ({ ...m, refusal: { reason: action.reason, contact: action.contact } }));
    case 'done':
      return finish(state, 'complete');
    case 'stopped':
      return finish(state, 'stopped');
    case 'failed':
      if (state.activeId === null) return state;
      return { ...finish(state, 'error'), error: action.error };
  }
}
