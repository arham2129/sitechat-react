import type { Source } from '../../api/types';
import { hostOf } from '../../lib/formatUrl';
import { Icon } from '../Icon/Icon';
import styles from './SourceList.module.css';

interface SourceListProps {
  sources: Source[];
}

// <details> gives the expand/collapse, keyboard support and aria-expanded natively,
// so the list needs no state of its own.
export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        Sources ({sources.length})
        <Icon name="chevron" className={styles.chevron} />
      </summary>
      <ul className={styles.list}>
        {sources.map((source) => (
          <li key={source.url} className={styles.item}>
            <a className={styles.link} href={source.url} target="_blank" rel="noreferrer">
              {source.title}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <span className={styles.host} translate="no">
              {hostOf(source.url)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
