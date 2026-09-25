import type { CrawlJob } from '../../hooks/useCrawlJob';
import { hostOf } from '../../lib/formatUrl';
import { Button } from '../Button/Button';
import styles from './CrawlSummary.module.css';

interface CrawlSummaryProps {
  job: CrawlJob;
  onReset: () => void;
}

export function CrawlSummary({ job, onReset }: CrawlSummaryProps) {
  const crawled = job.status?.pages_crawled ?? 0;
  const max = job.status?.max_pages;
  const host = job.url ? hostOf(job.url) : '';

  return (
    <div className={styles.summary}>
      <div className={styles.info}>
        <p className={styles.host} title={host} translate="no">
          {host}
        </p>
        <p className={styles.meta}>
          <span className={styles.ready}>
            <span className={styles.readyDot} aria-hidden="true" />
            Ready
          </span>
          <span className={styles.count}>
            {crawled} {crawled === 1 ? 'page' : 'pages'}
          </span>
        </p>
      </div>
      {max !== undefined && crawled < max && (
        <p className={styles.hint}>The site had no more pages to crawl within the {max}-page budget.</p>
      )}
      <Button onClick={onReset} className={styles.action}>
        Change site
      </Button>
    </div>
  );
}
