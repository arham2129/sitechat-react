import type { CrawlBudget } from '../../api/types';
import type { CrawlJob } from '../../hooks/useCrawlJob';
import { useFocusWhenLost } from '../../hooks/useFocusWhenLost';
import { Icon } from '../Icon/Icon';
import { CrawlForm } from './CrawlForm';
import { CrawlProgress } from './CrawlProgress';
import { CrawlSummary } from './CrawlSummary';
import styles from './CrawlPanel.module.css';

interface CrawlPanelProps {
  job: CrawlJob;
  defaultUrl: string;
  onStart: (url: string, budget: CrawlBudget) => void;
  onCancel: () => void;
  onReset: () => void;
}

function announcement(job: CrawlJob): string {
  const crawled = job.status?.pages_crawled ?? 0;
  if (job.phase === 'running') return 'Crawl started.';
  if (job.phase === 'done') return `Crawl finished. ${crawled} pages ready. You can ask questions now.`;
  if (job.phase === 'cancelled') return 'Crawl cancelled.';
  return '';
}

export function CrawlPanel({ job, defaultUrl, onStart, onCancel, onReset }: CrawlPanelProps) {
  const { phase } = job;
  const busy = phase === 'starting' || phase === 'running';
  const done = phase === 'done';
  // On "done" the composer takes focus instead (useComposer), since asking is next.
  const panelRef = useFocusWhenLost<HTMLElement>(busy ? 'busy' : phase, !done);

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      data-focus-fallback=""
      className={`${styles.panel} ${done ? styles.collapsed : ''}`}
      aria-labelledby="crawl-heading"
    >
      <h2 id="crawl-heading" className={done ? 'visually-hidden' : styles.heading}>
        Crawl a website
      </h2>
      {/* Progress ticks are not announced one by one; only phase changes are. */}
      <p role="status" className="visually-hidden">
        {announcement(job)}
      </p>

      {busy && <CrawlProgress job={job} onCancel={onCancel} />}
      {done && <CrawlSummary job={job} onReset={onReset} />}
      {!busy && !done && (
        <>
          {phase === 'cancelled' && (
            <p className={styles.notice}>
              Crawl cancelled at {job.status?.pages_crawled ?? 0} / {job.status?.max_pages ?? job.budget} pages.
            </p>
          )}
          {phase === 'error' && (
            <div className={styles.errorNotice} role="alert">
              <Icon name="alert" className={styles.noticeIcon} />
              <p>{job.error ?? 'The crawl failed.'}</p>
            </div>
          )}
          <CrawlForm onStart={onStart} initialUrl={job.url ?? defaultUrl} initialBudget={job.budget ?? 20} />
        </>
      )}
    </section>
  );
}
