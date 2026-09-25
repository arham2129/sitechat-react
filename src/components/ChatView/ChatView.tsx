import type { SiteChatClient } from '../../api/client';
import type { CrawlJob } from '../../hooks/useCrawlJob';
import { useChatStream } from '../../hooks/useChatStream';
import { hostOf } from '../../lib/formatUrl';
import { suggestQuestions } from '../../lib/suggestQuestions';
import { Composer } from '../Composer/Composer';
import { MessageList } from '../MessageList/MessageList';
import { SuggestedQuestions } from '../SuggestedQuestions/SuggestedQuestions';
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
  const empty = chat.messages.length === 0;
  const crawling = job.phase === 'starting' || job.phase === 'running';

  return (
    <section className={styles.chat} aria-labelledby="chat-heading">
      <h2 id="chat-heading" className="visually-hidden">
        Chat
      </h2>
      <div className={`${styles.scroll} ${empty ? styles.centred : ''}`}>
        <div className={styles.column}>
          {!empty ? (
            <MessageList messages={chat.messages} error={chat.error} onRetry={chat.retry} />
          ) : ready ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                Ask about <span translate="no">{host}</span>
              </p>
              <p className={styles.emptyText}>
                Answers come only from the {pages} crawled pages, with their sources. If the pages do not cover a
                question, SiteChat says so instead of guessing.
              </p>
              <SuggestedQuestions questions={suggestQuestions(job.status?.pages ?? [])} onPick={chat.ask} />
            </div>
          ) : crawling ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                Reading <span translate="no">{host}</span>…
              </p>
              <p className={styles.emptyText}>
                Questions unlock as soon as the crawl finishes.
              </p>
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Crawl a site to start</p>
              <p className={styles.emptyText}>
                Enter a website address and start a crawl. Questions unlock as soon as it finishes, and every
                answer links back to the pages it came from.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className={styles.dock}>
        <div className={styles.column}>
          <Composer
            enabled={ready}
            isStreaming={chat.isStreaming}
            placeholder={ready ? `Ask about ${host}…` : 'Start a crawl first…'}
            onSend={chat.ask}
            onStop={chat.stop}
          />
        </div>
      </div>
    </section>
  );
}
