import { useComposer } from '../../hooks/useComposer';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './Composer.module.css';

interface ComposerProps {
  /** False until the crawl has finished. */
  enabled: boolean;
  isStreaming: boolean;
  placeholder: string;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ enabled, isStreaming, placeholder, onSend, onStop }: ComposerProps) {
  const { value, setValue, canSend, onSubmit, onKeyDown, inputRef, actionRef } = useComposer({
    onSend,
    enabled,
    isStreaming,
  });

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor="composer-input" className="visually-hidden">
        Question
      </label>
      <div className={styles.row}>
        <textarea
          ref={inputRef}
          id="composer-input"
          name="question"
          autoComplete="off"
          className={styles.input}
          rows={1}
          value={value}
          placeholder={placeholder}
          disabled={!enabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          aria-describedby="composer-hint"
        />
        {/* One button element that switches role, so React keeps the same DOM node. */}
        {isStreaming ? (
          <Button ref={actionRef} onClick={onStop}>
            <Icon name="stop" />
            Stop
          </Button>
        ) : (
          <Button
            ref={actionRef}
            type="submit"
            variant="primary"
            iconOnly
            aria-label="Send"
            disabled={!canSend}
          >
            <Icon name="send" />
          </Button>
        )}
      </div>
      <p id="composer-hint" className={styles.hint}>
        {enabled ? 'Enter to send, Shift\u00A0+\u00A0Enter for a new line.' : 'Questions unlock when the crawl finishes.'}
      </p>
    </form>
  );
}
