import type { SiteChatClient } from '../../api/client';
import type { CrawlJob } from '../../hooks/useCrawlJob';
import { useChatStream } from '../../hooks/useChatStream';
import { hostOf } from '../../lib/formatUrl';
import { Composer } from '../Composer/Composer';
import { MessageList } from '../MessageList/MessageList';
import styles from './ChatView.module.css';

interface ChatViewProps {
  client: SiteChatClient;
  job: CrawlJob;
}

export function ChatView({ client, job }: ChatViewProps) {
  const ready = job.phase === 'done' && job.jobId !== null;
  const chat = useChatStream(client, ready ? job.jobId : null);
  const host = job.url ? hostOf(job.url) : 'the site';
  const pages = job.status?.pages_crawled ?? 0;

  return (
    <section className={styles.chat} aria-labelledby="chat-heading">
      <h2 id="chat-heading" className="visually-hidden">
        Chat
      </h2>
      <div className={styles.scroll}>
        {chat.messages.length > 0 ? (
          <MessageList messages={chat.messages} error={chat.error} onRetry={chat.retry} />
        ) : ready ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Ask about {host}</p>
            <p className={styles.emptyText}>
              Answers come only from the {pages} crawled pages, with their sources. If the pages do not cover a
              question, SiteChat says so instead of guessing.
            </p>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Crawl a site to start</p>
            <p className={styles.emptyText}>
              Enter a website address in the crawl panel and start a crawl. You can ask questions once it finishes.
            </p>
          </div>
        )}
      </div>
      <Composer
        enabled={ready}
        isStreaming={chat.isStreaming}
        placeholder={ready ? `Ask about ${host}…` : 'Start a crawl first…'}
        onSend={chat.ask}
        onStop={chat.stop}
      />
    </section>
  );
}
