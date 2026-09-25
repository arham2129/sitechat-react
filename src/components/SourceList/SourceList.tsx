import type { Source } from '../../api/types';
import { hostOf } from '../../lib/formatUrl';
import { Icon } from '../Icon/Icon';
import styles from './SourceList.module.css';

interface SourceListProps {
  sources: Source[];
}

// <details> gives the expand/collapse, keyboard support and aria-expanded natively,
// so the list needs no state of its own. Open by default: the sources are the point.
export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null;
  return (
    <details className={styles.details} open>
      <summary className={styles.summary}>
        Sources ({sources.length})
        <Icon name="chevron" className={styles.chevron} />
      </summary>
      <ul className={styles.list}>
        {sources.map((source) => (
          <li key={source.url}>
            <a className={styles.card} href={source.url} target="_blank" rel="noreferrer">
              <span className={styles.title}>{source.title}</span>
              <span className={styles.host} translate="no">
                {hostOf(source.url)}
              </span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
