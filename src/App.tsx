import { useMemo } from 'react';
import { createClient } from './api/createClient';
import { ChatView } from './components/ChatView/ChatView';
import { CrawlPanel } from './components/CrawlPanel/CrawlPanel';
import { StatusBadge } from './components/StatusBadge/StatusBadge';
import { useCrawlJob } from './hooks/useCrawlJob';
import styles from './App.module.css';

const DEFAULT_URL = 'https://aibitsoft.com';

export function App() {
  // One client for the app's lifetime; the mock keeps its crawl jobs in memory.
  const client = useMemo(() => createClient(), []);
  const crawl = useCrawlJob(client);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.wordmark} translate="no">
            SiteChat
          </h1>
          <StatusBadge mode={client.mode} />
        </div>
      </header>
      <main className={styles.main}>
        <CrawlPanel
          job={crawl.job}
          defaultUrl={DEFAULT_URL}
          onStart={crawl.start}
          onCancel={crawl.cancel}
          onReset={crawl.reset}
          onRestore={crawl.restore}
        />
        {/* A new crawl remounts the chat, so an old conversation or stream can never leak into
            it; "Change site" alone keeps the key, so the conversation survives until then. */}
        <ChatView key={crawl.job.jobId ?? crawl.job.previous?.jobId ?? 'no-job'} client={client} job={crawl.job} />
      </main>
    </div>
  );
}
