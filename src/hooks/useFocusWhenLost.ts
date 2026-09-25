import { useEffect, useRef } from 'react';

// When the focused control unmounts (Start becomes a progress bar, Stop becomes a
// disabled Send), the browser drops focus to <body> and keyboard and screen-reader
// users lose their place. This hands focus to `ref` on each change of `key`, but only
// if focus was lost (on <body>, or parked on a [data-focus-fallback] container this
// hook moved it to earlier), and never on first render.
export function isFocusLost(): boolean {
  const current = document.activeElement;
  return current === null || current === document.body || current.hasAttribute('data-focus-fallback');
}

export function useFocusWhenLost<T extends HTMLElement>(key: unknown, active = true) {
  const ref = useRef<T>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (active && isFocusLost()) ref.current?.focus();
  }, [key, active]);

  return ref;
}
