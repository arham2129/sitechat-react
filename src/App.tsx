import { useMemo } from 'react';
import { createClient } from './api/createClient';
import { ChatView } from './components/ChatView/ChatView';
import { CrawlPanel } from './components/CrawlPanel/CrawlPanel';
import { PageList } from './components/PageList/PageList';
import { StatusBadge } from './components/StatusBadge/StatusBadge';
import { useCrawlJob } from './hooks/useCrawlJob';
import styles from './App.module.css';

const DEFAULT_URL = 'https://aibitsoft.com';

export function App() {
  // One client for the app's lifetime; the mock keeps its crawl jobs in memory.
  const client = useMemo(() => createClient(), []);
  const crawl = useCrawlJob(client);
  const done = crawl.job.phase === 'done';

  return (
    <div className={styles.app}>
      <aside className={`${styles.sidebar} ${done ? styles.sidebarDone : ''}`} aria-label="Website">
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          <h1 className={styles.wordmark} translate="no">
            SiteChat
          </h1>
          <StatusBadge mode={client.mode} />
        </div>
        <div className={styles.sidebarBody}>
          <CrawlPanel
            job={crawl.job}
            defaultUrl={DEFAULT_URL}
            onStart={crawl.start}
            onCancel={crawl.cancel}
            onReset={crawl.reset}
            onRestore={crawl.restore}
          />
          <PageList pages={crawl.job.status?.pages} live={crawl.job.phase === 'running'} />
        </div>
      </aside>
      <main className={styles.main}>
        {/* A new crawl remounts the chat, so an old conversation or stream can never leak into
            it; "Change site" alone keeps the key, so the conversation survives until then. */}
        <ChatView key={crawl.job.jobId ?? crawl.job.previous?.jobId ?? 'no-job'} client={client} job={crawl.job} />
      </main>
    </div>
  );
}
