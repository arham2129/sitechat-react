import { useEffect, useRef } from 'react';

// Keeps the newest message in view while an answer streams in. Jumps rather than
// smooth-scrolls: the motion budget is low and a smooth scroll per token would lag.
export function useAutoScroll<T extends HTMLElement>(trigger: unknown) {
  const endRef = useRef<T>(null);

  useEffect(() => {
    // jsdom has no scrollIntoView; guard so component tests do not need to stub it.
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [trigger]);

  return endRef;
}
