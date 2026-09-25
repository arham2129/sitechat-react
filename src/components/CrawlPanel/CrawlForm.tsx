import type { CrawlBudget } from '../../api/types';
import { useCrawlForm } from '../../hooks/useCrawlForm';
import { BudgetPicker } from '../BudgetPicker/BudgetPicker';
import { Button } from '../Button/Button';
import styles from './CrawlForm.module.css';

interface CrawlFormProps {
  onStart: (url: string, budget: CrawlBudget) => void;
  initialUrl: string;
  initialBudget: CrawlBudget;
}

export function CrawlForm({ onStart, initialUrl, initialBudget }: CrawlFormProps) {
  const form = useCrawlForm(onStart, initialUrl, initialBudget);
  const errorId = 'crawl-url-error';

  return (
    <form className={styles.form} onSubmit={form.submit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="crawl-url">
          Website address
        </label>
        <input
          id="crawl-url"
          className={styles.input}
          type="url"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          value={form.url}
          onChange={(event) => form.setUrl(event.target.value)}
          aria-invalid={form.error !== null}
          aria-describedby={form.error ? errorId : 'crawl-url-hint'}
        />
        {form.error ? (
          <p id={errorId} className={styles.error}>
            {form.error}
          </p>
        ) : (
          <p id="crawl-url-hint" className={styles.hint}>
            Starts with http:// or https://
          </p>
        )}
      </div>

      <div className={styles.field}>
        <span id="budget-label" className={styles.label}>
          Pages to crawl
        </span>
        <BudgetPicker value={form.budget} onChange={form.setBudget} labelledBy="budget-label" />
      </div>

      <Button type="submit" variant="primary">
        Start crawl
      </Button>
    </form>
  );
}
