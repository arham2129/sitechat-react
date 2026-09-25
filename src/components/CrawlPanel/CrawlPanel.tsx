import type { CrawlBudget } from '../../api/types';
import type { CrawlJob } from '../../hooks/useCrawlJob';
import { useFocusWhenLost } from '../../hooks/useFocusWhenLost';
import { hostOf } from '../../lib/formatUrl';
import { Button } from '../Button/Button';
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
  onRestore: () => void;
}

function announcement(job: CrawlJob): string {
  const crawled = job.status?.pages_crawled ?? 0;
  if (job.phase === 'running') return 'Crawl started.';
  if (job.phase === 'done') return `Crawl finished. ${crawled} pages ready. You can ask questions now.`;
  if (job.phase === 'cancelled') return 'Crawl cancelled.';
  return '';
}

export function CrawlPanel({ job, defaultUrl, onStart, onCancel, onReset, onRestore }: CrawlPanelProps) {
  const { phase, previous } = job;
  const busy = phase === 'starting' || phase === 'running';
  const done = phase === 'done';
  // On "done" the composer takes focus instead (useComposer), since asking is next.
  const panelRef = useFocusWhenLost<HTMLElement>(busy ? 'busy' : phase, !done);
  const previousHost = previous?.url ? hostOf(previous.url) : null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      data-focus-fallback=""
      className={styles.panel}
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
          {phase === 'idle' && previousHost && (
            <div className={styles.notice}>
              <p>
                Your conversation about <span translate="no">{previousHost}</span> stays until you start a new crawl.
              </p>
              <Button variant="text" onClick={onRestore}>
                {/* One child, so Button's flex gap does not split the label. */}
                <span>
                  Back to <span translate="no">{previousHost}</span>
                </span>
              </Button>
            </div>
          )}
          {phase === 'cancelled' && (
            <p className={styles.notice}>
              Crawl cancelled at {job.status?.pages_crawled ?? 0} / {job.status?.max_pages ?? job.budget} pages.
            </p>
          )}
          {phase === 'error' && (
            <div className={styles.errorNotice} role="alert">
              <Icon name="alert" className={styles.noticeIcon} />
              <p>
                {job.error ?? 'The crawl failed.'} Check the address, then start the crawl again.
              </p>
            </div>
          )}
          <CrawlForm onStart={onStart} initialUrl={job.url ?? defaultUrl} initialBudget={job.budget ?? 20} />
        </>
      )}
    </section>
  );
}
