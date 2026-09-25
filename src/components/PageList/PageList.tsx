import type { CrawledPage } from '../../api/types';
import styles from './PageList.module.css';

interface PageListProps {
  /** Undefined when the backend does not report pages; the list is then not shown. */
  pages: CrawledPage[] | undefined;
  /** True while the crawl runs, so the list is marked busy and grows as pages arrive. */
  live: boolean;
}

function pathOf(url: string): string {
  try {
    const { pathname, search } = new URL(url);
    return `${pathname}${search}` || '/';
  } catch {
    return url;
  }
}

export function PageList({ pages, live }: PageListProps) {
  if (!pages || pages.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="pages-heading">
      <h2 id="pages-heading" className={styles.heading}>
        Crawled pages <span className={styles.count}>{pages.length}</span>
      </h2>
      <ol className={styles.list} aria-busy={live}>
        {pages.map((page) => (
          <li key={page.url}>
            <a className={styles.link} href={page.url} target="_blank" rel="noreferrer">
              <span className={styles.title}>{page.title}</span>
              <span className={styles.path} translate="no">
                {pathOf(page.url)}
              </span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
