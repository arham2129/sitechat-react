import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { SiteChatClient } from '../api/client';
import type { ChatEvent } from '../api/types';
import { chatReducer, initialChatState, type ChatAction } from '../state/chatReducer';

function toAction(event: ChatEvent): ChatAction {
  return event.type === 'done' ? { type: 'done' } : event;
}

// Remount (key by jobId) to start a fresh conversation for a new crawl; the hook
// deliberately has no reset so a stale stream can never write into a new chat.
export function useChatStream(client: SiteChatClient, jobId: string | null) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const controllerRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const newId = () => `m${++nextId.current}`;

  const run = useCallback(
    async (question: string) => {
      if (!jobId) return;
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        for await (const event of client.ask(question, jobId, controller.signal)) {
          dispatch(toAction(event));
        }
        dispatch({ type: 'done' });
      } catch (error) {
        if (controller.signal.aborted) dispatch({ type: 'stopped' });
        else dispatch({ type: 'failed', error: error instanceof Error ? error.message : 'Request failed' });
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [client, jobId],
  );

  const isStreaming = state.activeId !== null;

  const ask = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || isStreaming || !jobId) return;
      dispatch({ type: 'ask', question, questionId: newId(), answerId: newId() });
      void run(question);
    },
    [isStreaming, jobId, run],
  );

  const retry = useCallback(() => {
    if (isStreaming || state.lastQuestion === null) return;
    dispatch({ type: 'retry', answerId: newId() });
    void run(state.lastQuestion);
  }, [isStreaming, run, state.lastQuestion]);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  return { ...state, isStreaming, ask, retry, stop };
}
