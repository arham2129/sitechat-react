import type { CrawlJob } from '../../hooks/useCrawlJob';
import { displayUrl, hostOf } from '../../lib/formatUrl';
import { Button } from '../Button/Button';
import styles from './CrawlProgress.module.css';

interface CrawlProgressProps {
  job: CrawlJob;
  onCancel: () => void;
}

export function CrawlProgress({ job, onCancel }: CrawlProgressProps) {
  const crawled = job.status?.pages_crawled ?? 0;
  const max = job.status?.max_pages ?? job.budget ?? 0;
  const currentUrl = job.status?.current_url;

  return (
    <div className={styles.progress}>
      <p className={styles.title}>
        {job.phase === 'starting' ? 'Starting crawl of ' : 'Crawling '}
        <span className={styles.host} translate="no">
          {job.url ? hostOf(job.url) : ''}
        </span>
        …
      </p>
      {/* The count is the accessible source of truth for the bar, so it never truncates. */}
      <p className={styles.count}>
        <span className={styles.crawled}>{crawled}</span> / {max} pages
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Crawl progress"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={crawled}
        aria-valuetext={`${crawled} of ${max} pages`}
      >
        <div className={styles.fill} style={{ transform: `scaleX(${max ? crawled / max : 0})` }} />
      </div>
      {currentUrl && (
        <p className={styles.currentUrl} title={currentUrl} translate="no">
          {displayUrl(currentUrl)}
        </p>
      )}
      <Button onClick={onCancel} className={styles.cancel}>
        Cancel crawl
      </Button>
    </div>
  );
}
