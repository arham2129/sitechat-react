import { useAutoScroll } from '../../hooks/useAutoScroll';
import type { ChatMessage } from '../../state/chatReducer';
import { Message } from '../Message/Message';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  error: string | null;
  onRetry: () => void;
}

export function MessageList({ messages, error, onRetry }: MessageListProps) {
  const last = messages.at(-1);
  // Scroll on every token too, so a long answer does not stream below the fold.
  const endRef = useAutoScroll<HTMLLIElement>(`${messages.length}:${last?.text.length ?? 0}:${last?.state}`);

  return (
    <ol className={styles.list} aria-label="Conversation">
      {messages.map((message) => {
        const retryable = message === last && message.state === 'error';
        return (
          <li key={message.id} className={styles.item}>
            <Message message={message} error={retryable ? error : null} onRetry={retryable ? onRetry : undefined} />
          </li>
        );
      })}
      <li ref={endRef} className={styles.end} aria-hidden="true" />
    </ol>
  );
}
