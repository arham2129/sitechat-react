import type { ChatMessage } from '../../state/chatReducer';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { RefusalNotice } from '../RefusalNotice/RefusalNotice';
import { SourceList } from '../SourceList/SourceList';
import styles from './Message.module.css';

interface MessageProps {
  message: ChatMessage;
  /** Shown only on the failed answer that Retry would replace. */
  error?: string | null;
  onRetry?: () => void;
}

export function Message({ message, error, onRetry }: MessageProps) {
  if (message.role === 'user') {
    return (
      <div className={styles.user}>
        <p className={styles.text}>{message.text}</p>
      </div>
    );
  }

  const streaming = message.state === 'streaming';
  const waiting = streaming && message.text === '' && !message.refusal;

  return (
    // aria-busy holds screen-reader announcements until the answer finishes, so the
    // live region reads it once instead of token by token.
    <div className={styles.assistant} aria-live="polite" aria-busy={streaming}>
      {waiting && (
        <p className={styles.waiting}>
          <span className={styles.skeleton} aria-hidden="true" />
          Searching the crawled pages…
        </p>
      )}
      {message.text && (
        <p className={styles.text}>
          {message.text}
          {streaming && <span className={styles.caret} aria-hidden="true" />}
        </p>
      )}
      {message.refusal && <RefusalNotice reason={message.refusal.reason} contact={message.refusal.contact} />}
      {message.state === 'stopped' && <p className={styles.note}>Stopped before the answer finished.</p>}
      {message.state === 'error' && (
        <div className={styles.error} role="alert">
          <Icon name="alert" className={styles.errorIcon} />
          <p className={styles.errorText}>{error ? `No answer: ${error}. Check your connection, then retry.` : 'This answer failed.'}</p>
          {onRetry && (
            <Button onClick={onRetry} className={styles.retry}>
              <Icon name="retry" />
              Retry
            </Button>
          )}
        </div>
      )}
      {message.state === 'complete' && <SourceList sources={message.sources} />}
    </div>
  );
}
