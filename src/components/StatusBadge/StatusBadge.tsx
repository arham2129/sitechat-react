import type { ApiMode } from '../../api/client';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  mode: ApiMode;
}

export function StatusBadge({ mode }: StatusBadgeProps) {
  const live = mode === 'http';
  return (
    <span
      className={`${styles.badge} ${live ? styles.live : styles.demo}`}
      title={live ? 'Answers come from the SiteChat backend' : 'Answers come from a saved copy of aibitsoft.com'}
    >
      {live ? 'Live' : 'Demo data'}
    </span>
  );
}
