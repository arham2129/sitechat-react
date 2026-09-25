import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { isFocusLost, useFocusWhenLost } from './useFocusWhenLost';

interface ComposerOptions {
  onSend: (text: string) => void;
  /** False until the crawl is done. */
  enabled: boolean;
  isStreaming: boolean;
}

export function useComposer({ onSend, enabled, isStreaming }: ComposerOptions) {
  const [value, setValue] = useState('');
  // When the crawl finishes and the Cancel button disappears, asking is the next step.
  const inputRef = useFocusWhenLost<HTMLTextAreaElement>(enabled, enabled);
  const blocked = !enabled || isStreaming;
  const actionRef = useRef<HTMLButtonElement>(null);
  const canSend = !blocked && value.trim().length > 0;

  // When streaming ends, Stop turns back into Send, which is disabled while the field
  // is empty; a disabled button drops focus to <body>. Hand focus to the field instead
  // so a keyboard user keeps their place.
  const wasStreaming = useRef(isStreaming);
  useEffect(() => {
    const finished = wasStreaming.current && !isStreaming;
    wasStreaming.current = isStreaming;
    if (!finished) return;
    if (document.activeElement === actionRef.current || isFocusLost()) inputRef.current?.focus();
  }, [isStreaming, inputRef]);

  const send = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: Enter that confirms an IME candidate (Chinese, Japanese, Urdu
    // keyboards) must not send a half-typed question.
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    send();
  };

  return { value, setValue, canSend, onSubmit, onKeyDown, inputRef, actionRef };
}
