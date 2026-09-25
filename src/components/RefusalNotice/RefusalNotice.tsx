import type { Contact } from '../../api/types';
import { Icon } from '../Icon/Icon';
import styles from './RefusalNotice.module.css';

interface RefusalNoticeProps {
  reason: string;
  contact: Contact;
}

// A refusal is the system working as designed (it will not guess), so it is styled
// as information, not as an error.
export function RefusalNotice({ reason, contact }: RefusalNoticeProps) {
  const links = [
    contact.email && { href: `mailto:${contact.email}`, label: contact.email },
    contact.phone && { href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`, label: contact.phone },
    contact.url && { href: contact.url, label: 'Contact page' },
  ].filter((link): link is { href: string; label: string } => Boolean(link));

  return (
    <div className={styles.notice}>
      <Icon name="info" className={styles.icon} />
      <div className={styles.body}>
        <p className={styles.reason}>{reason}</p>
        {links.length > 0 && (
          <>
            <p className={styles.lead}>You can ask the site owner directly:</p>
            <ul className={styles.links}>
              {links.map((link) => (
                <li key={link.href}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
